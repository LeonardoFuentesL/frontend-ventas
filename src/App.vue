<script setup>
import { ref } from 'vue'
import ProductosView from './views/ProductosView.vue'
import VentasView from './views/VentasView.vue'

// Controla qué vista se muestra actualmente ('productos' o 'ventas')
const vistaActual = ref('productos')
</script>

<template>
  <div>
    <!-- Barra de navegación superior -->
    <nav class="navbar navbar-expand navbar-dark bg-dark mb-4">
      <div class="container">
        <span class="navbar-brand fw-bold">Tienda - Microservicio Ventas</span>
        <div class="d-flex gap-2">
          <button
            class="btn"
            :class="vistaActual === 'productos' ? 'btn-primary' : 'btn-outline-light'"
            @click="vistaActual = 'productos'"
          >
            Productos
          </button>
          <button
            class="btn"
            :class="vistaActual === 'ventas' ? 'btn-primary' : 'btn-outline-light'"
            @click="vistaActual = 'ventas'"
          >
            Ventas
          </button>
        </div>
      </div>
    </nav>

    <!-- Contenido principal según la vista elegida -->
    <main class="container pb-5">
      <ProductosView v-if="vistaActual === 'productos'" />
      <VentasView v-else />
    </main>
  </div>
</template>
