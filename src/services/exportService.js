import jsPDF from 'jspdf'
import 'jspdf-autotable'
import * as XLSX from 'xlsx'
import emailjs from '@emailjs/browser'

const addImageToPDF = async (doc, imageUrl, x, y, width, height) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.src = imageUrl
    img.onload = () => {
      try {
        doc.addImage(img, 'JPEG', x, y, width, height)
        resolve()
      } catch (error) {
        console.error('Error al añadir imagen:', error)
        resolve() // Resolvemos sin error para continuar con el resto del PDF
      }
    }
    img.onerror = () => {
      console.error('Error al cargar imagen:', imageUrl)
      resolve() // Resolvemos sin error para continuar con el resto del PDF
    }
  })
}

export const generatePDF = async (parte) => {
  // Crear documento PDF
  const doc = new jsPDF()
  
  // Colores
  const primaryColor = [41, 79, 177] // Azul índigo
  const secondaryColor = [107, 114, 128] // Gris
  
  // Configurar fuentes
  doc.setFont('helvetica', 'bold')
  
  // Encabezado con fondo azul
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, 210, 40, 'F')
  
  // Título en blanco
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(24)
  doc.text('Parte de Trabajo', 105, 20, { align: 'center' })
  
  // Número de parte
  doc.setFontSize(16)
  doc.text(`Nº ${parte.numero_parte || ''}`, 105, 35, { align: 'center' })
  
  // Resetear color de texto
  doc.setTextColor(0, 0, 0)
  
  // Información principal
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  
  // Crear una caja de información principal
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(10, 50, 190, 40, 3, 3, 'F')
  
  doc.setTextColor(...primaryColor)
  doc.text('Información General', 15, 60)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  
  // Grid de información 2x2
  const infoGrid = [
    ['Obra:', parte.nombre_obra || '', 'Fecha:', new Date(parte.fecha).toLocaleDateString()],
    ['Trabajador:', parte.nombre_trabajador || '', 'Email:', parte.email_contacto || '']
  ]
  
  infoGrid.forEach((row, i) => {
    row.forEach((text, j) => {
      const x = j < 2 ? 15 : 105
      const y = 70 + (i * 15) // Aumentado el espaciado vertical
      if (j % 2 === 0) {
        doc.setFont('helvetica', 'bold')
        doc.setTextColor(...secondaryColor)
      } else {
        doc.setFont('helvetica', 'normal')
        doc.setTextColor(0, 0, 0)
        // Si es un valor, añadir más espacio horizontal
        if (j === 1 || j === 3) {
          doc.text(String(text), x + 25, y)
          return
        }
      }
      doc.text(String(text), x, y)
    })
  })
  
  // Detalles del trabajo
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Detalles del Trabajo', 15, 100)
  
  // Tabla de detalles
  doc.autoTable({
    startY: 105,
    head: [['Concepto', 'Cantidad']],
    body: [
      ['Velas', String(parte.num_velas || 0)],
      ['Puntos PVC', String(parte.num_puntos_pvc || 0)],
      ['Montaje Aparatos', String(parte.num_montaje_aparatos || 0)],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [...primaryColor],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 30, halign: 'center' },
    },
    margin: { left: 15, right: 15 }
  })
  
  // Otros detalles
  const startY = doc.lastAutoTable.finalY + 10
  
  // Caja para otros trabajos
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(10, startY, 190, 40, 3, 3, 'F')
  
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...primaryColor)
  doc.text('Otros Trabajos', 15, startY + 10)
  
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(0, 0, 0)
  const otrosTrabajosLines = doc.splitTextToSize(parte.otros_trabajos || '-', 180)
  doc.text(otrosTrabajosLines, 15, startY + 20)
  
  // Información adicional
  const infoY = startY + 50
  doc.setFillColor(245, 247, 250)
  doc.roundedRect(10, infoY, 190, 45, 3, 3, 'F') // Reducida la altura del rectángulo
  
  // Función para manejar texto largo
  const formatLongText = (text, maxWidth) => {
    if (!text) return ''
    const words = String(text).split(' ')
    let lines = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const width = doc.getStringUnitWidth(currentLine + ' ' + words[i]) * doc.internal.getFontSize()
      if (width < maxWidth) {
        currentLine += ' ' + words[i]
      } else {
        lines.push(currentLine)
        currentLine = words[i]
      }
    }
    lines.push(currentLine)
    return lines
  }

  // Reorganizar la información en tres líneas
  const additionalInfo = [
    ['Tiempo Empleado:', parte.tiempo_empleado || ''],
    ['Estado:', parte.estado || ''],
    ['Coste:', parte.coste_trabajos ? `${parte.coste_trabajos}€` : '']
  ]
  
  let currentY = infoY + 12 // Reducido el espaciado inicial
  
  additionalInfo.forEach(([label, value]) => {
    // Etiqueta
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...secondaryColor)
    doc.text(label, 15, currentY)
    
    // Valor
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 0, 0)
    
    // Formatear el texto si es necesario
    const maxWidth = 100
    const lines = formatLongText(value, maxWidth)
    
    lines.forEach((line, index) => {
      doc.text(line, 85, currentY + (index * 10)) // Reducido el espaciado entre líneas de 12 a 10
    })
    
    currentY += Math.max(15, lines.length * 10 + 5) // Reducido el espaciado mínimo y entre elementos
  })
  
  // Imágenes del trabajo
  if (parte.imagenes && parte.imagenes.length > 0) {
    // Nueva página para las imágenes
    doc.addPage()
    
    doc.setFillColor(...primaryColor)
    doc.rect(0, 0, 210, 20, 'F')
    
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(16)
    doc.setFont('helvetica', 'bold')
    doc.text('Imágenes del Trabajo', 105, 15, { align: 'center' })
    
    // Grid de imágenes (2x2)
    const imagesPerPage = 4
    const imageWidth = 85
    const imageHeight = 60
    const margin = 15
    const startImageY = 30
    
    for (let i = 0; i < parte.imagenes.length; i++) {
      if (i > 0 && i % imagesPerPage === 0) {
        doc.addPage()
        doc.setFillColor(...primaryColor)
        doc.rect(0, 0, 210, 20, 'F')
        doc.setTextColor(255, 255, 255)
        doc.text('Imágenes del Trabajo (continuación)', 105, 15, { align: 'center' })
      }
      
      const row = Math.floor((i % imagesPerPage) / 2)
      const col = i % 2
      const x = margin + (col * (imageWidth + margin))
      const y = startImageY + (row * (imageHeight + margin))
      
      await addImageToPDF(doc, parte.imagenes[i], x, y, imageWidth, imageHeight)
      
      // Añadir borde a la imagen
      doc.setDrawColor(...secondaryColor)
      doc.rect(x, y, imageWidth, imageHeight)
    }
  }
  
  // Firma
  if (parte.firma) {
    const lastY = doc.internal.pageSize.height - 40
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(...primaryColor)
    doc.text('Firma del Trabajador', 15, lastY - 10)
    
    await addImageToPDF(doc, parte.firma, 15, lastY, 50, 30)
  }
  
  return doc
}

export const exportToExcel = (parte) => {
  const worksheet = XLSX.utils.json_to_sheet([{
    Obra: parte.nombre_obra || '',
    Trabajador: parte.nombre_trabajador || '',
    Fecha: parte.fecha || '',
    Email: parte.email_contacto || '',
    Velas: parte.num_velas || 0,
    'Puntos PVC': parte.num_puntos_pvc || 0,
    'Montaje Aparatos': parte.num_montaje_aparatos || 0,
    'Otros Trabajos': parte.otros_trabajos || '',
    'Tiempo Empleado': parte.tiempo_empleado || '',
    Coste: parte.coste_trabajos || '',
    Estado: parte.estado || '',
  }])

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Parte de Trabajo')
  
  XLSX.writeFile(workbook, `parte_${parte.id}.xlsx`)
}

export const exportAllToExcel = (partes) => {
  // Preparar los datos para Excel
  const excelData = partes.map(parte => ({
    'Nº Parte': parte.numero_parte || '',
    'ID': parte.id || '',
    'Fecha': parte.fecha ? new Date(parte.fecha).toLocaleDateString() : '',
    'Obra': parte.nombre_obra || '',
    'Trabajador': parte.nombre_trabajador || '',
    'Email': parte.email_contacto || '',
    'Velas': parte.num_velas || 0,
    'Puntos PVC': parte.num_puntos_pvc || 0,
    'Montaje Aparatos': parte.num_montaje_aparatos || 0,
    'Otros Trabajos': parte.otros_trabajos || '',
    'Tiempo Empleado': parte.tiempo_empleado || '',
    'Coste (€)': parte.coste_trabajos || '',
    'Estado': parte.estado || '',
    'Fecha Creación': parte.created_at ? new Date(parte.created_at).toLocaleString() : '',
    'Última Modificación': parte.updated_at ? new Date(parte.updated_at).toLocaleString() : ''
  }))

  // Crear una nueva hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(excelData)

  // Ajustar el ancho de las columnas
  const columnsWidth = [
    { wch: 8 },  // Nº Parte
    { wch: 8 },  // ID
    { wch: 12 }, // Fecha
    { wch: 30 }, // Obra
    { wch: 20 }, // Trabajador
    { wch: 25 }, // Email
    { wch: 8 },  // Velas
    { wch: 12 }, // Puntos PVC
    { wch: 15 }, // Montaje Aparatos
    { wch: 40 }, // Otros Trabajos
    { wch: 15 }, // Tiempo Empleado
    { wch: 10 }, // Coste
    { wch: 12 }, // Estado
    { wch: 20 }, // Fecha Creación
    { wch: 20 }  // Última Modificación
  ]
  worksheet['!cols'] = columnsWidth

  // Crear el libro de Excel y añadir la hoja
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Partes de Trabajo')

  // Generar el archivo
  const fecha = new Date().toISOString().split('T')[0]
  XLSX.writeFile(workbook, `partes_trabajo_${fecha}.xlsx`)
}

export const sendEmail = async (parte, pdfDoc) => {
  try {
    const pdfData = pdfDoc.output('datauristring')

    const templateParams = {
      to_email: parte.email_contacto,
      from_name: 'Sistema de Partes de Trabajo',
      to_name: parte.nombre_trabajador,
      message: `Adjunto encontrará el parte de trabajo para la obra ${parte.nombre_obra}`,
      pdf_data: pdfData,
    }

    const response = await emailjs.send(
      'YOUR_SERVICE_ID',
      'YOUR_TEMPLATE_ID',
      templateParams,
      'YOUR_USER_ID'
    )

    return response
  } catch (error) {
    throw error
  }
}
