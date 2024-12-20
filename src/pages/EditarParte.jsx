import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import SignaturePad from '../components/SignaturePad'
import ImageUploader from '../components/ImageUploader'

export default function EditarParte() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [obras, setObras] = useState([])
  const [formData, setFormData] = useState({
    nombre_obra: '',
    codigo_empleado: '',
    nombre_trabajador: '',
    email_contacto: '',
    fecha: '',
    num_velas: 0,
    num_puntos_pvc: 0,
    num_montaje_aparatos: 0,
    otros_trabajos: '',
    tiempo_empleado: '',
    coste_trabajos: '',
    coste_empresa: '',
    estado: 'Pendiente',
    notas: '',
    firma: '',
    imagenes: []
  })

  const [empleadoTarifas, setEmpleadoTarifas] = useState({
    coste_hora_trabajador: 0,
    coste_hora_empresa: 0
  })

  useEffect(() => {
    const fetchParte = async () => {
      try {
        const { data, error } = await supabase
          .from('partes')
          .select('*')
          .eq('id', id)
          .single()

        if (error) throw error

        if (data) {
          // Formatear la fecha para el input date
          const formattedData = {
            ...data,
            fecha: data.fecha.split('T')[0],
            imagenes: data.imagenes || [] // Asegurarnos de que siempre sea un array
          }
          setFormData(formattedData)
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al cargar el parte de trabajo')
      }
    }

    fetchParte()
  }, [id])

  useEffect(() => {
    const fetchObras = async () => {
      try {
        const { data, error } = await supabase
          .from('obras')
          .select('*')
          .order('nombre_obra', { ascending: true })

        if (error) throw error
        setObras(data)
      } catch (error) {
        toast.error('Error al cargar las obras')
        console.error('Error:', error)
      }
    }

    fetchObras()
  }, [])

  const handleChange = async (e) => {
    const { name, value } = e.target
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }))

    // Si el campo modificado es código_empleado, buscar el nombre del trabajador y sus tarifas
    if (name === 'codigo_empleado') {
      try {
        const { data, error } = await supabase
          .from('empleados')
          .select('nombre, coste_hora_trabajador, coste_hora_empresa')
          .eq('codigo', value)
          .single()

        if (error) {
          console.error('Error al buscar empleado:', error)
          return
        }

        if (data) {
          setFormData(prevData => ({
            ...prevData,
            nombre_trabajador: data.nombre
          }))
          setEmpleadoTarifas({
            coste_hora_trabajador: data.coste_hora_trabajador,
            coste_hora_empresa: data.coste_hora_empresa
          })
          // Si ya hay horas introducidas, actualizar los costes
          if (formData.tiempo_empleado) {
            const horas = parseFloat(formData.tiempo_empleado)
            setFormData(prevData => ({
              ...prevData,
              coste_trabajos: (horas * data.coste_hora_trabajador).toFixed(2),
              coste_empresa: (horas * data.coste_hora_empresa).toFixed(2)
            }))
          }
        } else {
          setFormData(prevData => ({
            ...prevData,
            nombre_trabajador: '',
            coste_trabajos: '',
            coste_empresa: ''
          }))
          setEmpleadoTarifas({
            coste_hora_trabajador: 0,
            coste_hora_empresa: 0
          })
        }
      } catch (error) {
        console.error('Error:', error)
      }
    }

    // Si el campo modificado es tiempo_empleado, calcular los costes
    if (name === 'tiempo_empleado' && empleadoTarifas.coste_hora_trabajador > 0) {
      const horas = parseFloat(value) || 0
      setFormData(prevData => ({
        ...prevData,
        coste_trabajos: (horas * empleadoTarifas.coste_hora_trabajador).toFixed(2),
        coste_empresa: (horas * empleadoTarifas.coste_hora_empresa).toFixed(2)
      }))
    }
  }

  const handleImageUpload = (imageUrl) => {
    setFormData(prev => ({
      ...prev,
      imagenes: [...prev.imagenes, imageUrl]
    }))
  }

  const handleRemoveImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      imagenes: prev.imagenes.filter((_, index) => index !== indexToRemove)
    }))
  }

  const handleSignatureSave = (signatureData) => {
    setFormData(prev => ({
      ...prev,
      firma: signatureData
    }))
    toast.success('Firma actualizada correctamente')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!formData.firma) {
      toast.error('Por favor, añade una firma antes de guardar')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('partes')
        .update(formData)
        .eq('id', id)

      if (error) throw error

      toast.success('Parte de trabajo actualizado correctamente')
      navigate('/')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el parte de trabajo')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-10rem)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8">
      <div className="max-w-[1200px] mx-auto px-6 sm:px-8 lg:px-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Editar Parte de Trabajo</h2>
          <p className="mt-2 text-sm text-gray-600">
            Modifique los campos necesarios para actualizar el parte de trabajo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mx-auto">
            {/* Tarjeta de Información Principal */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Información Principal</h3>
              </div>
              <div className="space-y-4">
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Nombre de la Obra
                  </label>
                  <select
                    name="nombre_obra"
                    value={formData.nombre_obra}
                    onChange={handleChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    required
                  >
                    <option value="">Seleccione una obra</option>
                    {obras.map((obra) => (
                      <option key={obra.id} value={obra.nombre_obra}>
                        {obra.nombre_obra}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="codigo_empleado" className="block text-sm font-medium text-gray-900 mb-1">
                    Código Empleado
                  </label>
                  <input
                    type="text"
                    name="codigo_empleado"
                    id="codigo_empleado"
                    required
                    value={formData.codigo_empleado}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="nombre_trabajador" className="block text-sm font-medium text-gray-900 mb-1">
                    Nombre del Trabajador
                  </label>
                  <input
                    type="text"
                    name="nombre_trabajador"
                    id="nombre_trabajador"
                    required
                    value={formData.nombre_trabajador}
                    onChange={handleChange}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="email_contacto" className="block text-sm font-medium text-gray-900 mb-1">
                    Email de Contacto
                  </label>
                  <input
                    type="email"
                    name="email_contacto"
                    id="email_contacto"
                    required
                    value={formData.email_contacto}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="fecha" className="block text-sm font-medium text-gray-900 mb-1">
                    Fecha
                  </label>
                  <input
                    type="date"
                    name="fecha"
                    id="fecha"
                    required
                    value={formData.fecha}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Tarjeta de Detalles del Trabajo */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Detalles del Trabajo</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="num_velas" className="block text-sm font-medium text-gray-900 mb-1">
                    Nº Velas
                  </label>
                  <input
                    type="number"
                    name="num_velas"
                    id="num_velas"
                    min="0"
                    value={formData.num_velas}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="num_puntos_pvc" className="block text-sm font-medium text-gray-900 mb-1">
                    Nº Puntos PVC
                  </label>
                  <input
                    type="number"
                    name="num_puntos_pvc"
                    id="num_puntos_pvc"
                    min="0"
                    value={formData.num_puntos_pvc}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="num_montaje_aparatos" className="block text-sm font-medium text-gray-900 mb-1">
                    Nº Montaje Aparatos
                  </label>
                  <input
                    type="number"
                    name="num_montaje_aparatos"
                    id="num_montaje_aparatos"
                    min="0"
                    value={formData.num_montaje_aparatos}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="tiempo_empleado" className="block text-sm font-medium text-gray-900 mb-1">
                    Tiempo Empleado (horas)
                  </label>
                  <input
                    type="number"
                    name="tiempo_empleado"
                    id="tiempo_empleado"
                    step="0.5"
                    min="0"
                    required
                    value={formData.tiempo_empleado}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="coste_trabajos" className="block text-sm font-medium text-gray-900 mb-1">
                    Coste Trabajos (€)
                  </label>
                  <input
                    type="number"
                    name="coste_trabajos"
                    id="coste_trabajos"
                    step="0.01"
                    min="0"
                    required
                    value={formData.coste_trabajos}
                    onChange={handleChange}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="coste_empresa" className="block text-sm font-medium text-gray-900 mb-1">
                    Coste Empresa (€)
                  </label>
                  <input
                    type="number"
                    name="coste_empresa"
                    id="coste_empresa"
                    step="0.01"
                    min="0"
                    required
                    value={formData.coste_empresa}
                    onChange={handleChange}
                    readOnly
                    className="w-full px-4 py-2.5 bg-gray-50 text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-900 mb-1">
                    Estado
                  </label>
                  <select
                    name="estado"
                    id="estado"
                    value={formData.estado}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En progreso">En progreso</option>
                    <option value="Completado">Completado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tarjeta de Notas y Otros Trabajos */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Notas y Otros Trabajos</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="otros_trabajos" className="block text-sm font-medium text-gray-900 mb-1">
                    Otros Trabajos Realizados
                  </label>
                  <textarea
                    name="otros_trabajos"
                    id="otros_trabajos"
                    rows="3"
                    value={formData.otros_trabajos}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
                <div>
                  <label htmlFor="notas" className="block text-sm font-medium text-gray-900 mb-1">
                    Notas Adicionales
                  </label>
                  <textarea
                    name="notas"
                    id="notas"
                    rows="3"
                    value={formData.notas}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-white text-gray-900 rounded-xl border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-colors duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Nueva sección de imágenes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Imágenes del Trabajo</h3>
              </div>
              <div className="space-y-4">
                <ImageUploader onImageUpload={handleImageUpload} parteId={id} />
                {formData.imagenes && formData.imagenes.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                    {formData.imagenes.map((imagen, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden">
                        <img
                          src={imagen}
                          alt={`Imagen ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Nueva sección de firma */}
            <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all hover:scale-[1.02]">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Firma del Trabajador</h3>
              </div>
              <SignaturePad onSave={handleSignatureSave} initialValue={formData.firma} />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-center gap-4 mt-12">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-xl shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
