# NearMex - Plataforma de Turismo Local

Este proyecto consta de dos partes:
1. **Frontend**: Una aplicación React (`NearMexReact`)
2. **Backend**: Una API REST con Node.js y Express (`NearMexBackend`)

## 🛠 Prerrequisitos

Para ejecutar este proyecto necesitas tener instalado:

*   [Node.js](https://nodejs.org/) (versión 14 o superior)
*   [MySQL](https://www.mysql.com/) (para la base de datos)
*   Git

## 🚀 Guía de Instalación

Sigue estos pasos para configurar el proyecto en una nueva computadora:

### 1. Clonar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd NearMex1
```

### 2. Configurar el Backend

1.  Navega a la carpeta del backend:
    ```bash
    cd NearMexBackend
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  **Configurar Variables de Entorno**:
    *   Crea un archivo llamado `.env` en la raíz de `NearMexBackend`.
    *   Copia el contenido de `.env.example` o usa la siguiente plantilla:

    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_contraseña_mysql
    DB_NAME=nearmex_db
    JWT_SECRET=palabra_secreta_para_tokens
    PORT=5000
    ```

4.  **Configurar Base de Datos**:
    *   Abre tu gestor de base de datos (phpMyAdmin, MySQL Workbench, etc.).
    *   Crea una nueva base de datos llamada `nearmex_db` (o el nombre que hayas puesto en `.env`).
    *   Importa el archivo `database.sql` que se encuentra en `NearMexBackend/database.sql`.

5.  Iniciar el servidor backend:
    ```bash
    npm start
    ```
    El servidor correrá en `http://localhost:5000`.

### 3. Configurar el Frontend

1.  Abre una nueva terminal y navega a la carpeta del frontend:
    ```bash
    cd ../NearMexReact
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Iniciar el servidor de desarrollo:
    ```bash
    npm run dev
    ```
    La aplicación se abrirá en `http://localhost:5173` (o el puerto que indique Vite).

## ⚠️ Notas Importantes

*   **No subas el archivo `.env` al repositorio**: Contiene información sensible como contraseñas. Asegúrate de que esté en el `.gitignore`.
*   Si cambias el puerto del backend, recuerda actualizar la URL de la API en `NearMexReact/src/services/api.js`.

## Estructura del Proyecto

*   `/NearMexBackend`: API, lógica de servidor, conexión a BD.
*   `/NearMexReact`: Interfaz de usuario, componentes React.
