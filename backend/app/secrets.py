import os
import json
import logging

logger = logging.getLogger(__name__)


def load_secrets():
    """
    All'avvio legge i secrets da AWS Secrets Manager e li carica
    come variabili d'ambiente. In sviluppo locale usa variabili
    già presenti (impostate in docker-compose.yml).
    """
    secret_name = os.getenv("AWS_SECRET_NAME")

    if not secret_name:
        logger.info("AWS_SECRET_NAME non impostato — uso variabili locali (modalità dev)")
        return

    try:
        import boto3
        from botocore.exceptions import ClientError

        region = os.getenv("AWS_REGION", "eu-west-1")
        client = boto3.client("secretsmanager", region_name=region)

        response = client.get_secret_value(SecretId=secret_name)
        secrets = json.loads(response["SecretString"])

        # Carica ogni chiave come variabile d'ambiente
        for key, value in secrets.items():
            os.environ[key] = str(value)
            logger.info(f"Secret caricato: {key}")

        logger.info("Secrets caricati da AWS Secrets Manager con successo")

    except ImportError:
        logger.warning("boto3 non disponibile — uso variabili locali")
    except Exception as e:
        logger.error(f"Errore nel caricamento secrets: {e}")
        # Non crashare l'app — usa le variabili già presenti
