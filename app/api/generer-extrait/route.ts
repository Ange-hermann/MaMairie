import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateExtraitPDF } from '@/lib/pdfGenerator'
import { logAgent } from '@/lib/auditHelpers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Récupérer l'agent connecté
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
    }

    const { data: agent } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    const { demandeId } = await request.json()

    if (!demandeId) {
      return NextResponse.json(
        { error: 'ID de demande requis' },
        { status: 400 }
      )
    }

    // Récupérer la demande
    const { data: demande, error: demandeError } = await supabase
      .from('requests')
      .select('*, users!requests_user_id_fkey(nom, prenom, email), mairies(nom_mairie, ville)')
      .eq('id', demandeId)
      .single()

    if (demandeError || !demande) {
      return NextResponse.json(
        { error: 'Demande introuvable' },
        { status: 404 }
      )
    }

    // Récupérer l'acte correspondant si le numéro est fourni
    let acteData = null
    if (demande.numero_acte) {
      const tableName = demande.type_acte === 'naissance' ? 'naissances' :
                        demande.type_acte === 'mariage' ? 'mariages' : 'deces'
      
      const { data: acte } = await supabase
        .from(tableName)
        .select('*')
        .eq('numero_acte', demande.numero_acte)
        .single()

      acteData = acte
    }

    // Générer le PDF avec QR Code
    const pdfBuffer = await generateExtraitPDF({
      type: demande.type_acte,
      numero_acte: demande.numero_acte,
      nom: demande.nom,
      prenom: demande.prenom,
      date_naissance: demande.date_naissance,
      lieu_naissance: demande.lieu_naissance,
      nom_pere: demande.nom_pere,
      nom_mere: demande.nom_mere,
      date_mariage: demande.date_mariage,
      lieu_mariage: demande.lieu_mariage,
      nom_conjoint: demande.nom_conjoint,
      prenom_conjoint: demande.prenom_conjoint,
      date_deces: demande.date_deces,
      lieu_deces: demande.lieu_deces,
      mairie: demande.mairies?.nom_mairie || 'Mairie',
      ville: demande.mairies?.ville || '',
      acteData: acteData
    })

    // Uploader le PDF sur Supabase Storage
    const fileName = `extrait-${demande.type_acte}-${demande.numero_acte}-${Date.now()}.pdf`
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('demandes-documents')
      .upload(fileName, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      })

    if (uploadError) {
      console.error('Erreur upload:', uploadError)
      return NextResponse.json(
        { error: `Erreur lors de l'upload du PDF: ${uploadError.message}` },
        { status: 500 }
      )
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('demandes-documents')
      .getPublicUrl(fileName)

    // Mettre à jour la demande avec l'URL du PDF généré
    await supabase
      .from('requests')
      .update({
        pdf_url: publicUrl,
        pdf_name: fileName,
        statut: 'approuvee'
      })
      .eq('id', demandeId)

    // ✅ Logger la génération du PDF
    await logAgent(
      'PDF_GENERE',
      {
        id: agent.id,
        email: agent.email,
        nom: `${agent.prenom} ${agent.nom}`
      },
      {
        type: `extrait_${demande.type_acte}`,
        id: demandeId,
        reference: demande.numero_acte
      },
      undefined, // avant
      undefined, // apres
      request,
      {
        type_acte: demande.type_acte,
        numero_acte: demande.numero_acte,
        pdf_url: publicUrl,
        agent_id: agent.id
      }
    )

    return NextResponse.json({
      success: true,
      pdfUrl: publicUrl,
      fileName: fileName
    })

  } catch (error: any) {
    console.error('Erreur génération PDF:', error)
    return NextResponse.json(
      { error: error.message || 'Erreur serveur' },
      { status: 500 }
    )
  }
}
