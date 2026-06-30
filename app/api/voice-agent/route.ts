import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

// Navigation automatique par intention — routes réelles du projet
const INTENT_ROUTES: Record<string, string> = {
  DEMANDE_ACTE_NAISSANCE: '/demande-extrait',
  DEMANDE_ACTE_MARIAGE: '/demande-extrait',
  DEMANDE_ACTE_DECES: '/demande-extrait',
  DECLARATION_NAISSANCE: '/citoyen/declaration-naissance',
  RESERVATION_MARIAGE: '/citoyen/reservation-mariage',
  AVIS_MENTION: '/citoyen/avis-mention',
  STATUT_DEMANDE: '/suivi',
}

// Réponses locales pour questions fréquentes — zéro appel API
const LOCAL_RESPONSES: Record<string, string> = {
  SALUTATION: 'Bonjour ! Je suis MaMairie IA, votre assistant d\'état civil. Comment puis-je vous aider aujourd\'hui ?',
  DEMANDE_ACTE_NAISSANCE: 'Pour un extrait de naissance, rendez-vous dans la section "Demandes" de votre espace citoyen. Vous aurez besoin de votre numéro CNI et des informations de l\'acte.',
  DEMANDE_ACTE_MARIAGE: 'Pour un extrait de mariage, accédez à la section "Demandes" et choisissez "Acte de mariage". Munissez-vous de votre CNI.',
  DEMANDE_ACTE_DECES: 'Pour un acte de décès, allez dans "Demandes" et sélectionnez "Acte de décès". Le lien de parenté avec le défunt sera demandé.',
  STATUT_DEMANDE: 'Pour suivre votre demande, utilisez votre code de suivi dans la section "Suivi de demande" de votre espace citoyen.',
  DECLARATION_NAISSANCE: 'Pour déclarer une naissance, rendez-vous dans "Déclaration de naissance" depuis votre tableau de bord. La déclaration doit être faite dans les 5 jours suivant la naissance.',
  RESERVATION_MARIAGE: 'Pour réserver une date de mariage, accédez à "Réservation Mariage" depuis votre espace citoyen. La date doit être au moins 3 mois à l\'avance.',
  AVIS_MENTION: 'Pour un avis de mention, accédez à la section correspondante dans votre espace citoyen et suivez les étapes indiquées.',
  AIDE_DOCUMENTS: 'Pour toute demande, vous aurez besoin de votre CNI originale, un extrait de naissance, et une photo d\'identité récente.',
  AU_REVOIR: 'Au revoir ! N\'hésitez pas à revenir si vous avez d\'autres questions. Bonne journée !',
  QUESTION_GENERALE: 'Je suis là pour vous aider avec vos démarches d\'état civil en Côte d\'Ivoire. Dites-moi ce dont vous avez besoin.',
}

export async function POST(req: NextRequest) {
  try {
    const { message, conversationHistory, userContext, intent, isMobile } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message vide' }, { status: 400 })
    }

    // Consultation statut réel si STATUT_DEMANDE et userId disponible
    if (intent === 'STATUT_DEMANDE' && userContext?.userId) {
      try {
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        const { data: demandes } = await supabase
          .from('requests')
          .select('type_acte, statut, code_suivi, created_at')
          .eq('user_id', userContext.userId)
          .order('created_at', { ascending: false })
          .limit(3)

        if (demandes && demandes.length > 0) {
          const derniere = demandes[0]
          const statutTexte = derniere.statut === 'validee' ? 'validée ✅' :
            derniere.statut === 'en_attente' ? 'en attente ⏳' :
            derniere.statut === 'rejetee' ? 'rejetée ❌' : derniere.statut
          const reply = `Votre dernière demande d'${derniere.type_acte} (code ${derniere.code_suivi}) est ${statutTexte}. Vous avez ${demandes.length} demande(s) au total.`
          return NextResponse.json({ reply, intent, action: INTENT_ROUTES[intent] })
        }
      } catch (e) {
        console.error('[Supabase] Erreur consultation statut:', e)
      }
    }

    // Salutation personnalisée avec prénom — pas besoin de Groq
    if (intent === 'SALUTATION') {
      const prenom = userContext?.prenom || ''
      const reply = prenom
        ? `Bonjour ${prenom} ! Je suis MaMairie IA, votre assistante d'état civil. Comment puis-je vous aider aujourd'hui ?`
        : `Bonjour ! Je suis MaMairie IA, votre assistante d'état civil. Comment puis-je vous aider ?`
      return NextResponse.json({ reply, intent })
    }

    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) {
      const prenom = userContext?.prenom || ''
      const fallback = prenom
        ? `${prenom}, je peux vous aider avec vos démarches d'état civil. Dites-moi ce dont vous avez besoin.`
        : LOCAL_RESPONSES.QUESTION_GENERALE
      return NextResponse.json({ reply: fallback, intent })
    }

    // Construire le résumé des données du citoyen
    const resumeDemandes = userContext?.demandes?.length > 0
      ? userContext.demandes.map((d: any) =>
          `• ${d.type_acte} — ${d.statut}${d.code_suivi ? ` (${d.code_suivi})` : ''}`
        ).join('\n')
      : 'Aucune demande d\'extrait'

    const resumeDeclarations = userContext?.declarations?.length > 0
      ? userContext.declarations.map((d: any) =>
          `• Déclaration naissance — ${d.statut}${d.code_suivi ? ` (${d.code_suivi})` : ''}`
        ).join('\n')
      : 'Aucune déclaration'

    const resumeReservations = userContext?.reservations?.length > 0
      ? userContext.reservations.map((r: any) =>
          `• Réservation mariage — ${r.statut} — date souhaitée : ${r.date_mariage_souhaitee || 'non définie'}`
        ).join('\n')
      : 'Aucune réservation mariage'

    const resumeNotifications = userContext?.notifications?.length > 0
      ? userContext.notifications.map((n: any) =>
          `• ${n.titre} : ${n.message}`
        ).join('\n')
      : 'Aucune nouvelle notification'

    const systemPrompt = `
Tu es MaMairie IA, l'assistant vocal officiel de la plateforme d'état civil numérique de la République de Côte d'Ivoire.

TON RÔLE :
Aider les citoyens ivoiriens à gérer leur espace citoyen en parlant naturellement en français.

TU PEUX AIDER AVEC :
1. Lire et résumer les demandes en cours, leur statut, leur code de suivi
2. Lire les notifications non lues
3. Vérifier les déclarations de naissance et leur avancement
4. Vérifier les réservations de mariage
5. Démarrer une nouvelle demande d'extrait → /demande-extrait
6. Déclarer une naissance → /citoyen/declaration-naissance
7. Réserver un mariage → /citoyen/reservation-mariage
8. Consulter les avis de mention → /citoyen/avis-mention
9. Expliquer les documents nécessaires et les délais

TU NE PEUX PAS :
- Modifier, approuver ou rejeter des actes officiels
- Accéder aux données d'autres citoyens

RÈGLES DE RÉPONSE :
- ${isMobile ? 'MOBILE : MAXIMUM 1 à 2 phrases TRÈS courtes. Sois ultra-concis.' : 'MAXIMUM 3 phrases courtes et claires.'}
- Parle comme si tu étais au téléphone — simple et direct
- Si tu lis des données, cite-les précisément (statut, code, date)
- Mentionne le prénom du citoyen une seule fois

ESPACE CITOYEN DE ${userContext?.prenom || 'ce citoyen'} ${userContext?.nom || ''} :
Commune : ${userContext?.commune || 'Non renseignée'}

📋 DEMANDES D'EXTRAITS (${userContext?.demandes?.length || 0}) :
${resumeDemandes}

👶 DÉCLARATIONS DE NAISSANCE (${userContext?.declarations?.length || 0}) :
${resumeDeclarations}

💍 RÉSERVATIONS MARIAGE (${userContext?.reservations?.length || 0}) :
${resumeReservations}

🔔 NOTIFICATIONS NON LUES (${userContext?.notifications?.length || 0}) :
${resumeNotifications}

Intention détectée : ${intent || 'QUESTION_GENERALE'}
`

    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          ...(conversationHistory || []).map((h: any) => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts?.[0]?.text || ''
          })),
          { role: 'user', content: message }
        ],
        max_tokens: 250,
        temperature: 0.7
      })
    })

    console.log(`[Groq] llama-3.3-70b → ${groqResponse.status}`)

    if (!groqResponse.ok) {
      const errText = await groqResponse.text()
      console.warn(`[Groq] Erreur ${groqResponse.status} — fallback local:`, errText.slice(0, 200))
      const prenom = userContext?.prenom || ''
      const fallbackReply = prenom
        ? `${prenom}, je rencontre un problème technique. Essayez de reformuler votre question.`
        : `Je rencontre un problème technique. Essayez de reformuler votre question.`
      return NextResponse.json({ reply: fallbackReply, intent, local: true })
    }

    const data = await groqResponse.json()
    const reply = data?.choices?.[0]?.message?.content?.trim()

    if (!reply) {
      return NextResponse.json({ reply: LOCAL_RESPONSES.QUESTION_GENERALE, intent })
    }

    console.log(`[Groq] OK — ${reply.slice(0, 80)}...`)
    return NextResponse.json({ reply, intent })

  } catch (error: any) {
    console.error('Erreur voice-agent API:', error?.message || error)
    return NextResponse.json({ reply: LOCAL_RESPONSES.QUESTION_GENERALE, intent: 'QUESTION_GENERALE', local: true })
  }
}
