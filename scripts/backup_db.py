import os
import datetime
import subprocess
import boto3
from botocore.exceptions import NoCredentialsError

# --- CONFIGURACIÓN ESPECÍFICA ---
DB_NAME = "nearmex_db"
DB_USER = "nearmex_user"
DB_PASS = "nearmex"  
CONTAINER_NAME = "nearmex_db_container"
BACKUP_DIR = "backups_demo"
BUCKET_NAME = "nearmexbackups" 

# 1. Crear carpeta local
if not os.path.exists(BACKUP_DIR):
    os.makedirs(BACKUP_DIR)

# 2. Generar nombres de archivo con marca de tiempo
fecha_hora = datetime.datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
filename = f"nearmex_prod_{fecha_hora}.sql"
local_path = os.path.join(BACKUP_DIR, filename)

def upload_to_s3(local_file, bucket, s3_file):
    """Sube el archivo SQL a Amazon S3 usando Boto3"""
    s3 = boto3.client('s3')
    try:
        print(f"[*] Conectando con S3 y subiendo a: {bucket}...")
        s3.upload_file(local_file, bucket, s3_file)
        print(f"[V] ¡Éxito! El respaldo ya está seguro en la nube.")
        return True
    except NoCredentialsError:
        print("[-] Error: No se encontraron credenciales de AWS.")
        return False
    except Exception as e:
        print(f"[-] Error al subir a S3: {e}")
        return False

# 3. Ejecución del Proceso
print(f"--- INICIANDO BACKUP PARA DEMOSTRACIÓN ---")

# Comando para extraer los datos del contenedor Docker
command = f"docker exec {CONTAINER_NAME} /usr/bin/mysqldump -u{DB_USER} -p{DB_PASS} {DB_NAME} > {local_path}"

try:
    # Paso 1: Generar el archivo .sql localmente
    print(f"[*] Extrayendo datos desde el contenedor '{CONTAINER_NAME}'...")
    subprocess.run(command, shell=True, check=True)
    print(f"[V] Archivo local creado: {local_path}")
    
    # Paso 2: Subir a S3
    s3_dest_path = f"manual_backups/{filename}"
    if upload_to_s3(local_path, BUCKET_NAME, s3_dest_path):
        print(f"--- PROCESO COMPLETADO ---")
        print(f"Verifica en AWS S3: {BUCKET_NAME}/{s3_dest_path}")

except Exception as e:
    print(f"[-] ERROR CRÍTICO: {e}")