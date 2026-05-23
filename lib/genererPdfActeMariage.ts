// Génération PDF Acte de Mariage
// Basé sur le modèle officiel de Côte d'Ivoire

import jsPDF from 'jspdf'
import QRCode from 'qrcode'

interface ActeMariageData {
  numero_acte: string
  date_acte: string
  nom_epoux: string
  prenom_epoux: string
  date_naissance_epoux: string
  nationalite_epoux: string
  profession_epoux: string
  domicile_epoux: string
  nom_epouse: string
  prenom_epouse: string
  date_naissance_epouse: string
  nationalite_epouse: string
  profession_epouse: string
  domicile_epouse: string
  date_mariage: string
  lieu_mariage: string
  temoin1_nom: string
  temoin1_prenom: string
  temoin1_profession: string
  temoin1_domicile: string
  temoin2_nom: string
  temoin2_prenom: string
  temoin2_profession: string
  temoin2_domicile: string
  mairie: {
    nom: string
    commune: string
    district: string
  }
  officier: {
    nom: string
    prenom: string
    fonction: string
  }
}

export async function genererPdfActeMariage(data: ActeMariageData): Promise<Blob> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = 210
  const pageHeight = 297
  const margin = 25
  const rightMargin = pageWidth - margin

  // En-tête République
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('REPUBLIQUE DE COTE D\'IVOIRE', pageWidth / 2, 25, { align: 'center' })
  
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Union - Discipline - Travail', pageWidth / 2, 31, { align: 'center' })

  // Ligne de séparation
  doc.setLineWidth(0.5)
  doc.line(margin + 30, 34, rightMargin - 30, 34)

  // District et Mairie
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text(data.mairie.district.toUpperCase(), pageWidth / 2, 42, { align: 'center' })
  doc.text(`MAIRIE DE LA COMMUNE DE ${data.mairie.commune.toUpperCase()}`, pageWidth / 2, 48, { align: 'center' })
  doc.text('SERVICE DE L\'ETAT CIVIL', pageWidth / 2, 54, { align: 'center' })

  // Titre ACTE DE MARIAGE
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ACTE DE MARIAGE', pageWidth / 2, 66, { align: 'center' })

  // Numéro et Date
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const numY = 75
  doc.text(`N° ${data.numero_acte}`, margin, numY)
  doc.line(margin + 40, numY, rightMargin - 50, numY)
  doc.text(`Le ${data.date_acte}`, rightMargin, numY, { align: 'right' })

  // Texte d'introduction
  let y = 85
  doc.setFontSize(9)
  const introText = `L'an deux mille vingt-quatre et le ${data.date_mariage}, à dix heures, par-devant nous, ${data.officier.prenom.toUpperCase()} ${data.officier.nom.toUpperCase()}, ${data.officier.fonction}, Officier de l'État Civil de la Commune de ${data.mairie.commune}, ont comparu en mairie aux fins de contracter mariage :`
  
  const splitIntro = doc.splitTextToSize(introText, rightMargin - margin)
  doc.text(splitIntro, margin, y)
  y += splitIntro.length * 5

  // Fonction pour dessiner une ligne de tableau
  const drawTableLine = (label: string, value: string, yPos: number) => {
    doc.setFontSize(9)
    doc.text(label, margin, yPos)
    doc.text(':', margin + 50, yPos)
    doc.text(value, margin + 55, yPos)
    doc.line(margin + 53, yPos + 1, rightMargin, yPos + 1)
    return yPos + 6
  }

  // L'EPOUX
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('L\'EPOUX', pageWidth / 2, y, { align: 'center' })
  
  y += 7
  doc.setFont('helvetica', 'normal')
  y = drawTableLine('Nom et prénoms', `${data.nom_epoux.toUpperCase()} ${data.prenom_epoux}`, y)
  y = drawTableLine('Date et lieu de naissance', data.date_naissance_epoux, y)
  y = drawTableLine('Profession', data.profession_epoux, y)
  y = drawTableLine('Domicile', data.domicile_epoux, y)
  y = drawTableLine('Nationalité', data.nationalite_epoux, y)
  y = drawTableLine('Fils de', `${data.nom_epoux} (père) et de ${data.nom_epoux} (mère)`, y)

  // L'EPOUSE
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('L\'EPOUSE', pageWidth / 2, y, { align: 'center' })
  
  y += 7
  doc.setFont('helvetica', 'normal')
  y = drawTableLine('Nom et prénoms', `${data.nom_epouse.toUpperCase()} ${data.prenom_epouse}`, y)
  y = drawTableLine('Date et lieu de naissance', data.date_naissance_epouse, y)
  y = drawTableLine('Profession', data.profession_epouse, y)
  y = drawTableLine('Domicile', data.domicile_epouse, y)
  y = drawTableLine('Nationalité', data.nationalite_epouse, y)
  y = drawTableLine('Fille de', `${data.nom_epouse} (père) et de ${data.nom_epouse} (mère)`, y)

  // Texte communauté réduite
  y += 8
  doc.setFontSize(8)
  const texteRegime = 'Les futurs époux déclarent n\'avoir pas fait de contrat de mariage et entendent se marier sous le régime de la communauté réduite aux acquêts.'
  const splitRegime = doc.splitTextToSize(texteRegime, rightMargin - margin)
  doc.text(splitRegime, margin, y)
  y += splitRegime.length * 4

  // Lecture et consentement
  y += 6
  const texteConsentement = `Après lecture faite aux comparants de toutes les pièces ci-dessus mentionnées, nous avons demandé aux futurs époux s'ils voulaient se prendre pour mari et femme.`
  const splitConsentement = doc.splitTextToSize(texteConsentement, rightMargin - margin)
  doc.text(splitConsentement, margin, y)
  y += splitConsentement.length * 4

  y += 4
  const texteOui = `Chacun d'eux ayant répondu OUI, nous avons prononcé, au nom de la loi, que ${data.nom_epoux.toUpperCase()} ${data.prenom_epoux} et ${data.nom_epouse.toUpperCase()} ${data.prenom_epouse} sont unis par les liens du mariage.`
  const splitOui = doc.splitTextToSize(texteOui, rightMargin - margin)
  doc.text(splitOui, margin, y)
  y += splitOui.length * 4

  // TEMOINS
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('TEMOINS', pageWidth / 2, y, { align: 'center' })
  
  y += 7
  doc.setFont('helvetica', 'normal')
  
  // Témoin de l'époux
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  doc.text('Témoin de l\'époux', margin + 10, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`Nom : ${data.temoin1_nom} ${data.temoin1_prenom}`, margin + 10, y)
  y += 4
  doc.text(`Profession : ${data.temoin1_profession}`, margin + 10, y)
  y += 4
  doc.text(`Domicile : ${data.temoin1_domicile}`, margin + 10, y)

  // Témoin de l'épouse
  y += 6
  doc.setFont('helvetica', 'bold')
  doc.text('Témoin de l\'épouse', margin + 10, y)
  y += 5
  doc.setFont('helvetica', 'normal')
  doc.text(`Nom : ${data.temoin2_nom} ${data.temoin2_prenom}`, margin + 10, y)
  y += 4
  doc.text(`Profession : ${data.temoin2_profession}`, margin + 10, y)
  y += 4
  doc.text(`Domicile : ${data.temoin2_domicile}`, margin + 10, y)

  // Texte de clôture
  y += 8
  doc.setFontSize(8)
  const clotureText = 'Dont acte rédigé par nous, Officier de l\'État Civil soussigné, lu et interprété aux comparants et aux témoins, qui ont signé avec nous le présent acte.'
  const splitCloture = doc.splitTextToSize(clotureText, rightMargin - margin)
  doc.text(splitCloture, margin, y)

  // Signatures
  y += 15
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  const col1 = margin + 25
  const col2 = pageWidth / 2
  const col3 = rightMargin - 25
  
  doc.text('L\'Epoux', col1, y, { align: 'center' })
  doc.text('L\'Epouse', col2, y, { align: 'center' })
  
  y += 10
  doc.text('Témoin 1', col1, y, { align: 'center' })
  doc.text('Témoin 2', col3, y, { align: 'center' })
  
  y += 10
  doc.text('L\'Officier de l\'État Civil', pageWidth / 2, y, { align: 'center' })

  // Générer QR Code (en bas à droite)
  const qrData = JSON.stringify({
    type: 'acte_mariage',
    numero: data.numero_acte,
    epoux: `${data.nom_epoux} ${data.prenom_epoux}`,
    epouse: `${data.nom_epouse} ${data.prenom_epouse}`,
    date_mariage: data.date_mariage,
    verification_url: `https://mamairie.ci/verifier/${data.numero_acte}`
  })

  try {
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Ajouter QR Code en bas à droite
    const qrSize = 35
    const qrX = rightMargin - qrSize - 10
    const qrY = pageHeight - qrSize - 20
    
    doc.addImage(qrCodeDataUrl, 'PNG', qrX, qrY, qrSize, qrSize)

    // Texte sous le QR
    doc.setFontSize(6)
    doc.setFont('helvetica', 'italic')
    doc.text('Scannez pour', qrX + qrSize/2, qrY + qrSize + 3, { align: 'center' })
    doc.text('vérifier', qrX + qrSize/2, qrY + qrSize + 6, { align: 'center' })
  } catch (error) {
    console.error('Erreur génération QR Code:', error)
  }

  // Mention légale en bas
  doc.setFontSize(7)
  doc.setFont('helvetica', 'italic')
  doc.text(`(Cachet de la Mairie de ${data.mairie.commune})`, pageWidth / 2, pageHeight - 15, { align: 'center' })
  doc.text('Ce document est délivré pour servir et valoir ce que de droit.', pageWidth / 2, pageHeight - 10, { align: 'center' })

  // Retourner le PDF en tant que Blob
  return doc.output('blob')
}

// Fonction pour télécharger le PDF
export function telechargerPdfActeMariage(data: ActeMariageData) {
  genererPdfActeMariage(data).then(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Acte_Mariage_${data.numero_acte}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}
