// Génération PDF Acte de Naissance
// Basé sur le modèle officiel de Côte d'Ivoire

import jsPDF from 'jspdf'
import QRCode from 'qrcode'

interface ActeNaissanceData {
  numero_acte: string
  date_acte: string
  nom: string
  prenom: string
  sexe: string
  date_naissance: string
  heure_naissance: string
  lieu_naissance: string
  nom_pere: string
  prenom_pere: string
  date_naissance_pere: string
  nationalite_pere: string
  profession_pere: string
  domicile_pere: string
  nom_mere: string
  prenom_mere: string
  date_naissance_mere: string
  nationalite_mere: string
  profession_mere: string
  domicile_mere: string
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

export async function genererPdfActeNaissance(data: ActeNaissanceData): Promise<Blob> {
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

  // Titre ACTE DE NAISSANCE
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text('ACTE DE NAISSANCE', pageWidth / 2, 66, { align: 'center' })

  // Numéro et Date avec ligne
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const numY = 75
  doc.text(`N° ${data.numero_acte}`, margin, numY)
  
  // Ligne de séparation
  doc.line(margin + 40, numY, rightMargin - 50, numY)
  
  doc.text(`Dressé le ${data.date_acte}`, rightMargin, numY, { align: 'right' })

  // Texte d'introduction
  let y = 85
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const introText = `L'an deux mille vingt-quatre et le ${data.date_acte}, à neuf heures trente, par-devant nous, ${data.officier.prenom.toUpperCase()} ${data.officier.nom.toUpperCase()}, ${data.officier.fonction}, Officier de l'État Civil de la Commune de ${data.mairie.commune}, a comparu :`
  
  const splitIntro = doc.splitTextToSize(introText, rightMargin - margin)
  doc.text(splitIntro, margin, y)
  y += splitIntro.length * 5

  // LE DÉCLARANT
  y += 5
  doc.setFont('helvetica', 'bold')
  doc.text('LE DÉCLARANT', pageWidth / 2, y, { align: 'center' })
  
  y += 7
  doc.setFont('helvetica', 'normal')
  
  // Fonction pour dessiner une ligne de tableau
  const drawTableLine = (label: string, value: string, yPos: number) => {
    doc.setFontSize(9)
    doc.text(label, margin, yPos)
    doc.text(':', margin + 50, yPos)
    doc.text(value, margin + 55, yPos)
    doc.line(margin + 53, yPos + 1, rightMargin, yPos + 1)
    return yPos + 6
  }

  y = drawTableLine('Nom et prénoms', `${data.nom_pere} ${data.prenom_pere}`, y)
  y = drawTableLine('Date de naissance', data.date_naissance_pere, y)
  y = drawTableLine('Profession', data.profession_pere, y)
  y = drawTableLine('Domicile', data.domicile_pere, y)
  y = drawTableLine('Pièce d\'identité', 'CNI n° CI-0102-0014587 délivrée le 03/04/2019', y)
  y = drawTableLine('Qualité', 'Père de l\'enfant', y)

  // L'ENFANT
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('L\'ENFANT', pageWidth / 2, y, { align: 'center' })
  
  y += 7
  doc.setFont('helvetica', 'normal')
  y = drawTableLine('Nom', data.nom.toUpperCase(), y)
  y = drawTableLine('Prénom(s)', data.prenom, y)
  y = drawTableLine('Sexe', data.sexe === 'masculin' ? 'Masculin' : 'Féminin', y)
  y = drawTableLine('Date de naissance', `${data.date_naissance} à ${data.heure_naissance}`, y)
  y = drawTableLine('Lieu de naissance', data.lieu_naissance, y)

  // LE PERE
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('LE PERE', pageWidth / 2, y, { align: 'center' })
  
  y += 7
  doc.setFont('helvetica', 'normal')
  y = drawTableLine('Nom et prénoms', `${data.nom_pere} ${data.prenom_pere}`, y)
  y = drawTableLine('Date et lieu de naissance', data.date_naissance_pere, y)
  y = drawTableLine('Profession', data.profession_pere, y)
  y = drawTableLine('Domicile', data.domicile_pere, y)
  y = drawTableLine('Nationalité', data.nationalite_pere, y)

  // LA MERE
  y += 8
  doc.setFont('helvetica', 'bold')
  doc.text('LA MERE', pageWidth / 2, y, { align: 'center' })
  
  y += 7
  doc.setFont('helvetica', 'normal')
  y = drawTableLine('Nom et prénoms', `${data.nom_mere} ${data.prenom_mere}`, y)
  y = drawTableLine('Date et lieu de naissance', data.date_naissance_mere, y)
  y = drawTableLine('Profession', data.profession_mere, y)
  y = drawTableLine('Domicile', data.domicile_mere, y)
  y = drawTableLine('Nationalité', data.nationalite_mere, y)

  // Texte de clôture (si espace disponible)
  if (y < 240) {
    y += 10
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    const clotureText = 'Dont acte rédigé par nous, Officier de l\'État Civil soussigné, lu et interprété au comparant, qui a signé avec nous le présent acte.'
    const splitCloture = doc.splitTextToSize(clotureText, rightMargin - margin)
    doc.text(splitCloture, margin, y)
    y += splitCloture.length * 4
  }

  // Générer QR Code (en bas à droite, remplace le cachet)
  const qrData = JSON.stringify({
    type: 'acte_naissance',
    numero: data.numero_acte,
    nom: data.nom,
    prenom: data.prenom,
    date_naissance: data.date_naissance,
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
export function telechargerPdfActeNaissance(data: ActeNaissanceData) {
  genererPdfActeNaissance(data).then(blob => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Acte_Naissance_${data.numero_acte}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  })
}
