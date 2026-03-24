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

// Génération du QR Code
const generateQRCode = async (id: string): Promise<string> => {
  try {
    const verificationUrl = `${window.location.origin}/verify/${id}`
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, {
      width: 150,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })
    return qrCodeDataUrl
  } catch (error) {
    console.error('Erreur génération QR Code:', error)
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
  agentNom: string
): Promise<Blob> => {
  const doc = new jsPDF()
  
  // QR Code
  const qrCodeDataUrl = await generateQRCode(naissance.id)
  
  // En-tête
  addHeader(doc, mairie, 'Extrait d\'Acte de Naissance')
  
  // Numéro d'acte
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(`N° ${naissance.numero_acte}/${naissance.annee}`, 105, 70, { align: 'center' })
  
  // Contenu
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  let y = 85
  
  doc.text('Le présent extrait certifie que :', 20, y)
  y += 10
  
  // Nom et prénom
  doc.setFont('helvetica', 'bold')
  doc.text(`${naissance.prenom_enfant} ${naissance.nom_enfant}`, 20, y)
  doc.setFont('helvetica', 'normal')
  y += 8
  
  // Sexe
  doc.text(`Sexe : ${naissance.sexe}`, 20, y)
  y += 8
  
  // Date de naissance
  doc.text(`Est né(e) le ${formatDate(naissance.date_naissance)}`, 20, y)
  if (naissance.heure_naissance) {
    doc.text(` à ${formatTime(naissance.heure_naissance)}`, 90, y)
  }
  y += 8
  
  // Lieu de naissance
  doc.text(`À ${naissance.lieu_naissance}`, 20, y)
  y += 12
  
  // Parents
  doc.text('Fils/Fille de :', 20, y)
  y += 8
  
  if (naissance.nom_pere || naissance.prenom_pere) {
    doc.text(`Père : ${naissance.prenom_pere || ''} ${naissance.nom_pere || ''}`, 30, y)
    y += 8
  }
  
  if (naissance.nom_mere || naissance.prenom_mere) {
    doc.text(`Mère : ${naissance.prenom_mere || ''} ${naissance.nom_mere || ''}`, 30, y)
    y += 8
  }
  
  // Mention légale
  y += 10
  doc.setFontSize(9)
  doc.setFont('helvetica', 'italic')
  doc.text('Le présent extrait est délivré pour servir et valoir ce que de droit.', 20, y)
  
  // Pied de page
  addFooter(doc, naissance.numero_acte, naissance.annee, agentNom, qrCodeDataUrl)
  
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
  
  // QR Code
  const qrCodeDataUrl = await generateQRCode(mariage.id)
  
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
  
  // Mention légale
  y += 15
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
  
  // QR Code
  const qrCodeDataUrl = await generateQRCode(deces.id)
  
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
