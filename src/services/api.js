import axios from 'axios'

// Cliente Axios apuntando al microservicio Spring Boot en el puerto 8000
const api = axios.create({
  baseURL: 'http://localhost:8000/api'
})

// --- Funciones para el módulo de Productos ---

export async function obtenerProductos() {
  const respuesta = await api.get('/productos')
  return respuesta.data
}

export async function obtenerProductoPorId(id) {
  const respuesta = await api.get('/productos/' + id)
  return respuesta.data
}

export async function crearProducto(datos) {
  const respuesta = await api.post('/productos', datos)
  return respuesta.data
}

export async function actualizarProducto(id, datos) {
  const respuesta = await api.put('/productos/' + id, datos)
  return respuesta.data
}

export async function eliminarProducto(id) {
  await api.delete('/productos/' + id)
}

// --- Funciones para el módulo de Ventas ---

export async function obtenerVentas() {
  const respuesta = await api.get('/ventas')
  return respuesta.data
}

export async function obtenerVentaPorId(id) {
  const respuesta = await api.get('/ventas/' + id)
  return respuesta.data
}

export async function crearVenta(datos) {
  const respuesta = await api.post('/ventas', datos)
  return respuesta.data
}

export async function eliminarVenta(id) {
  await api.delete('/ventas/' + id)
}

// Extrae un mensaje claro desde la respuesta de error del backend
export function obtenerMensajeError(error) {
  if (error.response && error.response.data) {
    const data = error.response.data

    if (data.mensaje) {
      return data.mensaje
    }
    if (data.message) {
      return data.message
    }

    // Si hay errores de validación por campo, unirlos en un texto legible
    if (data.detalles) {
      const mensajes = []
      for (const campo in data.detalles) {
        mensajes.push(data.detalles[campo])
      }
      if (mensajes.length > 0) {
        return mensajes.join('. ')
      }
    }

    if (data.error) {
      return data.error
    }
  }

  return 'No se pudo conectar con el servidor. Verifica que el backend esté encendido en el puerto 8000.'
}
