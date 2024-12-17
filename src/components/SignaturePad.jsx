import { useRef, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'

export default function SignaturePad({ onSave, initialValue }) {
  const signatureRef = useRef()

  useEffect(() => {
    if (initialValue && signatureRef.current) {
      // Crear una imagen temporal para cargar la firma
      const img = new Image()
      img.src = initialValue
      img.onload = () => {
        // Limpiar el canvas
        signatureRef.current.clear()
        // Obtener el contexto del canvas
        const ctx = signatureRef.current._canvas.getContext('2d')
        // Dibujar la imagen manteniendo la proporción
        const canvas = signatureRef.current._canvas
        const ratio = Math.min(canvas.width / img.width, canvas.height / img.height)
        const centerShift_x = (canvas.width - img.width * ratio) / 2
        const centerShift_y = (canvas.height - img.height * ratio) / 2
        ctx.drawImage(img, centerShift_x, centerShift_y, img.width * ratio, img.height * ratio)
      }
    }
  }, [initialValue])

  const handleClear = () => {
    signatureRef.current.clear()
  }

  const handleSave = () => {
    if (!signatureRef.current.isEmpty()) {
      const signatureData = signatureRef.current.toDataURL()
      onSave(signatureData)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-gray-300 rounded-xl overflow-hidden bg-white">
        <SignatureCanvas
          ref={signatureRef}
          canvasProps={{
            className: 'w-full h-40',
            style: { width: '100%', height: '160px' }
          }}
          backgroundColor="white"
        />
      </div>
      <div className="flex justify-end space-x-2">
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Borrar
        </button>
        <button
          type="button"
          onClick={handleSave}
          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Guardar Firma
        </button>
      </div>
    </div>
  )
}
