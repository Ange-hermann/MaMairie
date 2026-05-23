// Générateur de PDF pour les actes d'état civil
import jsPDF from 'jspdf'
import QRCode from 'qrcode'

// Types
interface Naissance {
  id: string
  nom_enfant: string
  prenom_enfant: string
  date_naissance: string
  heure_naissance?: string
  lieu_naissance: string
  sexe: string
  nom_pere?: string
  prenom_pere?: string
  nom_mere?: string
  prenom_mere?: string
  numero_acte: string
  annee: number
}

interface Mariage {
  id: string
  nom_epoux: string
  prenom_epoux: string
  date_naissance_epoux?: string
  lieu_naissance_epoux?: string
  nom_epouse: string
  prenom_epouse: string
  date_naissance_epouse?: string
  lieu_naissance_epouse?: string
  date_mariage: string
  lieu_mariage: string
  numero_acte: string
  annee: number
  // Témoins
  temoin1_nom?: string
  temoin1_prenom?: string
  temoin1_numero_cni?: string
  temoin1_nationalite?: string
  temoin1_profession?: string
  temoin1_adresse?: string
  temoin2_nom?: string
  temoin2_prenom?: string
  temoin2_numero_cni?: string
  temoin2_nationalite?: string
  temoin2_profession?: string
  temoin2_adresse?: string
}

interface Deces {
  id: string
  nom_defunt: string
  prenom_defunt: string
  date_deces: string
  heure_deces?: string
  lieu_deces: string
  cause_deces?: string
  nom_declarant?: string
  prenom_declarant?: string
  numero_acte: string
  annee: number
}

interface Mairie {
  nom_mairie: string
  ville: string
  pays: string
  code_mairie: string
}

// Utilitaires
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatTime = (timeString?: string): string => {
  if (!timeString) return ''
  return timeString.substring(0, 5) // HH:MM
}

// Génération du QR Code de vérification (contient le numéro d'acte)
const generateVerificationQRCode = async (numeroActe: string): Promise<string> => {
  try {
    // QR Code pour vérifier l'authenticité (contient juste le numéro)
    const qrCodeDataUrl = await QRCode.toDataURL(numeroActe, {
      width: 120,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('Erreur génération QR Code vérification:', error)
    return ''
  }
}

// Génération du QR Code de téléchargement (URL vers le PDF)
const generateDownloadQRCode = async (acteId: string, typeActe: string): Promise<string> => {
  try {
    // URL pour télécharger directement le PDF
    const downloadUrl = `${window.location.origin}/api/download-acte?id=${acteId}&type=${typeActe}`
    const qrCodeDataUrl = await QRCode.toDataURL(downloadUrl, {
      width: 120,
      margin: 1,
      color: {
        dark: '#1e40af', // Bleu pour différencier
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'H'
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('Erreur génération QR Code téléchargement:', error)
    return ''
  }
}

// En-tête commun
const addHeader = (doc: jsPDF, mairie: Mairie, titre: string) => {
  // Bordure
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(10, 10, 190, 277)
  
  // En-tête République
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('RÉPUBLIQUE DE CÔTE D\'IVOIRE', 105, 20, { align: 'center' })
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text('Union - Discipline - Travail', 105, 25, { align: 'center' })
  
  // Ligne de séparation
  doc.setLineWidth(0.3)
  doc.line(20, 28, 190, 28)
  
  // Informations Mairie
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(mairie.nom_mairie.toUpperCase(), 105, 35, { align: 'center' })
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`${mairie.ville} - ${mairie.pays}`, 105, 40, { align: 'center' })
  
  // Titre du document
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.text(titre.toUpperCase(), 105, 55, { align: 'center' })
  
  // Ligne de séparation
  doc.setLineWidth(0.3)
  doc.line(20, 60, 190, 60)
}

// Pied de page commun
const addFooter = (doc: jsPDF, numeroActe: string, annee: number, agentNom: string, qrCodeDataUrl: string) => {
  const pageHeight = doc.internal.pageSize.height
  
  // Ligne de séparation
  doc.setLineWidth(0.3)
  doc.line(20, pageHeight - 60, 190, pageHeight - 60)
  
  // Date de délivrance
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const today = new Date()
  doc.text(`Délivré le ${formatDate(today.toISOString())}`, 20, pageHeight - 50)
  
  // Signature
  doc.text('L\'Agent d\'État Civil,', 130, pageHeight - 50)
  doc.setFont('helvetica', 'bold')
  doc.text(agentNom, 130, pageHeight - 45)
  
  // Numéro de référence
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  const reference = `Réf: CI-${numeroActe}-${annee}`
  doc.text(reference, 20, pageHeight - 35)
  
  // QR Code
  if (qrCodeDataUrl) {
    doc.addImage(qrCodeDataUrl, 'PNG', 155, pageHeight - 45, 30, 30)
    doc.setFontSize(7)
    doc.text('Scanner pour vérifier', 160, pageHeight - 12)
  }
  
  // Filigrane
  doc.setTextColor(220, 220, 220)
  doc.setFontSize(50)
  doc.setFont('helvetica', 'bold')
  doc.saveGraphicsState()
  doc.text('DOCUMENT OFFICIEL', 105, 150, {
    align: 'center',
    angle: 45
  })
  doc.restoreGraphicsState()
  doc.setTextColor(0, 0, 0)
}

// ========================================
// GÉNÉRATION ACTE DE NAISSANCE
// ========================================
export const generateActeNaissance = async (
  naissance: Naissance,
  mairie: Mairie,
  agentNom: string,
  mentions: any[] = []
): Promise<Blob> => {
  const doc = new jsPDF()
  
  // Bordure
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.5)
  doc.rect(10, 10, 190, 277)
  
  // En-tête République
  let y = 20
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('RÉPUBLIQUE DE COTE D\'IVOIRE', 105, y, { align: 'center' })
  y += 5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text('Union - Discipline - Travail', 105, y, { align: 'center' })
  y += 8
  
  // Ligne de séparation
  doc.setLineWidth(0.3)
  doc.line(20, y, 190, y)
  y += 8
  
  // Informations Mairie
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('DISTRICT AUTONOME D\'ABIDJAN', 105, y, { align: 'center' })
  y += 5
  doc.text(`MAIRIE DE LA COMMUNE DE ${mairie.ville.toUpperCase()}`, 105, y, { align: 'center' })
  y += 5
  doc.text('SERVICE DE L\'ÉTAT CIVIL', 105, y, { align: 'center' })
  y += 10
  
  // Titre
  doc.setFontSize(14)
  doc.text('ACTE DE NAISSANCE', 105, y, { align: 'center' })
  y += 8
  
  // Numéro et date
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const dateActe = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  doc.text(`N° ${naissance.annee} / AN / ${naissance.numero_acte}`, 20, y)
  doc.text(`Dressé le ${dateActe}`, 190, y, { align: 'right' })
  y += 8
  
  // Formule d'ouverture
  doc.setFontSize(9)
  const dateNaissance = new Date(naissance.date_naissance)
  const heureText = naissance.heure_naissance ? ` à ${formatTime(naissance.heure_naissance)}` : ''
  doc.text(`L'an deux mille vingt-quatre et le ${formatDate(naissance.date_naissance)}${heureText}, par-devant nous ${agentNom},`, 20, y, { maxWidth: 170 })
  y += 10
  doc.text(`Officier de l'État Civil de la commune de ${mairie.ville}, a comparu :`, 20, y)
  y += 10
  
  // LE DÉCLARANT
  doc.setFont('helvetica', 'bold')
  doc.text('LE DÉCLARANT', 105, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'normal')
  
  // Tableau déclarant
  const drawRow = (label: string, value: string, yPos: number) => {
    doc.setLineWidth(0.1)
    doc.line(20, yPos, 190, yPos)
    doc.text(label, 22, yPos + 4)
    doc.text(value, 80, yPos + 4)
    return yPos + 6
  }
  
  y = drawRow('Nom et prénoms :', `${naissance.prenom_pere || ''} ${naissance.nom_pere || ''}`.trim() || 'Non déclaré', y)
  y = drawRow('Date de naissance :', 'Non renseigné', y)
  y = drawRow('Profession :', 'Non renseigné', y)
  y = drawRow('Domicile :', naissance.lieu_naissance, y)
  y = drawRow('Pièce d\'identité :', 'Non renseigné', y)
  y = drawRow('Qualité :', 'Père de l\'enfant', y)
  doc.line(20, y, 190, y)
  y += 8
  
  // L'ENFANT
  doc.setFont('helvetica', 'bold')
  doc.text('L\'ENFANT', 105, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'normal')
  
  y = drawRow('Nom :', naissance.nom_enfant.toUpperCase(), y)
  y = drawRow('Prénom(s) :', naissance.prenom_enfant, y)
  y = drawRow('Sexe :', naissance.sexe, y)
  y = drawRow('Date de naissance :', `${formatDate(naissance.date_naissance)}${heureText}`, y)
  y = drawRow('Lieu de naissance :', naissance.lieu_naissance, y)
  doc.line(20, y, 190, y)
  y += 8
  
  // LE PÈRE
  doc.setFont('helvetica', 'bold')
  doc.text('LE PÈRE', 105, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'normal')
  
  y = drawRow('Nom et prénoms :', `${naissance.prenom_pere || ''} ${naissance.nom_pere || ''}`.trim() || 'Non déclaré', y)
  y = drawRow('Date et lieu de naissance :', 'Non renseigné', y)
  y = drawRow('Profession :', 'Non renseigné', y)
  y = drawRow('Domicile :', naissance.lieu_naissance, y)
  y = drawRow('Nationalité :', 'Ivoirienne', y)
  doc.line(20, y, 190, y)
  y += 8
  
  // LA MÈRE
  doc.setFont('helvetica', 'bold')
  doc.text('LA MÈRE', 105, y, { align: 'center' })
  y += 5
  doc.setFont('helvetica', 'normal')
  
  y = drawRow('Nom et prénoms :', `${naissance.prenom_mere || ''} ${naissance.nom_mere || ''}`.trim() || 'Non déclaré', y)
  y = drawRow('Date et lieu de naissance :', 'Non renseigné', y)
  y = drawRow('Profession :', 'Non renseigné', y)
  y = drawRow('Domicile :', naissance.lieu_naissance, y)
  y = drawRow('Nationalité :', 'Ivoirienne', y)
  doc.line(20, y, 190, y)
  y += 10
  
  // MENTIONS (si présentes)
  if (mentions && mentions.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.text('MENTIONS', 105, y, { align: 'center' })
    y += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    mentions.forEach((mention, index) => {
      const typeMention = mention.type_mention === 'adoption' ? 'Adoption' :
                         mention.type_mention === 'mariage' ? 'Mariage' :
                         mention.type_mention === 'divorce' ? 'Divorce' :
                         mention.type_mention === 'deces' ? 'Décès' :
                         mention.type_mention === 'reconnaissance' ? 'Reconnaissance' :
                         mention.type_mention === 'changement_nom' ? 'Changement de nom' : mention.type_mention
      
      doc.setFont('helvetica', 'bold')
      doc.text(`${index + 1}. ${typeMention}`, 20, y)
      y += 4
      doc.setFont('helvetica', 'normal')
      doc.text(mention.texte_mention || '', 25, y, { maxWidth: 160 })
      y += 4
      doc.text(`Le ${formatDate(mention.date_mention)}`, 25, y)
      y += 6
    })
  }
  
  // QR Code et signature en bas
  const pageHeight = doc.internal.pageSize.height
  const qrCodeDataUrl = await generateVerificationQRCode(naissance.numero_acte)
  
  if (qrCodeDataUrl) {
    doc.addImage(qrCodeDataUrl, 'PNG', 25, pageHeight - 50, 25, 25)
  }
  
  doc.setFontSize(9)
  doc.text(`L'Officier de l'État Civil`, 140, pageHeight - 40)
  doc.setFont('helvetica', 'bold')
  doc.text(agentNom, 140, pageHeight - 30)
  
  return doc.output('blob')
}

// ========================================
// GÉNÉRATION ACTE DE MARIAGE
// ========================================
export const generateActeMariage = async (
  mariage: Mariage,
  mairie: Mairie,
  agentNom: string
): Promise<Blob> => {
  const doc = new jsPDF()
  
  // QR Code de vérification (contient le numéro d'acte)
  const qrCodeDataUrl = await generateVerificationQRCode(mariage.numero_acte)
  
  // En-tête
  addHeader(doc, mairie, 'Extrait d\'Acte de Mariage')
  
  // Numéro d'acte
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`N° ${mariage.numero_acte}/${mariage.annee}`, 105, 70, { align: 'center' })
  
  // Contenu
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  let y = 85
  
  doc.text('Le présent extrait certifie que le mariage a été célébré entre :', 20, y)
  y += 12
  
  // Époux
  doc.setFont('helvetica', 'bold')
  doc.text('L\'ÉPOUX', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 8
  doc.text(`${mariage.prenom_epoux} ${mariage.nom_epoux}`, 30, y)
  y += 6
  if (mariage.date_naissance_epoux) {
    doc.text(`Né le ${formatDate(mariage.date_naissance_epoux)}`, 30, y)
    y += 6
  }
  if (mariage.lieu_naissance_epoux) {
    doc.text(`À ${mariage.lieu_naissance_epoux}`, 30, y)
    y += 6
  }
  
  y += 6
  
  // Épouse
  doc.setFont('helvetica', 'bold')
  doc.text('L\'ÉPOUSE', 20, y)
  doc.setFont('helvetica', 'normal')
  y += 8
  doc.text(`${mariage.prenom_epouse} ${mariage.nom_epouse}`, 30, y)
  y += 6
  if (mariage.date_naissance_epouse) {
    doc.text(`Née le ${formatDate(mariage.date_naissance_epouse)}`, 30, y)
    y += 6
  }
  if (mariage.lieu_naissance_epouse) {
    doc.text(`À ${mariage.lieu_naissance_epouse}`, 30, y)
    y += 6
  }
  
  y += 10
  
  // Date et lieu du mariage
  doc.setFont('helvetica', 'bold')
  doc.text(`Le ${formatDate(mariage.date_mariage)}`, 20, y)
  doc.setFont('helvetica', 'normal')
  y += 8
  doc.text(`À ${mariage.lieu_mariage}`, 20, y)
  
  // Témoins
  if (mariage.temoin1_nom || mariage.temoin2_nom) {
    y += 12
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.text('TÉMOINS', 20, y)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    y += 8
    
    // Témoin 1
    if (mariage.temoin1_nom) {
      doc.setFont('helvetica', 'bold')
      doc.text('Témoin 1 :', 20, y)
      doc.setFont('helvetica', 'normal')
      y += 6
      doc.text(`${mariage.temoin1_prenom || ''} ${mariage.temoin1_nom}`, 30, y)
      y += 5
      if (mariage.temoin1_numero_cni) {
        doc.text(`N° CNI : ${mariage.temoin1_numero_cni}`, 30, y)
        y += 5
      }
      if (mariage.temoin1_nationalite) {
        doc.text(`Nationalité : ${mariage.temoin1_nationalite}`, 30, y)
        y += 5
      }
      if (mariage.temoin1_profession) {
        doc.text(`Profession : ${mariage.temoin1_profession}`, 30, y)
        y += 5
      }
      y += 3
    }
    
    // Témoin 2
    if (mariage.temoin2_nom) {
      doc.setFont('helvetica', 'bold')
      doc.text('Témoin 2 :', 20, y)
      doc.setFont('helvetica', 'normal')
      y += 6
      doc.text(`${mariage.temoin2_prenom || ''} ${mariage.temoin2_nom}`, 30, y)
      y += 5
      if (mariage.temoin2_numero_cni) {
        doc.text(`N° CNI : ${mariage.temoin2_numero_cni}`, 30, y)
        y += 5
      }
      if (mariage.temoin2_nationalite) {
        doc.text(`Nationalité : ${mariage.temoin2_nationalite}`, 30, y)
        y += 5
      }
      if (mariage.temoin2_profession) {
        doc.text(`Profession : ${mariage.temoin2_profession}`, 30, y)
        y += 5
      }
    }
  }
  
  // Mention légale
  y += 10
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Le présent extrait est délivré pour servir et valoir ce que de droit.', 20, y)
  
  // Pied de page
  addFooter(doc, mariage.numero_acte, mariage.annee, agentNom, qrCodeDataUrl)
  
  return doc.output('blob')
}

// ========================================
// GÉNÉRATION ACTE DE DÉCÈS
// ========================================
export const generateActeDeces = async (
  deces: Deces,
  mairie: Mairie,
  agentNom: string
): Promise<Blob> => {
  const doc = new jsPDF()
  
  // QR Code de vérification (contient le numéro d'acte)
  const qrCodeDataUrl = await generateVerificationQRCode(deces.numero_acte)
  
  // En-tête
  addHeader(doc, mairie, 'Extrait d\'Acte de Décès')
  
  // Numéro d'acte
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`N° ${deces.numero_acte}/${deces.annee}`, 105, 70, { align: 'center' })
  
  // Contenu
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  let y = 85
  
  doc.text('Le présent extrait certifie le décès de :', 20, y)
  y += 10
  
  // Nom et prénom
  doc.setFont('helvetica', 'bold')
  doc.text(`${deces.prenom_defunt} ${deces.nom_defunt}`, 20, y)
  doc.setFont('helvetica', 'normal')
  y += 10
  
  // Date de décès
  doc.text(`Décédé(e) le ${formatDate(deces.date_deces)}`, 20, y)
  if (deces.heure_deces) {
    doc.text(` à ${formatTime(deces.heure_deces)}`, 90, y)
  }
  y += 8
  
  // Lieu de décès
  doc.text(`À ${deces.lieu_deces}`, 20, y)
  y += 10
  
  // Cause (optionnel)
  if (deces.cause_deces) {
    doc.text(`Cause : ${deces.cause_deces}`, 20, y)
    y += 10
  }
  
  // Déclarant
  if (deces.nom_declarant || deces.prenom_declarant) {
    y += 5
    doc.text('Déclaré par :', 20, y)
    y += 8
    doc.text(`${deces.prenom_declarant || ''} ${deces.nom_declarant || ''}`, 30, y)
  }
  
  // Mention légale
  y += 15
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Le présent extrait est délivré pour servir et valoir ce que de droit.', 20, y)
  
  // Pied de page
  addFooter(doc, deces.numero_acte, deces.annee, agentNom, qrCodeDataUrl)
  
  return doc.output('blob')
}

// ========================================
// GÉNÉRATION EXTRAIT POUR DEMANDES
// ========================================
export const generateExtraitPDF = async (data: any): Promise<Buffer> => {
  const doc = new jsPDF()
  
  // QR Code de vérification (contient le numéro d'acte)
  const qrCodeDataUrl = await generateVerificationQRCode(data.numero_acte)
  
  // En-tête
  const mairie: Mairie = {
    nom_mairie: data.mairie || 'Mairie',
    ville: data.ville || '',
    pays: 'Côte d\'Ivoire',
    code_mairie: 'CI'
  }
  
  const titre = data.type === 'naissance' ? 'Extrait d\'Acte de Naissance' :
                data.type === 'mariage' ? 'Extrait d\'Acte de Mariage' :
                'Extrait d\'Acte de Décès'
  
  addHeader(doc, mairie, titre)
  
  // Numéro d'acte
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`N° ${data.numero_acte}`, 105, 70, { align: 'center' })
  
  // Contenu selon le type
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  let y = 85
  
  if (data.type === 'naissance') {
    doc.text('Le présent extrait certifie que :', 20, y)
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.text(`${data.prenom} ${data.nom}`, 20, y)
    doc.setFont('helvetica', 'normal')
    y += 10
    doc.text(`Est né(e) le ${formatDate(data.date_naissance)}`, 20, y)
    y += 8
    doc.text(`À ${data.lieu_naissance}`, 20, y)
    y += 12
    if (data.nom_pere) {
      doc.text(`Père : ${data.nom_pere}`, 20, y)
      y += 8
    }
    if (data.nom_mere) {
      doc.text(`Mère : ${data.nom_mere}`, 20, y)
      y += 8
    }
  } else if (data.type === 'mariage') {
    doc.text('Le présent extrait certifie le mariage entre :', 20, y)
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.text(`${data.prenom} ${data.nom}`, 20, y)
    doc.setFont('helvetica', 'normal')
    y += 8
    doc.text('et', 20, y)
    y += 8
    doc.setFont('helvetica', 'bold')
    doc.text(`${data.prenom_conjoint} ${data.nom_conjoint}`, 20, y)
    doc.setFont('helvetica', 'normal')
    y += 10
    doc.text(`Célébré le ${formatDate(data.date_mariage)}`, 20, y)
    y += 8
    doc.text(`À ${data.lieu_mariage}`, 20, y)
  } else if (data.type === 'deces') {
    doc.text('Le présent extrait certifie le décès de :', 20, y)
    y += 10
    doc.setFont('helvetica', 'bold')
    doc.text(`${data.prenom} ${data.nom}`, 20, y)
    doc.setFont('helvetica', 'normal')
    y += 10
    doc.text(`Décédé(e) le ${formatDate(data.date_deces)}`, 20, y)
    y += 8
    doc.text(`À ${data.lieu_deces}`, 20, y)
  }
  
  // Mention légale
  y += 15
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Le présent extrait est délivré pour servir et valoir ce que de droit.', 20, y)
  
  // Pied de page avec QR Code
  const pageHeight = doc.internal.pageSize.height
  doc.setLineWidth(0.3)
  doc.line(20, pageHeight - 60, 190, pageHeight - 60)
  
  // QR Code
  if (qrCodeDataUrl) {
    doc.addImage(qrCodeDataUrl, 'PNG', 25, pageHeight - 55, 30, 30)
    doc.setFontSize(7)
    doc.text('Scanner pour', 40, pageHeight - 20, { align: 'center' })
    doc.text('vérifier', 40, pageHeight - 16, { align: 'center' })
  }
  
  // Signature
  doc.setFontSize(9)
  doc.text(`Fait à ${data.ville || ''}`, 120, pageHeight - 45)
  doc.text(`Le ${new Date().toLocaleDateString('fr-FR')}`, 120, pageHeight - 40)
  doc.setFont('helvetica', 'bold')
  doc.text('L\'Agent d\'État Civil', 120, pageHeight - 30)
  
  // Numéro d'acte en bas
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.text(`N° ${data.numero_acte}`, 105, pageHeight - 10, { align: 'center' })
  
  // Retourner le buffer
  const pdfOutput = doc.output('arraybuffer')
  return Buffer.from(pdfOutput)
}

// ========================================
// TÉLÉCHARGEMENT DU PDF
// ========================================
export const downloadPDF = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
