export const generateParteNumber = async (supabase) => {
  const currentYear = new Date().getFullYear().toString().slice(-2)
  
  // Obtener el último número del año actual
  const { data, error } = await supabase
    .from('partes')
    .select('numero_parte')
    .ilike('numero_parte', `%/${currentYear}`)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error al obtener el último número:', error)
    throw error
  }

  let nextNumber = 1
  if (data && data.length > 0 && data[0].numero_parte) {
    const lastNumber = parseInt(data[0].numero_parte.split('/')[0])
    nextNumber = lastNumber + 1
  }

  // Formatear el número con ceros a la izquierda
  const formattedNumber = nextNumber.toString().padStart(5, '0')
  return `${formattedNumber}/${currentYear}`
}

export const formatParteNumber = (numeroParte) => {
  if (!numeroParte) return ''
  return numeroParte
}
