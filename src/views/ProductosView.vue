<script setup>
import { ref, onMounted } from 'vue'
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerMensajeError
} from '../services/api.js'

// Lista de productos y estado de mensajes
const productos = ref([])
const cargando = ref(false)
const mensajeExito = ref('')
const mensajeError = ref('')

// Campos del formulario
const editandoId = ref(null)
const nombre = ref('')
const descripcion = ref('')
const precio = ref('')
const stock = ref('')

// Carga la lista de productos al abrir la vista
onMounted(async () => {
  await cargarProductos()
})

async function cargarProductos() {
  cargando.value = true
  mensajeError.value = ''
  try {
    productos.value = await obtenerProductos()
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error)
  } finally {
    cargando.value = false
  }
}

function limpiarFormulario() {
  editandoId.value = null
  nombre.value = ''
  descripcion.value = ''
  precio.value = ''
  stock.value = ''
}

function seleccionarParaEditar(producto) {
  mensajeExito.value = ''
  mensajeError.value = ''
  editandoId.value = producto.id
  nombre.value = producto.nombre
  descripcion.value = producto.descripcion || ''
  precio.value = producto.precio
  stock.value = producto.stock
}

async function guardarProducto() {
  mensajeExito.value = ''
  mensajeError.value = ''

  if (!nombre.value.trim()) {
    mensajeError.value = 'El nombre del producto es obligatorio.'
    return
  }

  const datos = {
    nombre: nombre.value.trim(),
    descripcion: descripcion.value.trim(),
    precio: Number(precio.value),
    stock: Number(stock.value)
  }

  try {
    if (editandoId.value !== null) {
      await actualizarProducto(editandoId.value, datos)
      mensajeExito.value = 'Producto actualizado correctamente.'
    } else {
      await crearProducto(datos)
      mensajeExito.value = 'Producto registrado correctamente.'
    }

    limpiarFormulario()
    await cargarProductos()
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error)
  }
}

async function borrarProducto(id) {
  mensajeExito.value = ''
  mensajeError.value = ''

  const confirmar = window.confirm('¿Seguro que deseas eliminar este producto?')
  if (!confirmar) {
    return
  }

  try {
    await eliminarProducto(id)
    mensajeExito.value = 'Producto eliminado correctamente.'
    await cargarProductos()
  } catch (error) {
    mensajeError.value = obtenerMensajeError(error)
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Gestión de Productos</h2>

    <!-- Alertas de éxito o error -->
    <div v-if="mensajeExito" class="alert alert-success">{{ mensajeExito }}</div>
    <div v-if="mensajeError" class="alert alert-danger">{{ mensajeError }}</div>

    <!-- Formulario para crear o editar un producto -->
    <div class="card mb-4 shadow-sm">
      <div class="card-header bg-white fw-semibold">
        {{ editandoId !== null ? 'Editar Producto #' + editandoId : 'Nuevo Producto' }}
      </div>
      <div class="card-body">
        <form @submit.prevent="guardarProducto" class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Nombre</label>
            <input
              v-model="nombre"
              type="text"
              class="form-control"
              placeholder="Ej. Cuaderno Profesional"
              required
            />
          </div>

          <div class="col-md-3">
            <label class="form-label">Precio ($)</label>
            <input
              v-model="precio"
              type="number"
              step="0.01"
              class="form-control"
              placeholder="45.50"
              required
            />
          </div>

          <div class="col-md-3">
            <label class="form-label">Stock</label>
            <input
              v-model="stock"
              type="number"
              class="form-control"
              placeholder="10"
              required
            />
          </div>

          <div class="col-12">
            <label class="form-label">Descripción</label>
            <input
              v-model="descripcion"
              type="text"
              class="form-control"
              placeholder="Descripción breve del producto (opcional)"
            />
          </div>

          <div class="col-12 d-flex gap-2">
            <button type="submit" class="btn btn-primary">
              {{ editandoId !== null ? 'Guardar Cambios' : 'Agregar Producto' }}
            </button>
            <button
              v-if="editandoId !== null"
              type="button"
              class="btn btn-secondary"
              @click="limpiarFormulario"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Tabla de productos registrados -->
    <div class="card shadow-sm">
      <div class="card-header bg-white fw-semibold">Catálogo de Productos</div>
      <div class="card-body p-0">
        <div v-if="cargando" class="p-3 text-muted">Cargando productos...</div>

        <div v-else class="table-responsive">
          <table class="table table-striped table-hover mb-0 align-middle">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th class="text-end">Precio</th>
                <th class="text-center">Stock</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="productos.length === 0">
                <td colspan="6" class="text-center text-muted py-3">
                  No hay productos registrados.
                </td>
              </tr>
              <tr v-for="producto in productos" :key="producto.id">
                <td>{{ producto.id }}</td>
                <td class="fw-semibold">{{ producto.nombre }}</td>
                <td>{{ producto.descripcion || '-' }}</td>
                <td class="text-end">${{ Number(producto.precio).toFixed(2) }}</td>
                <td class="text-center">
                  <span
                    class="badge"
                    :class="producto.stock > 0 ? 'bg-success' : 'bg-danger'"
                  >
                    {{ producto.stock }}
                  </span>
                </td>
                <td class="text-center">
                  <button
                    class="btn btn-sm btn-warning me-2"
                    @click="seleccionarParaEditar(producto)"
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-sm btn-danger"
                    @click="borrarProducto(producto.id)"
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
