#!/bin/bash
# =================================================================
# deploy_nearmex.sh - Versión para CI/CD (GitHub Actions)
# =================================================================

echo "--- Iniciando Despliegue Automatizado de NearMex ---"

# 1. Validación de variables de entorno del sistema
# Si están vacías, las pide; si ya existen en ~/.bashrc, continúa.
if [ -z "$REPO_URL" ]; then
    read -p "Introduce la URL del repositorio GitHub: " REPO_URL
    [ -z "$REPO_URL" ] && echo "Error: REPO_URL es obligatorio." && exit 1
fi

if [ -z "$GIT_EMAIL" ]; then
    read -p "Introduce tu Email de GitHub: " GIT_EMAIL
    [ -z "$GIT_EMAIL" ] && echo "Error: GIT_EMAIL es obligatorio." && exit 1
fi

if [ -z "$GIT_NAME" ]; then
    read -p "Introduce tu Usuario de GitHub: " GIT_NAME
    [ -z "$GIT_NAME" ] && echo "Error: GIT_NAME es obligatorio." && exit 1
fi

if [ -z "$IP_PUBLICA" ]; then
    read -p "Introduce la IP Pública de la EC2: " IP_PUBLICA
    [ -z "$IP_PUBLICA" ] && echo "Error: IP_PUBLICA es obligatorio." && exit 1
fi

if [ -z "$BUCKET_S3" ]; then
    read -p "Introduce el nombre del Bucket S3: " BUCKET_S3
    [ -z "$BUCKET_S3" ] && echo "Error: BUCKET_S3 es obligatorio." && exit 1
fi

echo "[*] Configuración detectada correctamente."
echo "[*] IP del Servidor: $IP_PUBLICA"

# 2. Configuración de Identidad Git
git config --global user.email "$GIT_EMAIL"
git config --global user.name "$GIT_NAME"

# 3. Moverse a la raíz del proyecto (asumiendo que el script está en /scripts)
cd "$(dirname "$0")/.." || exit
echo "[*] Directorio de trabajo: $(pwd)"

# 4. Sincronizar código
echo "[*] Actualizando código desde GitHub..."
git pull origin automatización

# 5. Generación de .env para Docker
echo "[*] Configurando variables de entorno para contenedores..."
ROOT_PASS_VAL="root_nearmex_2026"
DB_NAME_VAL="nearmex_db"

cat <<EOF > .env
DB_NAME=$DB_NAME_VAL
DB_USER="nearmex_user"
DB_PASS="nearmex"
MYSQL_ROOT_PASSWORD=$ROOT_PASS_VAL
JWT_SECRET="NearMex_Secret_Key_2026"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=465
SMTP_USER="nearmex.gdl@gmail.com"
SMTP_PASS="dvuqwplxtcfiwlwn"
EMAIL_FROM="NearMex Avisos <nearmex.gdl@gmail.com>"
EOF

# Copiar .env al Backend y agregar el host de la DB
if [ -d "NearMexBackend" ]; then
    cp .env NearMexBackend/.env
    echo "DB_HOST=nearmex-db" >> NearMexBackend/.env
fi

# 6. Actualizar IP en el Frontend
if [ -d "NearMexReact" ]; then
    API_FILE="NearMexReact/src/services/api.js"
    if [ -f "$API_FILE" ]; then
        sed -i "s|const API_URL = 'http://.*:5000/api'|const API_URL = 'http://$IP_PUBLICA:5000/api'|" $API_FILE
        echo "[*] API Endpoint vinculado a $IP_PUBLICA"
    fi
fi

# 7. Despliegue con Docker (Sin borrar volúmenes)
echo "[*] Reconstruyendo contenedores..."
docker-compose down
docker-compose up -d --build

# 8. Importación de DB (Solo si está vacía)
echo "[*] Verificando estado de la Base de Datos..."
sleep 15
TABLAS=$(docker exec nearmex_db_container mariadb -u root -p$ROOT_PASS_VAL -e "USE $DB_NAME_VAL; SHOW TABLES;" --batch --skip-column-names 2>/dev/null)

if [ -z "$TABLAS" ]; then
    echo "[*] Importando esquema inicial..."
    docker exec -i nearmex_db_container mariadb -u root -p$ROOT_PASS_VAL $DB_NAME_VAL < "NearMexBackend/database.sql"
else
    echo "[*] Datos existentes detectados. Manteniendo integridad de la DB."
fi

# 9. Build y subida a S3
if [ -d "NearMexReact" ]; then
    echo "[*] Preparando archivos para S3..."
    cd NearMexReact
    npm install && npm run build
    aws s3 sync dist/ s3://$BUCKET_S3 --delete
fi

echo "--- DESPLIEGUE FINALIZADO CON ÉXITO ---"