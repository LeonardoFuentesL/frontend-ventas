<script setup>
import { ref, onMounted } from 'vue'
import {
  obtenerProductos,
  obtenerVentas,
  crearVenta,
  eliminarVenta,
  obtenerMensajeError
} from '../services/api.js'

// Listados y mensajes de estado
const productos = ref([])
const ventas = ref([])
const cargando = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')

// Datos de la nueva venta y carrito temporal
const cliente = ref('')
const productoSeleccionadoId = ref('')
const cantidad = ref(1)
const carrito = ref([])

// Cargar productos y ventas al iniciar la vista
onMounted(async () => {
  await cargarDatos()
})

async function cargarDatos() {
  cargando.value = true
  try {
    productos.value = await obtenerProductos()
    ventas.value = await obtenerVentas()
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error)
  } finally {
    cargando.value = false
  }
}

// Busca un producto por su ID dentro del arreglo cargado
function buscarProductoLocal(idBuscado) {
  for (let i = 0; i < productos.value.length; i++) {
    if (productos.value[i].id === idBuscado) {
      return productos.value[i]
    }
  }
  return null
}

// Agrega un producto seleccionado al carrito temporal
function agregarAlCarrito() {
  mensajeExito.value = ''
  mensajeError.value = ''

  if (!productoSeleccionadoId.value) {
    mensajeError.value = 'Selecciona un producto para agregar.'
    return
  }

  const cantidadSolicitada = Number(cantidad.value)
  if (cantidadSolicitada < 1) {
    mensajeError.value = 'La cantidad debe ser al menos 1.'
    return
  }

  const producto = buscarProductoLocal(Number(productoSeleccionadoId.value))
  if (!producto) {
    mensajeError.value = 'El producto seleccionado no es válido.'
    return
  }

  // Revisar si el producto ya está en el carrito para sumar su cantidad
  let itemExistente = null
  for (let i = 0; i < carrito.value.length; i++) {
    if (carrito.value[i].productoId === producto.id) {
      itemExistente = carrito.value[i]
      break
    }
  }

  if (itemExistente !== null) {
    const nuevaCantidad = itemExistente.cantidad + cantidadSolicitada
    if (nuevaCantidad > producto.stock) {
      mensajeError.value =
        'No hay suficiente stock para "' +
        producto.nombre +
        '". Disponible: ' +
        producto.stock
      return
    }
    itemExistente.cantidad = nuevaCantidad
    itemExistente.subtotal = itemExistente.precioUnitario * nuevaCantidad
  } else {
    if (cantidadSolicitada > producto.stock) {
      mensajeError.value =
        'No hay suficiente stock para "' +
        producto.nombre +
        '". Disponible: ' +
        producto.stock
      return
    }
    carrito.value.push({
      productoId: producto.id,
      nombreProducto: producto.nombre,
      precioUnitario: Number(producto.precio),
      cantidad: cantidadSolicitada,
      subtotal: Number(producto.precio) * cantidadSolicitada
    })
  }

  productoSeleccionadoId.value = ''
  cantidad.value = 1
}

function quitarDelCarrito(indice) {
  carrito.value.splice(indice, 1)
}

function calcularTotalCarrito() {
  let total = 0
  for (let i = 0; i < carrito.value.length; i++) {
    total = total + carrito.value[i].subtotal
  }
  return total
}

// Envía la venta al microservicio Spring Boot
async function registrarVenta() {
  mensajeExito.value = ''
  mensajeError.value = ''

  if (!cliente.value.trim()) {
    mensajeError.value = 'Ingresa el nombre del cliente.'
    return
  }

  if (carrito.value.length === 0) {
    mensajeError.value = 'Agrega al menos un producto al carrito.'
    return
  }

  const detalles = []
  for (let i = 0; i < carrito.value.length; i++) {
    detalles.push({
      productoId: carrito.value[i].productoId,
      cantidad: carrito.value[i].cantidad
    })
  }

  try {
    const ventaCreada = await crearVenta({
      cliente: cliente.value.trim(),
      detalles: detalles
    })

    mensajeExito.value =
      'Venta #' +
      ventaCreada.id +
      ' registrada con éxito. Total: $' +
      Number(ventaCreada.total).toFixed(2)

    cliente.value = ''
    carrito.value = []
    await cargarDatos()
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error)
  }
}

// Elimina una venta y devuelve el stock al inventario
async function cancelarVenta(id) {
  mensajeExito.value = ''
  mensajeError.value = ''

  const confirmar = window.confirm(
    '¿Seguro que deseas eliminar la venta #' + id + '? Se devolverá el stock a los productos.'
  )
  if (!confirmar) {
    return
  }

  try {
    await eliminarVenta(id)
    mensajeExito.value = 'Venta #' + id + ' eliminada y stock restaurado.'
    await cargarDatos()
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error)
  }
}

function formatearFecha(fechaTexto) {
  if (!fechaTexto) {
    return '-'
  }
  return new Date(fechaTexto).toLocaleString('es-MX')
}
</script>

<template>
  <div>
    <h2 class="mb-4">Módulo de Ventas</h2>

    <!-- Alertas de éxito o error -->
    <div v-if="mensajeExito" class="alert alert-success">{{ mensajeExito }}</div>
    <div v-if="mensajeError" class="alert alert-danger">{{ mensajeError }}</div>

    <!-- Sección 1: Registro de una nueva venta -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header bg-white fw-semibold">Registrar Nueva Venta</div>
      <div class="card-body">
        <div class="row g-3 mb-3">
          <div class="col-md-5">
            <label class="form-label">Cliente</label>
            <input
              v-model="cliente"
              type="text"
              class="form-control"
              placeholder="Nombre del cliente"
            />
          </div>

          <div class="col-md-4">
            <label class="form-label">Producto</label>
            <select v-model="productoSeleccionadoId" class="form-select">
              <option value="">-- Selecciona un producto --</option>
              <option
                v-for="producto in productos"
                :key="producto.id"
                :value="producto.id"
              >
                {{ producto.nombre }} - ${{ Number(producto.precio).toFixed(2) }} (Stock: {{ producto.stock }})
              </option>
            </select>
          </div>

          <div class="col-md-1">
            <label class="form-label">Cant.</label>
            <input
              v-model="cantidad"
              type="number"
              min="1"
              class="form-control"
            />
          </div>

          <div class="col-md-2 d-flex align-items-end">
            <button
              type="button"
              class="btn btn-outline-primary w-100"
              @click="agregarAlCarrito"
            >
              Agregar
            </button>
          </div>
        </div>

        <!-- Tabla del carrito temporal -->
        <div class="table-responsive mb-3">
          <table class="table table-bordered align-middle mb-0">
            <thead class="table-light">
              <tr>
                <th>Producto</th>
                <th class="text-end">Precio Unit.</th>
                <th class="text-center">Cantidad</th>
                <th class="text-end">Subtotal</th>
                <th class="text-center">Quitar</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="carrito.length === 0">
                <td colspan="5" class="text-center text-muted py-3">
                  El carrito está vacío. Agrega productos arriba.
                </td>
              </tr>
              <tr v-for="(item, index) in carrito" :key="item.productoId">
                <td>{{ item.nombreProducto }}</td>
                <td class="text-end">${{ item.precioUnitario.toFixed(2) }}</td>
                <td class="text-center">{{ item.cantidad }}</td>
                <td class="text-end fw-semibold">${{ item.subtotal.toFixed(2) }}</td>
                <td class="text-center">
                  <button
                    type="button"
                    class="btn btn-sm btn-outline-danger"
                    @click="quitarDelCarrito(index)"
                  >
                    Quitar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="d-flex justify-content-between align-items-center">
          <h5 class="mb-0">
            Total a pagar:
            <span class="text-primary">${{ calcularTotalCarrito().toFixed(2) }}</span>
          </h5>
          <button
            type="button"
            class="btn btn-success"
            @click="registrarVenta"
          >
            Registrar Venta
          </button>
        </div>
      </div>
    </div>

    <!-- Sección 2: Historial de ventas registradas -->
    <div class="card shadow-sm">
      <div class="card-header bg-white fw-semibold">Historial de Ventas</div>
      <div class="card-body p-0">
        <div v-if="cargando" class="p-3 text-muted">Cargando ventas...</div>

        <div v-else class="table-responsive">
          <table class="table table-striped table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Productos vendidos</th>
                <th class="text-end">Total</th>
                <th class="text-center">Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="ventas.length === 0">
                <td colspan="6" class="text-center text-muted py-3">
                  No hay ventas registradas todavía.
                </td>
              </tr>
              <tr v-for="venta in ventas" :key="venta.id">
                <td>{{ venta.id }}</td>
                <td>{{ formatearFecha(venta.fecha) }}</td>
                <td class="fw-semibold">{{ venta.cliente }}</td>
                <td>
                  <ul class="mb-0 ps-3">
                    <li v-for="detalle in venta.detalles" :key="detalle.id">
                      {{ detalle.nombreProducto }} x {{ detalle.cantidad }}
                      (${{ Number(detalle.subtotal).toFixed(2) }})
                    </li>
                  </ul>
                </td>
                <td class="text-end fw-bold">${{ Number(venta.total).toFixed(2) }}</td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-danger"
                    @click="cancelarVenta(venta.id)"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
