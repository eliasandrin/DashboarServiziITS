from fastapi import APIRouter, Depends, HTTPException
from app.proxmox import get_proxmox_client, ProxmoxError
from app.routes.auth import get_current_user
import os

router = APIRouter()


@router.get("/{node}/{vmid}")
def get_backup_history(node: str, vmid: int, current_user=Depends(get_current_user)):
    """
    Lista degli snapshot presenti su PBS per una specifica VM.
    Se PBS non è raggiungibile restituisce un avviso invece di crashare.
    """
    try:
        proxmox = get_proxmox_client()

        # Recupera tutti gli storage disponibili sul nodo
        storages = proxmox.nodes(node).storage.get(content="backup")
        backups = []

        for storage in storages:
            storage_id = storage.get("storage")
            try:
                contents = proxmox.nodes(node).storage(storage_id).content.get()
                for item in contents:
                    if str(item.get("vmid")) == str(vmid):
                        backups.append({
                            "volid": item.get("volid"),
                            "storage": storage_id,
                            "vmid": vmid,
                            "size_gb": round(item.get("size", 0) / 1073741824, 2),
                            "ctime": item.get("ctime"),
                            "format": item.get("format"),
                            "notes": item.get("notes", ""),
                        })
            except Exception:
                # PBS irraggiungibile per questo storage → avviso ma non crash
                backups.append({
                    "storage": storage_id,
                    "warning": "Storage non raggiungibile",
                })

        return {
            "vmid": vmid,
            "node": node,
            "backups": sorted(backups, key=lambda x: x.get("ctime", 0), reverse=True),
        }

    except ProxmoxError as e:
        raise HTTPException(status_code=503, detail={"status": "degraded", "detail": str(e)})


@router.post("/{node}/{vm_type}/{vmid}/snapshot")
def trigger_snapshot(node: str, vm_type: str, vmid: int, current_user=Depends(get_current_user)):
    """
    Avvia un backup manuale verso PBS.
    Se PBS non è raggiungibile, restituisce un errore 503 con messaggio chiaro.
    """
    try:
        proxmox = get_proxmox_client()

        # Cerca il primo storage PBS disponibile
        pbs_storage = os.getenv("PBS_STORAGE", "pbs")

        if vm_type == "qemu":
            task = proxmox.nodes(node).vzdump.post(
                vmid=vmid,
                storage=pbs_storage,
                compress="zstd",
                mode="snapshot",
            )
        else:
            task = proxmox.nodes(node).vzdump.post(
                vmid=vmid,
                storage=pbs_storage,
                compress="zstd",
                mode="snapshot",
            )

        return {
            "task": task,
            "vmid": vmid,
            "node": node,
            "storage": pbs_storage,
            "message": "Snapshot avviato con successo",
        }

    except ProxmoxError as e:
        # PBS irraggiungibile → avviso chiaro, non crash
        raise HTTPException(
            status_code=503,
            detail={
                "status": "degraded",
                "detail": str(e),
                "message": "Proxmox Backup Server non raggiungibile. Riprova più tardi.",
            },
        )
