# Frontend - Sistema de Productos y Ventas (Vue.js)

Interfaz web desarrollada con **Vue 3**, **Vite**, **Axios** y **Bootstrap 5** para consumir el microservicio REST de Productos y Ventas.

- **Repositorio Backend:** [https://github.com/LeonardoFuentesL/backend-ventas](https://github.com/LeonardoFuentesL/backend-ventas)

---

## Requisitos previos

- **Node.js** y **npm** instalados
- **Backend en ejecución** en `http://localhost:8000` (el frontend realiza peticiones hacia `http://localhost:8000/api`)

---

## Instalación y arranque

1. Instalar las dependencias del proyecto:

```bash
npm install
```

2. Levantar el servidor de desarrollo (por defecto en el puerto `5173`):

```bash
npm run dev
```

3. Abrir en el navegador: [http://localhost:5173](http://localhost:5173)

---

## Compilación para producción

```bash
npm run build
```

---

## Módulos de la interfaz

- **Productos (`src/views/ProductosView.vue`):** creación, edición, listado y eliminación de productos (`GET`, `POST`, `PUT`, `DELETE /api/productos`), mostrando mensajes claros ante errores de validación (`400`) o registros inexistentes (`404`).
- **Ventas (`src/views/VentasView.vue`):** registro de ventas con selector de productos (precio y stock disponible), carrito temporal con cálculo de subtotales y total, historial de ventas registradas y cancelación/eliminación con devolución automática de stock (`GET`, `POST`, `DELETE /api/ventas`).
