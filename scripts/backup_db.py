import boto3
import os
from datetime import datetime

# Nombre fijo solicitado
BUCKET_NAME = 'nearmexbackups'
FILE_NAME = f"nearmex_backup_{datetime.now().strftime('%Y%m%d_%H%M')}.sql"

def ejecutar_respaldo():
    print(f"Generando copia de seguridad: {FILE_NAME}")
    # Extrae el dump directamente desde el contenedor de Docker
    comando_dump = f"docker exec nearmex-db mysqldump -u nearmex_user -pnearmex nearmex_db > {FILE_NAME}"
    
    resultado = os.system(comando_dump)
    
    if resultado == 0:
        s3 = boto3.client('s3')
        try:
            s3.upload_file(FILE_NAME, BUCKET_NAME, FILE_NAME)
            print(f"Respaldo subido a s3://{BUCKET_NAME}")
            os.remove(FILE_NAME)
        except Exception as e:
            print(f"Error al subir a S3: {e}")
    else:
        print("Error al ejecutar mysqldump en el contenedor.")

if __name__ == "__main__":
    ejecutar_respaldo()