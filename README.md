# Aplicación de Partes de Trabajo

Una aplicación web responsive para generar y gestionar órdenes de trabajo.

## Características

- Creación y gestión de partes de trabajo
- Diseño responsive para todos los dispositivos
- Exportación a PDF y Excel
- Envío por email y WhatsApp
- Gestión de estado de los trabajos
- Interfaz moderna y fácil de usar

## Tecnologías Utilizadas

- React + Vite
- TailwindCSS
- Supabase (Base de datos)
- React Router DOM
- React Hot Toast
- HeadlessUI
- HeroIcons

## Configuración del Proyecto

1. Instalar dependencias:
```bash
npm install
```

2. Configurar variables de entorno:
- Crear un archivo `.env` en la raíz del proyecto
- Añadir las siguientes variables:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

## Estructura de la Base de Datos

Crear una tabla `partes` en Supabase con los siguientes campos:

- id (uuid, primary key)
- nombre_obra (text)
- nombre_trabajador (text)
- email_contacto (text)
- fecha (date)
- num_velas (integer)
- num_puntos_pvc (integer)
- num_montaje_aparatos (integer)
- otros_trabajos (text)
- tiempo_empleado (numeric)
- coste_trabajos (numeric)
- estado (text)
- notas (text)
- created_at (timestamp with time zone)

## Scripts Disponibles

- `npm run dev`: Inicia el servidor de desarrollo
- `npm run build`: Construye la aplicación para producción
- `npm run preview`: Previsualiza la build de producción
