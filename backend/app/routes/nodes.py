from fastapi import APIRouter, Depends, HTTPException
from app.proxmox import get_proxmox_client, ProxmoxError, safe_proxmox_call
from app.routes.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_nodes(current_user=Depends(get_current_user)):
    """Lista tutti i nodi del cluster con CPU, RAM e storage."""
    try:
        proxmox = get_proxmox_client()
        nodes = safe_proxmox_call(proxmox.nodes.get)

        result = []
        for node in nodes:
            name = node.get("node")
            try:
                status = proxmox.nodes(name).status.get()
                result.append({
                    "node": name,
                    "status": node.get("status", "unknown"),
                    "cpu": round(status.get("cpu", 0) * 100, 1),
                    "mem_used_gb": round(status.get("memory", {}).get("used", 0) / 1073741824, 2),
                    "mem_total_gb": round(status.get("memory", {}).get("total", 0) / 1073741824, 2),
                    "mem_percent": round(
                        status.get("memory", {}).get("used", 0) /
                        max(status.get("memory", {}).get("total", 1), 1) * 100, 1
                    ),
                    "disk_used_gb": round(status.get("rootfs", {}).get("used", 0) / 1073741824, 2),
                    "disk_total_gb": round(status.get("rootfs", {}).get("total", 0) / 1073741824, 2),
                    "uptime": status.get("uptime", 0),
                })
            except Exception:
                result.append({
                    "node": name,
                    "status": "offline",
                    "cpu": 0, "mem_used_gb": 0, "mem_total_gb": 0,
                    "mem_percent": 0, "disk_used_gb": 0, "disk_total_gb": 0,
                    "uptime": 0,
                })
        return result

    except ProxmoxError as e:
        raise HTTPException(status_code=503, detail={"status": "degraded", "detail": str(e)})


@router.get("/{node}/status")
def get_node_status(node: str, current_user=Depends(get_current_user)):
    """Stato dettagliato di un singolo nodo."""
    try:
        proxmox = get_proxmox_client()
        status = proxmox.nodes(node).status.get()
        return {
            "node": node,
            "cpu": round(status.get("cpu", 0) * 100, 1),
            "mem_used_gb": round(status.get("memory", {}).get("used", 0) / 1073741824, 2),
            "mem_total_gb": round(status.get("memory", {}).get("total", 0) / 1073741824, 2),
            "disk_used_gb": round(status.get("rootfs", {}).get("used", 0) / 1073741824, 2),
            "disk_total_gb": round(status.get("rootfs", {}).get("total", 0) / 1073741824, 2),
            "uptime": status.get("uptime", 0),
            "kernel_version": status.get("kversion", ""),
            "pve_version": status.get("pveversion", ""),
        }
    except ProxmoxError as e:
        raise HTTPException(status_code=503, detail={"status": "degraded", "detail": str(e)})
