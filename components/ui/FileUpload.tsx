'use client'

import React, { useState, useRef } from 'react'
import { Upload, X, File, Camera, Image as ImageIcon } from 'lucide-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface FileUploadProps {
  onFileUploaded: (url: string, fileName: string) => void
  onFileRemoved: () => void
  accept?: string
  maxSizeMB?: number
  label?: string
  helpText?: string
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileUploaded,
  onFileRemoved,
  accept = 'image/*,.pdf',
  maxSizeMB = 5,
  label = 'Document ou Photo',
  helpText = 'Téléchargez une photo ou un document PDF (max 5MB)'
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClientComponentClient()

  const handleFileSelect = async (file: File) => {
    setError(null)

    // Vérifier la taille du fichier
    const maxSize = maxSizeMB * 1024 * 1024 // Convertir en bytes
    if (file.size > maxSize) {
      setError(`Le fichier est trop volumineux. Taille maximale : ${maxSizeMB}MB`)
      return
    }

    // Créer un aperçu pour les images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }

    setUploading(true)

    try {
      // Récupérer l'utilisateur connecté
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        throw new Error('Vous devez être connecté pour uploader un fichier')
      }

      // Créer un nom de fichier unique
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`

      // Uploader le fichier dans Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('demandes-documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        throw uploadError
      }

      // Obtenir l'URL publique (signée pour 1 an)
      const { data: urlData, error: urlError } = await supabase.storage
        .from('demandes-documents')
        .createSignedUrl(fileName, 31536000) // 1 an en secondes

      if (urlError || !urlData?.signedUrl) {
        throw urlError || new Error('Impossible de créer l\'URL signée')
      }
      
      const signedUrl = urlData.signedUrl

      setUploadedFile({ name: file.name, url: signedUrl })
      onFileUploaded(signedUrl, file.name)
    } catch (err: any) {
      console.error('Erreur upload:', err)
      setError(err.message || 'Erreur lors de l\'upload du fichier')
      setPreview(null)
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemove = async () => {
    if (uploadedFile) {
      try {
        // Extraire le chemin du fichier depuis l'URL
        const { data: { user } } = await supabase.auth.getUser()
        if (user && uploadedFile.url) {
          // Supprimer le fichier de Supabase Storage
          const fileName = uploadedFile.url.split('/').pop()?.split('?')[0]
          if (fileName) {
            await supabase.storage
              .from('demandes-documents')
              .remove([`${user.id}/${fileName}`])
          }
        }
      } catch (err) {
        console.error('Erreur suppression:', err)
      }
    }

    setUploadedFile(null)
    setPreview(null)
    setError(null)
    onFileRemoved()
    
    // Réinitialiser les inputs
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (cameraInputRef.current) cameraInputRef.current.value = ''
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-gray-700">
        {label}
      </label>

      {!uploadedFile ? (
        <div className="space-y-3">
          {/* Zone de drop */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
            <Upload className="mx-auto text-gray-400 mb-3" size={40} />
            <p className="text-sm text-gray-600 mb-4">{helpText}</p>
            
            <div className="flex gap-3 justify-center">
              {/* Bouton fichier */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <File size={18} />
                Choisir un fichier
              </button>

              {/* Bouton caméra (mobile) */}
              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                disabled={uploading}
                className="px-4 py-2 bg-secondary-500 text-white rounded-lg hover:bg-secondary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Camera size={18} />
                Prendre une photo
              </button>
            </div>

            {/* Input fichier caché */}
            <input
              ref={fileInputRef}
              type="file"
              accept={accept}
              onChange={handleFileChange}
              className="hidden"
            />

            {/* Input caméra caché */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {uploading && (
            <div className="text-center py-4">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
              <p className="text-sm text-gray-600 mt-2">Upload en cours...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            {/* Aperçu */}
            <div className="flex-shrink-0">
              {preview ? (
                <img
                  src={preview}
                  alt="Aperçu"
                  className="w-16 h-16 object-cover rounded-lg border border-gray-300"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                  <File className="text-gray-400" size={32} />
                </div>
              )}
            </div>

            {/* Info fichier */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {uploadedFile.name}
              </p>
              <p className="text-xs text-green-600 mt-1">
                ✓ Fichier uploadé avec succès
              </p>
            </div>

            {/* Bouton supprimer */}
            <button
              type="button"
              onClick={handleRemove}
              className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Supprimer"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
