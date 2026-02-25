⚓ MiUMC - Portal Estudiantil Inteligente

Desarrollado por: **EVG Dev Studio**

Institución: Universidad Nacional Experimental Marítima del Caribe (UMC)

Estado: Fase 2 Completada (Frontend Modular + Backend REST API + Base de Datos MySQL)

🚀 Guía de Inicio Rápido (Para el Equipo)

Si acabas de clonar el repositorio, sigue estos pasos exactamente en este orden para levantar el entorno local completo sin errores.

1. Requisitos Previos

Node.js: Versión 18 o superior.

NPM: Incluido con Node.js.

MySQL: Tener instalado XAMPP, WAMP, MAMP o MySQL Workbench para manejar la base de datos local.

2. Configurar la Base de Datos (Paso Crítico)

Abre tu gestor de base de datos (por ejemplo, phpMyAdmin o DBeaver).

Crea una nueva base de datos llamada miumc_db.

Importa el archivo miumc_database.sql que se encuentra en la raíz del proyecto.

Nota: Este script creará todas las tablas, insertará el pensum completo y creará el usuario administrador por defecto (victor@miumc.edu.ve).

3. Levantar el Backend (Servidor API)

Abre tu terminal, ubícate en la carpeta raíz del proyecto y ejecuta:

cd miumc-backend

# 1. Instalar dependencias del servidor (Express, MySQL2, CORS, Dotenv, Nodemon)
npm install

# 2. Configurar variables de entorno
# Asegúrate de que exista un archivo .env con:
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=
# DB_NAME=miumc_db

# 3. Iniciar el servidor (Correrá en http://localhost:5000)
npm run dev


4. Levantar el Frontend (React App)

Abre otra ventana de terminal (no cierres la del backend) y ejecuta:

cd miumc-frontend

# 1. Instalar dependencias
# IMPORTANTE: Usar --legacy-peer-deps es obligatorio por conflictos entre Tailwind v4 y ESLint.
npm install --legacy-peer-deps

# 2. Iniciar la interfaz web
npm run dev


El portal estará disponible en tu navegador, usualmente en http://localhost:5173.

🛠️ Stack Tecnológico

Frontend:

Framework: React.js + Vite

Estilos: Tailwind CSS v4

Iconografía: Lucide React

Enrutamiento: React Router Dom v6

Backend & Datos:

Entorno: Node.js

Framework API: Express.js

Base de Datos: MySQL (Driver mysql2/promise)

Utilidades: cors, dotenv, nodemon

📂 Estructura del Monorepo

MiUMC/
├── miumc-frontend/        # 💻 Aplicación visual (React)
│   ├── src/
│   │   ├── components/    # Layout, Sidebar, Topbar
│   │   ├── context/       # PensumContext.jsx (Estado global y Fetch a API)
│   │   └── pages/         # Vistas: Auth, Admin, Dashboard, Enrollment...
├── miumc-backend/         # ⚙️ Servidor API (Node.js)
│   ├── server.js          # Endpoints (/api/auth, /api/progress, /api/admin)
│   └── .env               # Credenciales de acceso a MySQL
└── miumc_database.sql     # 🗄️ Script maestro de la base de datos


💡 Flujo de Trabajo Sugerido para el Equipo
