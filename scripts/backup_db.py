import boto3
import os
import datetime
from botocore.exceptions import NoCredentialsError

# --- CONFIGURACIÓN BASADA EN TUS VARIABLES INTERNAS ---
DB_USER = "nearmex_user"
DB_PASS = "nearmex"
DB_NAME = "nearmex_db"
BUCKET_NAME = "nearmexbackups" # Coincide con tu YAML

# Nombre del archivo generado (ej. backup_nearmex_db_20260412.sql)
TIMESTAMP = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
BACKUP_FILE = f"backup_{DB_NAME}_{TIMESTAMP}.sql"

def create_db_backup():
    """Ejecuta el comando mysqldump usando tus credenciales"""
    try:
        print(f"Iniciando respaldo de {DB_NAME}...")
        # Incluimos la contraseña directamente para la automatización
        cmd = f"mysqldump -u {DB_USER} -p'{DB_PASS}' {DB_NAME} > {BACKUP_FILE}"
        os.system(cmd)
        return BACKUP_FILE
    except Exception as e:
        print(f"Error al crear el respaldo: {e}")
        return None

def upload_to_s3(file_name):
    """Sube el respaldo al bucket usando Boto3"""
    s3 = boto3.client('s3')
    try:
        print(f"Subiendo {file_name} al bucket {BUCKET_NAME}...")
        s3.upload_file(file_name, BUCKET_NAME, file_name)
        print("¡Respaldo completado y subido con éxito!")
        # Limpieza local
        os.remove(file_name)
    except NoCredentialsError:
        print("Error: No se encontraron credenciales de AWS.")
    except Exception as e:
        print(f"Error durante la subida: {e}")

if __name__ == "__main__":
    archivo = create_db_backup()
    if archivo and os.path.exists(archivo):
        upload_to_s3(archivo)