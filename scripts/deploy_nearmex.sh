#!/bin/bash
# =========================
# deploy_nearmex.sh 
# =========================

validar_campo() {
    local prompt_text=$1
    local var_name=$2
    local valor=""
    
    while [ -z "$valor" ]; do
        read -p "$prompt_text" valor
        if [ -z "$valor" ]; then
            echo "Error: Este campo es obligatorio."
        fi
    done
    eval "$var_name=\$valor"
}

echo "--- Iniciando Despliegue Automatizado de NearMex ---"

# Solicitud de datos dinámicos
validar_campo "URL del repositorio GitHub: " REPO_URL
validar_campo "Email de GitHub: " GIT_EMAIL
validar_campo "Usuario de GitHub: " GIT_NAME
validar_campo "IP Publica de la EC2: " IP_PUBLICA
validar_campo "Nombre del Bucket S3: " BUCKET_S3

# 1. Configuración de Identidad Git
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"

# 2. Gestión del Repositorio
REPO_DIR=$(basename "$REPO_URL" .git)
if [ ! -d "$REPO_DIR" ]; then
    echo "Clonando repositorio..."
    git clone -b automatización "$REPO_URL" || exit 1
fi
cd "$REPO_DIR" || exit
echo "Actualizando código fuente..."
git pull origin automatización

# 3. Configuración Maestra de Variables (.env)
echo "Generando archivo .env sincronizado con docker-compose..."

# --- Valores de Configuración ---
DB_NAME_VAL="nearmex_db"
DB_USER_VAL="nearmex_user"
DB_PASS_VAL="nearmex"
JWT_SECRET_VAL="NearMex_Secret_Key_2026"

# --- Credenciales de Nodemailer ---
SMTP_HOST_VAL="smtp.gmail.com"
SMTP_PORT_VAL=465
SMTP_USER_VAL="nearmex.gdl@gmail.com"
SMTP_PASS_VAL="dvuqwplxtcfiwlwn"
EMAIL_FROM_VAL="NearMex Avisos <nearmex.gdl@gmail.com>"

# Creación del .env en la raíz para Docker Compose
cat <<EOF > .env
# Variables que lee tu docker-compose.yaml
DB_NAME=$DB_NAME_VAL
DB_USER=$DB_USER_VAL
DB_PASS=$DB_PASS_VAL

# Variables para el funcionamiento del Backend
JWT_SECRET=$JWT_SECRET_VAL
SMTP_HOST=$SMTP_HOST_VAL
SMTP_PORT=$SMTP_PORT_VAL
SMTP_USER=$SMTP_USER_VAL
SMTP_PASS=$SMTP_PASS_VAL
EMAIL_FROM=$EMAIL_FROM_VAL
EOF

# Sincronización con la carpeta del Backend
if [ -d "NearMexBackend" ]; then
    cp .env NearMexBackend/.env
    echo "DB_HOST=nearmex-db" >> NearMexBackend/.env
    echo "Configuración de Backend lista."
fi

# Ajuste de IP en el Frontend (React)
if [ -d "NearMexReact" ]; then
    API_FILE="NearMexReact/src/services/api.js"
    if [ -f "$API_FILE" ]; then
        sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
        echo "Endpoint de API actualizado a http://$IP_PUBLICA:5000/api"
    fi
fi

# 4. Despliegue de Infraestructura (Docker)
echo "Limpiando contenedores y volúmenes anteriores..."
docker-compose down -v

echo "Construyendo y levantando servicios..."
docker-compose up -d --build

echo "Esperando a que MariaDB complete su inicialización (15s)..."
sleep 15

# Importación de Base de Datos
SQL_PATH="NearMexBackend/database.sql"
if [ -f "$SQL_PATH" ]; then
    echo "Poblando base de datos desde $SQL_PATH..."
    docker exec -i nearmex_db_container mariadb -u root -p$DB_PASS_VAL $DB_NAME_VAL < "$SQL_PATH"
    echo "Base de datos NearMex lista para operar."
else
    echo "AVISO: No se encontró el archivo SQL en $SQL_PATH. Verifica tu repositorio."
fi

# 5. Build de Frontend y Despliegue a S3
if [ -d "NearMexReact" ]; then
    echo "Iniciando build de React..."
    cd NearMexReact
    npm install && npm run build
    echo "Sincronizando archivos con el Bucket S3: $BUCKET_S3"
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
    cd ..
fi

echo "--- DESPLIEGUE FINALIZADO CON ÉXITO ---"
echo "Backend: http://$IP_PUBLICA:5000"
echo "Frontend: Revisa tu link de S3"