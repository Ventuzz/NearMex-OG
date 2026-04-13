# NearMex - Plataforma de Turismo Local

Este proyecto consta de dos partes principales:
1. **Frontend**: Una aplicación interactiva en React (`NearMexReact`)
2. **Backend**: Una API REST construida con Node.js y Express (`NearMexBackend`) y una Base de Datos MariaDB.

---

## ☁️ Arquitectura y Despliegue en AWS (Proceso Actual)

El despliegue de la aplicación NearMex está completamente automatizado y orquestado en Amazon Web Services (AWS) integrando S3 para el frontend y EC2 con Docker para el backend y la base de datos. 

El proceso de despliegue se divide en las siguientes etapas:

### 1. Montaje de Infraestructura con CloudFormation
El esqueleto de la nube se despliega usando la plantilla **`workflow/aws/nearmex-stack.yaml`**. Esto crea:
- Un **Bucket S3** público configurado para el alojamiento estático del frontend (`NearMexReact`).
- Instancia **EC2** con su Grupo de Seguridad (Security Group) permitiendo tráfico HTTP (80, 5000) y SSH (22).
- Un segundo **Bucket S3** privado habilitado con versionamiento para almacenar respaldos de bases de datos de forma segura.

### 2. Configuración del Entorno EC2
Una vez que la instancia EC2 está corriendo, el servidor se prepara desde cero usando **`scripts/setup_env.sh`**. 
Este script se encarga de:
- Actualizar el sistema (Amazon Linux 2023).
- Instalar **Docker**, **Docker Compose** y **Docker Buildx** para el manejo de contenedores.
- Proveer utilidades vitales de entorno como **Git**, **MariaDB**, **Node.js (LTS)** y **Python 3**.
- Ajustar permisos para evitar problemas al ejecutar contenedores (añadiendo el usuario al grupo Docker) e instalar Boto3 para los mantenimientos en Python.

### 3. Configuración de Llaves SSH (GitHub Actions)
Para permitir la automatización y despliegue remoto seguro desde los repositorios hacia esta EC2, requerimos generar llaves de acceso SSH sin interactividad:

```bash
# 1. Generamos una nueva llave específica para interacciones automatizadas
ssh-keygen -t rsa -b 4096 -f ~/.ssh/github_actions_key -N ""

# 2. Autorizamos la llave pública recién creada de forma local en este servidor
cat ~/.ssh/github_actions_key.pub >> ~/.ssh/authorized_keys

# 3. Restringimos los permisos de las llaves autorizadas como exige el estándar de seguridad SSH
chmod 600 ~/.ssh/authorized_keys

# 4. Imprimimos la llave privada en pantalla (cópiala y pégala en GitHub Secrets)
cat ~/.ssh/github_actions_key
```

### 4. Permisos y Ejecución de Scripts (Linux)
Para echar a andar toda la maquinaria dentro de tu EC2 en el ciclo inicial, hay un paso intermedio donde entran los archivos `.sh`. Por motivos de seguridad preventiva, Linux transfiere o crea los archivos solo como texto de "lectura" y "escritura", pero no como "programas". 

Para remediar esto, usamos el sistema de permisos ejecutando:
```bash
chmod +x setup_env.sh deploy_nearmex.sh
```
**¿Qué significa esto?** El comando `chmod +x` (Change Mode + Execute) les marca la bandera de "ejecutable", indicándole a Linux que confíe en ellos como programas. 
Posteriormente se utiliza `./` para indicarle al sistema que en el directorio en el que estás actualmente (`.`), ejecute el guion (`/`):
```bash
./setup_env.sh
./deploy_nearmex.sh
```

### 5. Proceso del Despliegue Automatizado
Al lanzar ese último comando (`./deploy_nearmex.sh`), la aplicación de la plataforma cobra vida ejecutando las siguientes acciones clave:
1. **Clonación / Actualización:** Descarga la rama designada desde GitHub al servidor EC2.
2. **Auto-Configuración (.env):** Inyecta y genera de forma segura el archivo `.env` necesario con tokens de BD, conectividad SMTP para correos, contraseñas de JWT, etc.
3. **Contenedores Docker:** Construye y levanta el ecosistema de Backend. 
   - Contenedor de MariaDB `10.5` (`nearmex_db_container`)
   - Contenedor local compilado de la API en local Node (`nearmex_backend_container`)
4. **Poblado de BD:** Una vez el motor MariaDB arranca, procesa y migra el volcado SQL existente para poblar la BD base al inicializarse.
5. **Generación Local Frontend y S3 Sync:** Inyecta en la aplicación React la dirección IP Pública (EC2) para la comunicación API, construye los estáticos (`npm run build`), y utiliza `aws s3 sync` para subir los estáticos listos a producción directamente a S3.

### 6. Monitoreo de Logs (EC2)
Una vez que el despliegue ha finalizado y todo está montado, puedes monitorear en vivo la actividad del servidor (por ejemplo, ver en tiempo real el registro de envío de correos o conexiones de usuarios).
   
Para ver el flujo de datos a través de la terminal usa:
```bash
docker-compose logs -f
```
> **Importante:** Es obligatorio ejecutar este comando estando *dentro de la carpeta principal del backend/repositorio* (es decir, `NearMex-OG`), ya que ahí es donde reside tu archivo `docker-compose.yaml` que asocia los sub-servidores. Puedes salir de los logs presionando `Ctrl+C`.

### 7. Resultado Final en Producción
Una vez concluido:
- **Frontend Web**: Queda alojado sin necesidad de mantenimiento (Serverless) en tu Endpoint de S3.
- **Backend Dockerizado**: Está hosteado en la instancia EC2 escuchando el puerto `5000` con comunicación persistente al Docker de DB en la misma red nativa, protegiendo así los consumos y el aislamiento de puertos.

---

## 🔒 Gestión, Backups y Restauración de Base de Datos
Un elemento crítico de la operación es asegurar los datos y saber restablecerlos en caso de fallos en el volumen de Docker.

### 1. Ejecución de Backups (Extracción a S3)
El ecosistema de NearMex utiliza un pipeline automatizado y en Python para resguardar la Base de Datos. El proceso manual/demostrativo sigue estos pasos:

1. **Revisar/Editar tu Script:** Si requieres manipular la programación del backup, usa comandos como `nano` para modificar tu archivo Python:
   ```bash
   nano manual_backup_s3.py
   ```
2. **Generar Respaldo:** El script en Python interceptará al motor Docker y hará el volcado usando `mysqldump`. Ejecútalo así:
   ```bash
   python3 manual_backup.py
   ```
   *(Nota: Puedes usar también `python3 scripts/backup_db.py` dependiendo de tu archivo base principal).*

3. **Verificar el archivo extraído:** Generará un log SQL empaquetado en tu servidor en la carpeta local de backups. Para visualizarlo y constatar que todo está bien, puedes usar `less`:
   ```bash
   less backups_demo/nearmex_backup_2026-04-13_03-55-58.sql
   ```
   > **Importante:** El nombre final del archivo generado *se modifica dependiendo la fecha u hora en lo que se haya hecho*. Cópialo de manera exacta cuando lo vayas a usar.

### 2. Simulación de Desastre: Borrar la Base de Datos
Si necesitas hacer una prueba de recuperación o resetear el entorno (borrón y cuenta nueva), ejecuta este comando para destruir y recrear la base de datos de manera limpia directo en el contenedor de Docker:
```bash
docker exec -i nearmex_db_container mariadb -u root -pnearmex -e "DROP DATABASE nearmex_db; CREATE DATABASE nearmex_db;"
```

### 3. Restablecer / Reconstruir tu Base de Datos
Una vez simulaste la eliminación de datos, o en caso real de requerir restauración, devuelve la vida al servidor inyectando la información de un archivo `.sql` validado (que tengas alojado en tu carpeta) directamente al contenedor:
```bash
docker exec -i nearmex_db_container mariadb -u root -pnearmex nearmex_db < backups_demo/nearmex_backup_2026-04-13_03-55-58.sql
```
> *(No te olvides de escribir el nombre de respaldo `SQL` exacto que tú posees al momento de presionar enter).*

---

## 🛠 Entorno de Desarrollo Local (Debugging)

Si prefieres trabajar pruebas en tu computadora antes de desplegar a AWS:

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd NearMex-OG
```

### 2. Configurar el Backend (Local)
1. Navega a `NearMexBackend/` y ejecuta `npm install`.
2. Crea el archivo `.env` basado en la plantilla actual (o con datos locales).
    ```env
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=tu_contraseña_mysql
    DB_NAME=nearmex_db
    JWT_SECRET=secreto
    PORT=5000
    ```
3. Importa el archivo `database.sql` en tu Gestor local de MySQL (WAMP, XAMP, MySQL Workbench).
4. Ejecuta `npm start`.

### 3. Configurar el Frontend (Local)
1. Navega a `NearMexReact/` y ejecuta `npm install`.
2. Ejecuta servidor de entorno caliente con `npm run dev`.
3. Tu app correrá en `http://localhost:5173`.

> **Nota:** En desarrollo local, asegúrate de que el archivo `NearMexReact/src/services/api.js` apunte a `localhost:5000`.

---
**Estructura del Proyecto:**
* `/NearMexBackend`: API, lógica de servidor, y orquestación base.
* `/NearMexReact`: Aplicación al usuario construida en componentes React.
* `/scripts`: Lógicas automáticas Shell/Python para DevOps/Infraestructura.
* `/workflow/aws`: Archivos base como CloudFormation estandarizado.
