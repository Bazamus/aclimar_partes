import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'
import { generatePDF, exportToExcel, exportAllToExcel, sendEmail } from '../services/exportService'

export default function Dashboard() {
  const [partes, setPartes] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewType, setViewType] = useState('card')

  useEffect(() => {
    fetchPartes()
  }, [])

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este parte?')) {
      try {
        const { error } = await supabase
          .from('partes')
          .delete()
          .eq('id', id)

        if (error) throw error

        setPartes(partes.filter(parte => parte.id !== id))
        toast.success('Parte eliminado correctamente')
      } catch (error) {
        console.error('Error:', error)
        toast.error('Error al eliminar el parte')
      }
    }
  }

  const fetchPartes = async () => {
    try {
      const { data, error } = await supabase
        .from('partes')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setPartes(data || [])
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al cargar los partes de trabajo')
    } finally {
      setLoading(false)
    }
  }

  const handleExportPDF = async (parte) => {
    try {
      const doc = await generatePDF(parte)
      doc.save(`parte_${parte.id}.pdf`)
      toast.success('PDF generado correctamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al generar el PDF')
    }
  }

  const handleExportExcel = (parte) => {
    try {
      exportToExcel(parte)
      toast.success('Excel generado correctamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al generar el Excel')
    }
  }

  const handleSendEmail = async (parte) => {
    try {
      const doc = generatePDF(parte)
      await sendEmail(parte, doc)
      toast.success('Email enviado correctamente')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al enviar el email')
    }
  }

  const handleExportAllToExcel = () => {
    try {
      exportAllToExcel(partes)
      toast.success('Exportación a Excel completada')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al exportar a Excel')
    }
  }

  const handleView = (parte) => {
    // Implementar la vista detallada
    window.location.href = `/parte/${parte.id}`
  }

  const handleEdit = (parte) => {
    // Implementar la edición
    window.location.href = `/editar-parte/${parte.id}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-4 sm:py-8">
      <div className="container mx-auto px-4">
        {/* Vista Desktop */}
        <div className="hidden sm:block">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold text-blue-600">Partes de Obra</h1>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewType('card')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                    viewType === 'card'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewType('table')}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors duration-150 ${
                    viewType === 'table'
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm-1 9v-1h5v2H5a1 1 0 01-1-1zm7 1h4a1 1 0 001-1v-1h-5v2zm0-4h5V8h-5v2zM9 8H4v2h5V8z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleExportAllToExcel}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Exportar Todo a Excel
              </button>
              <Link
                to="/nuevo-parte"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 01-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Nuevo Parte
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            viewType === 'card' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {partes.map((parte) => (
                  <div
                    key={parte.id}
                    onClick={() => handleEdit(parte)}
                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  >
                    <div className="p-6">
                      <div className="flex flex-col mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {parte.numero_parte || `Parte ${parte.id}`}
                        </h3>
                        <p className="text-gray-600">{new Date(parte.fecha).toLocaleDateString()}</p>
                        <p className="text-gray-600">{parte.cliente}</p>
                        <p className="text-gray-600">{parte.nombre_obra}</p>
                        <p className="text-gray-600">{parte.nombre_trabajador}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportPDF(parte);
                          }}
                          className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 rounded text-sm font-medium"
                        >
                          PDF
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleExportExcel(parte);
                          }}
                          className="px-3 py-1 bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-800 rounded text-sm font-medium"
                        >
                          Excel
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSendEmail(parte);
                          }}
                          className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800 rounded text-sm font-medium"
                        >
                          Email
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(parte.id);
                          }}
                          className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded text-sm font-medium"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nº Parte
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Obra
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Trabajador
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {partes.map((parte) => (
                      <tr 
                        key={parte.id} 
                        onClick={() => handleEdit(parte)}
                        className="hover:bg-gray-50 cursor-pointer"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {parte.numero_parte || `Parte ${parte.id}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(parte.fecha).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parte.cliente}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parte.nombre_obra}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {parte.nombre_trabajador}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportPDF(parte);
                              }}
                              className="px-3 py-1 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-800 rounded"
                            >
                              PDF
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportExcel(parte);
                              }}
                              className="px-3 py-1 bg-green-100 text-green-600 hover:bg-green-200 hover:text-green-800 rounded"
                            >
                              Excel
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSendEmail(parte);
                              }}
                              className="px-3 py-1 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-800 rounded"
                            >
                              Email
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(parte.id);
                              }}
                              className="px-3 py-1 bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800 rounded"
                            >
                              Eliminar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>

        {/* Vista Mobile */}
        <div className="sm:hidden bg-gray-50 min-h-screen">
          {/* Header */}
          <div className="bg-white px-4 py-3">
            <h1 className="text-xl font-semibold text-blue-600">Partes de Obra</h1>
          </div>

          {/* Contenedor principal */}
          <div className="px-4 py-3">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {partes.map((parte) => (
                  <div
                    key={parte.id}
                    onClick={() => handleEdit(parte)}
                    className="bg-white rounded-xl shadow-sm p-4 cursor-pointer hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-medium text-gray-900">
                            Nº {parte.numero_parte || `P-${parte.id.toString().padStart(4, '0')}`}
                          </h3>
                          <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            en edicion
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {parte.nombre_trabajador}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-100 pt-3">
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <p className="text-sm text-gray-500">Fecha</p>
                          <p className="text-sm">{new Date(parte.fecha).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Total</p>
                          <p className="text-sm">{parte.total || '0,00'} €</p>
                        </div>
                      </div>

                      <div className="flex justify-end gap-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(parte);
                          }}
                          className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-md text-sm font-medium hover:bg-blue-100"
                        >
                          Ver
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(parte);
                          }}
                          className="px-3 py-1.5 bg-green-50 text-green-600 rounded-md text-sm font-medium hover:bg-green-100"
                        >
                          Editar
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(parte.id);
                          }}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-md text-sm font-medium hover:bg-red-100"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones fijos inferiores */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white">
            <div className="flex gap-3">
              <Link
                to="/nuevo-parte"
                className="flex-1 bg-blue-500 text-white rounded-lg py-3 text-center font-medium"
              >
                Nuevo Parte
              </Link>
              <button
                onClick={handleExportAllToExcel}
                className="flex-1 bg-emerald-500 text-white rounded-lg py-3 text-center font-medium"
              >
                Exportar Excel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
