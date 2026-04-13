#!/bin/bash
# =================================================================
# deploy_nearmex.sh
# =================================================================

CONFIG_FILE=".nearmex_config"

# 1. Intentar cargar configuración previa si existe
if [ -f "$CONFIG_FILE" ]; then
    source "$CONFIG_FILE"
fi

# 2. Función para solicitar datos solo si no están definidos
configurar_variable() {
    local var_name=$1
    local prompt_text=$2
    local current_val=${!var_name}

    if [ -z "$current_val" ]; then
        read -p "$prompt_text: " input_val
        eval "$var_name=\$input_val"
        echo "$var_name='$input_val'" >> "$CONFIG_FILE"
    fi
}

echo "--- Verificando Configuración de NearMex ---"

# 3. Solicitar variables
configurar_variable "REPO_URL" "Introduce la URL del repositorio GitHub"
configurar_variable "GIT_EMAIL" "Introduce tu Email de GitHub"
configurar_variable "GIT_NAME" "Introduce tu Usuario de GitHub"
configurar_variable "IP_PUBLICA" "Introduce la IP Pública de la EC2"
configurar_variable "BUCKET_S3" "Introduce el nombre del Bucket S3 (Frontend)"

echo "[*] Usando IP: $IP_PUBLICA"
echo "[*] Usando Bucket S3: $BUCKET_S3"

# 4. Configuración de Identidad Git
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"

# 5. Gestión del Repositorio
REPO_DIR=$(basename "$REPO_URL" .git)
if [ ! -d "$REPO_DIR" ]; then
    echo "[*] Clonando repositorio..."
    git clone -b automatización "$REPO_URL" || exit 1
fi
cd "$REPO_DIR" || exit
echo "[*] Sincronizando código fuente..."
git pull origin automatización

# 6. Generación de Archivo .env para Docker
echo "[*] Generando archivo .env para contenedores..."

DB_NAME_VAL="nearmex_db"
DB_USER_VAL="nearmex_user"
DB_PASS_VAL="nearmex"
ROOT_PASS_VAL="root_nearmex_2026"
JWT_SECRET_VAL="NearMex_Secret_Key_2026"

# Credenciales de Nodemailer
SMTP_HOST_VAL="smtp.gmail.com"
SMTP_PORT_VAL=465
SMTP_USER_VAL="nearmex.gdl@gmail.com"
SMTP_PASS_VAL="dvuqwplxtcfiwlwn"
EMAIL_FROM_VAL="NearMex Avisos <nearmex.gdl@gmail.com>"

cat <<EOF > .env
DB_NAME=$DB_NAME_VAL
DB_USER=$DB_USER_VAL
DB_PASS=$DB_PASS_VAL
MYSQL_ROOT_PASSWORD=$ROOT_PASS_VAL
JWT_SECRET=$JWT_SECRET_VAL
SMTP_HOST=$SMTP_HOST_VAL
SMTP_PORT=$SMTP_PORT_VAL
SMTP_USER=$SMTP_USER_VAL
SMTP_PASS=$SMTP_PASS_VAL
EMAIL_FROM=$EMAIL_FROM_VAL
EOF

# Sincronizar .env con Backend
if [ -d "NearMexBackend" ]; then
    cp .env NearMexBackend/.env
    echo "DB_HOST=nearmex-db" >> NearMexBackend/.env
fi

# 7. Actualizar IP en el Frontend (React)
if [ -d "NearMexReact" ]; then
    API_FILE="NearMexReact/src/services/api.js"
    if [ -f "$API_FILE" ]; then
        sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
        echo "[*] Endpoint de API actualizado a $IP_PUBLICA"
    fi
fi

# 8. Despliegue con Docker (PERSISTENCIA DE DATOS)
echo "[*] Reiniciando servicios de Docker..."
docker-compose down 
docker-compose up -d --build

echo "[*] Esperando inicialización de DB (15s)..."
sleep 15

# 9. Importación Inteligente de Base de Datos
SQL_PATH="NearMexBackend/database.sql"
if [ -f "$SQL_PATH" ]; then
    TABLAS=$(docker exec nearmex_db_container mariadb -u root -p$ROOT_PASS_VAL -e "USE $DB_NAME_VAL; SHOW TABLES;" --batch --skip-column-names)
    
    if [ -z "$TABLAS" ]; then
        echo "[*] Base de datos vacía detectada. Importando datos iniciales..."
        docker exec -i nearmex_db_container mariadb -u root -p$ROOT_PASS_VAL $DB_NAME_VAL < "$SQL_PATH"
        echo "[V] Datos importados con éxito."
    else
        echo "[*] Se detectaron datos existentes. Saltando importación para evitar duplicados."
    fi
else
    echo "[!] Advertencia: No se encontró el archivo SQL en $SQL_PATH"
fi

# 10. Build de React y Sincronización con S3
if [ -d "NearMexReact" ]; then
    echo "[*] Iniciando build de producción para el Frontend..."
    cd NearMexReact
    npm install && npm run build
    echo "[*] Sincronizando archivos con el Bucket: $BUCKET_S3"
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
    cd ..
fi

echo "--- DESPLIEGUE FINALIZADO EXITOSAMENTE ---"
echo "URL API: http://$IP_PUBLICA:5000/api"