import { useState } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export default function ImageUploader({ onImageUpload, parteId }) {
  const [uploading, setUploading] = useState(false)

  const handleFileUpload = async (event) => {
    try {
      setUploading(true)
      const file = event.target.files[0]
      if (!file) return

      const fileExt = file.name.split('.').pop()
      const fileName = `${parteId}/${Math.random().toString(36).slice(2)}.${fileExt}`
      const filePath = `partes-images/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)

      onImageUpload(publicUrl)
      toast.success('Imagen subida correctamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="flex items-center space-x-2">
      <input
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        disabled={uploading}
        className="hidden"
        id="image-upload"
      />
      <label
        htmlFor="image-upload"
        className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {uploading ? 'Subiendo...' : 'Añadir Imagen'}
      </label>
    </div>
  )
}
