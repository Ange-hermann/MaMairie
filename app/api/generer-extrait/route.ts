import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { generateExtraitPDF } from '@/lib/pdfGenerator'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
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
      .from('documents')
      .upload(`extraits/${fileName}`, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: false
      })

    if (uploadError) {
      console.error('Erreur upload:', uploadError)
      return NextResponse.json(
        { error: 'Erreur lors de l\'upload du PDF' },
        { status: 500 }
      )
    }

    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(`extraits/${fileName}`)

    // Mettre à jour la demande avec l'URL du PDF
    await supabase
      .from('requests')
      .update({
        document_url: publicUrl,
        document_name: fileName,
        statut: 'approuvee'
      })
      .eq('id', demandeId)

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
