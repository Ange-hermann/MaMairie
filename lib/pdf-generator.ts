import jsPDF from 'jspdf'
import { formatDate } from './utils'

interface BirthCertificateData {
  nom: string
  prenom: string
  date_naissance: string
  lieu_naissance: string
  nom_pere: string
  nom_mere: string
  numero_document: string
  nom_mairie: string
  ville: string
  pays: string
}

export async function generateBirthCertificatePDF(data: BirthCertificateData): Promise<Blob> {
  const doc = new jsPDF()
  
  // En-tête
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('EXTRAIT DE NAISSANCE', 105, 30, { align: 'center' })
  
  // Informations de la mairie
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Mairie de ${data.ville}`, 105, 45, { align: 'center' })
  doc.text(data.nom_mairie, 105, 52, { align: 'center' })
  doc.text(data.pays, 105, 59, { align: 'center' })
  
  // Ligne de séparation
  doc.line(20, 70, 190, 70)
  
  // Numéro de document
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  doc.text(`N° ${data.numero_document}`, 105, 80, { align: 'center' })
  
  // Informations de l'acte
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('INFORMATIONS DE L\'ACTE', 20, 95)
  
  doc.setFont('helvetica', 'normal')
  const startY = 110
  const lineHeight = 10
  
  doc.text(`Nom : ${data.nom.toUpperCase()}`, 30, startY)
  doc.text(`Prénom(s) : ${data.prenom}`, 30, startY + lineHeight)
  doc.text(`Né(e) le : ${formatDate(data.date_naissance)}`, 30, startY + lineHeight * 2)
  doc.text(`À : ${data.lieu_naissance}`, 30, startY + lineHeight * 3)
  
  doc.setFont('helvetica', 'bold')
  doc.text('FILIATION', 20, startY + lineHeight * 5)
  doc.setFont('helvetica', 'normal')
  doc.text(`Père : ${data.nom_pere}`, 30, startY + lineHeight * 6)
  doc.text(`Mère : ${data.nom_mere}`, 30, startY + lineHeight * 7)
  
  // Ligne de séparation
  doc.line(20, startY + lineHeight * 9, 190, startY + lineHeight * 9)
  
  // Pied de page
  doc.setFontSize(10)
  doc.setFont('helvetica', 'italic')
  const today = formatDate(new Date())
  doc.text(`Délivré le ${today}`, 105, startY + lineHeight * 10.5, { align: 'center' })
  doc.text('Pour servir et valoir ce que de droit', 105, startY + lineHeight * 11.5, { align: 'center' })
  
  // Signature
  doc.setFont('helvetica', 'bold')
  doc.text('L\'Officier d\'État Civil', 140, startY + lineHeight * 14)
  
  // Cachet (simulé)
  doc.setDrawColor(0, 100, 0)
  doc.circle(150, startY + lineHeight * 16, 15, 'S')
  doc.setFontSize(8)
  doc.text('CACHET', 145, startY + lineHeight * 16, { align: 'center' })
  doc.text('OFFICIEL', 145, startY + lineHeight * 16.5, { align: 'center' })
  
  return doc.output('blob')
}
