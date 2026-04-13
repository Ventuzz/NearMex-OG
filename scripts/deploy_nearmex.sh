#!/bin/bash
# ==================================================
# deploy_nearmex.sh - Versión Final con SMTP Fixed
# ==================================================

PROJECT_NAME="NearMex-OG"
if [ -d "$HOME/$PROJECT_NAME/scripts" ]; then
    CONFIG_FILE="$HOME/$PROJECT_NAME/scripts/.deploy_config"
else
    CONFIG_FILE="$HOME/.deploy_config"
fi

cargar_configuracion() {
    if [ -f "$CONFIG_FILE" ]; then source "$CONFIG_FILE"; fi
}

guardar_configuracion() {
    mkdir -p "$(dirname "$CONFIG_FILE")"
    cat <<EOF > "$CONFIG_FILE"
REPO_URL="$REPO_URL"
GIT_EMAIL="$GIT_EMAIL"
GIT_NAME="$GIT_NAME"
IP_PUBLICA="$IP_PUBLICA"
BUCKET_S3="$BUCKET_S3"
EOF
    chmod 600 "$CONFIG_FILE"
}

validar_campo() {
    local var_name=$2
    if [ -n "${!var_name}" ]; then return; fi
    if [ ! -t 0 ]; then exit 1; fi
    read -p "$1" val; eval "$var_name=\$val"
}

echo "--- Iniciando Despliegue Automatizado de NearMex ---"
cargar_configuracion

# Gestión de carpeta
if [ ! -d ".git" ] && [ ! -d "$HOME/$PROJECT_NAME/.git" ]; then
    validar_campo "URL del repositorio GitHub: " REPO_URL
    cd "$HOME" && git clone -b automatización "$REPO_URL" "$PROJECT_NAME"
    cd "$PROJECT_NAME"
else
    [ -d "$HOME/$PROJECT_NAME" ] && cd "$HOME/$PROJECT_NAME"
fi

validar_campo "Email de GitHub: " GIT_EMAIL
validar_campo "Usuario de GitHub: " GIT_NAME
validar_campo "IP Publica de la EC2: " IP_PUBLICA
validar_campo "Nombre del Bucket S3: " BUCKET_S3
guardar_configuracion

# Actualizar código
git fetch origin automatización && git reset --hard origin/automatización

# --- CONFIGURACIÓN DE VARIABLES (.env) ---
# Aquí definimos las credenciales SMTP que le faltan a tu contenedor
echo "Generando archivo .env con credenciales SMTP..."
DB_NAME_VAL="nearmex_db"
DB_USER_VAL="nearmex_user"
DB_PASS_VAL="nearmex"
JWT_SECRET_VAL="NearMex_Secret_Key_2026"

# Credenciales de Nodemailer (Asegúrate que tu código use estos nombres)
SMTP_HOST_VAL="smtp.gmail.com"
SMTP_PORT_VAL=465
SMTP_USER_VAL="nearmex.gdl@gmail.com"
SMTP_PASS_VAL="dvuqwplxtcfiwlwn"
EMAIL_FROM_VAL="NearMex Avisos <nearmex.gdl@gmail.com>"

cat <<EOF > .env
DB_NAME=$DB_NAME_VAL
DB_USER=$DB_USER_VAL
DB_PASS=$DB_PASS_VAL
JWT_SECRET=$JWT_SECRET_VAL
SMTP_HOST=$SMTP_HOST_VAL
SMTP_PORT=$SMTP_PORT_VAL
SMTP_USER=$SMTP_USER_VAL
SMTP_PASS=$SMTP_PASS_VAL
EMAIL_FROM=$EMAIL_FROM_VAL
EOF

# Sincronizar .env con la carpeta del Backend
if [ -d "NearMexBackend" ]; then
    cp .env NearMexBackend/.env
    echo "DB_HOST=nearmex-db" >> NearMexBackend/.env
    echo "Configuración de Backend lista."
fi

# Actualizar IP en Frontend
if [ -d "NearMexReact" ]; then
    API_FILE="NearMexReact/src/services/api.js"
    [ -f "$API_FILE" ] && sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" "$API_FILE"
fi

# --- REINICIO DE DOCKER ---
echo "Reiniciando servicios..."
# Usamos --force-recreate para asegurar que Docker lea el nuevo .env
docker-compose down
docker-compose up -d --build --force-recreate

echo "Esperando a MariaDB..."
sleep 15

# Gestión de DB
TABLAS=$(docker exec nearmex_db_container mariadb -u root -p$DB_PASS_VAL -e "SHOW TABLES IN $DB_NAME_VAL;" --silent 2>/dev/null)
if [ -z "$TABLAS" ]; then
    [ -f "NearMexBackend/database.sql" ] && docker exec -i nearmex_db_container mariadb -u root -p$DB_PASS_VAL $DB_NAME_VAL < NearMexBackend/database.sql
fi

# Despliegue Frontend
if [ -d "NearMexReact" ]; then
    cd NearMexReact && npm install && npm run build
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
fi

echo "--- DESPLIEGUE FINALIZADO ---"