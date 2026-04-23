import os
import logging
from functools import lru_cache
from typing import Optional

logger = logging.getLogger(__name__)


class ProxmoxError(Exception):
    """Errore generico Proxmox (nodo giù, PBS offline, ecc.)"""
    pass


def get_proxmox_client():
    """
    Crea e restituisce un client proxmoxer.
    Legge le credenziali dalle variabili d'ambiente (iniettate da secrets.py).
    """
    try:
        from proxmoxer import ProxmoxAPI

        host     = os.getenv("PROXMOX_HOST")
        user     = os.getenv("PROXMOX_USER", "root@pam")
        token_name = os.getenv("PROXMOX_TOKEN_NAME")
        token_value = os.getenv("PROXMOX_TOKEN_VALUE")
        verify_ssl = os.getenv("PROXMOX_VERIFY_SSL", "false").lower() == "true"

        if not host or not token_name or not token_value:
            raise ProxmoxError("Credenziali Proxmox mancanti nelle variabili d'ambiente")

        proxmox = ProxmoxAPI(
            host,
            user=user,
            token_name=token_name,
            token_value=token_value,
            verify_ssl=verify_ssl,
        )
        return proxmox

    except ImportError:
        raise ProxmoxError("proxmoxer non installato")
    except Exception as e:
        raise ProxmoxError(f"Impossibile connettersi a Proxmox: {e}")


def safe_proxmox_call(func, *args, fallback=None, **kwargs):
    """
    Wrapper che esegue una chiamata Proxmox e gestisce gli errori
    senza far crashare l'app. Restituisce fallback se il server
    non è raggiungibile.
    """
    try:
        return func(*args, **kwargs)
    except Exception as e:
        logger.warning(f"Chiamata Proxmox fallita: {e}")
        if fallback is not None:
            return fallback
        raise ProxmoxError(str(e))
