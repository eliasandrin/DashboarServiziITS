from fastapi import APIRouter, Depends, HTTPException
from app.proxmox import get_proxmox_client, ProxmoxError
from app.routes.auth import get_current_user

router = APIRouter()


@router.get("/{node}/{vm_type}/{vmid}")
def get_vm_metrics(node: str, vm_type: str, vmid: int, current_user=Depends(get_current_user)):
    """
    Restituisce la timeseries CPU e RAM degli ultimi 30 minuti per una VM.
    Proxmox restituisce rrddata con timeframe 'hour' (risoluzione ~1 min).
    """
    try:
        proxmox = get_proxmox_client()

        if vm_type == "qemu":
            data = proxmox.nodes(node).qemu(vmid).rrddata.get(timeframe="hour", cf="AVERAGE")
        else:
            data = proxmox.nodes(node).lxc(vmid).rrddata.get(timeframe="hour", cf="AVERAGE")

        # Prende gli ultimi 30 campioni (~30 minuti)
        recent = data[-30:] if len(data) >= 30 else data

        result = []
        for point in recent:
            cpu_raw = point.get("cpu", 0) or 0
            mem_used = point.get("mem", 0) or 0
            mem_total = point.get("maxmem", 0) or 1
            result.append({
                "time": point.get("time"),
                "cpu": round(cpu_raw * 100, 1),
                "mem_percent": round(mem_used / mem_total * 100, 1),
                "mem_used_mb": round(mem_used / 1048576, 0),
            })

        return {"vmid": vmid, "node": node, "datapoints": result}

    except ProxmoxError as e:
        raise HTTPException(status_code=503, detail={"status": "degraded", "detail": str(e)})


@router.get("/node/{node}")
def get_node_metrics(node: str, current_user=Depends(get_current_user)):
    """Timeseries CPU e RAM del nodo stesso negli ultimi 30 minuti."""
    try:
        proxmox = get_proxmox_client()
        data = proxmox.nodes(node).rrddata.get(timeframe="hour", cf="AVERAGE")
        recent = data[-30:] if len(data) >= 30 else data

        result = []
        for point in recent:
            cpu_raw = point.get("cpu", 0) or 0
            mem_used = point.get("memused", 0) or 0
            mem_total = point.get("memtotal", 0) or 1
            result.append({
                "time": point.get("time"),
                "cpu": round(cpu_raw * 100, 1),
                "mem_percent": round(mem_used / mem_total * 100, 1),
            })

        return {"node": node, "datapoints": result}

    except ProxmoxError as e:
        raise HTTPException(status_code=503, detail={"status": "degraded", "detail": str(e)})
