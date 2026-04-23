from fastapi import APIRouter, Depends, HTTPException
from app.proxmox import get_proxmox_client, ProxmoxError
from app.routes.auth import get_current_user

router = APIRouter()


def _normalize_vm(vm: dict, node: str, vm_type: str) -> dict:
    return {
        "vmid": vm.get("vmid"),
        "name": vm.get("name", f"vm-{vm.get('vmid')}"),
        "node": node,
        "type": vm_type,
        "status": vm.get("status", "unknown"),
        "cpu": round(vm.get("cpu", 0) * 100, 1),
        "mem_used_mb": round(vm.get("mem", 0) / 1048576, 0),
        "mem_total_mb": round(vm.get("maxmem", 0) / 1048576, 0),
        "disk_gb": round(vm.get("disk", 0) / 1073741824, 2),
        "uptime": vm.get("uptime", 0),
    }


@router.get("/")
def get_all_vms(current_user=Depends(get_current_user)):
    """Restituisce tutte le VM e container LXC da tutti i nodi."""
    try:
        proxmox = get_proxmox_client()
        nodes = proxmox.nodes.get()
        all_vms = []

        for node_info in nodes:
            node = node_info.get("node")
            if node_info.get("status") != "online":
                continue
            try:
                qemus = proxmox.nodes(node).qemu.get()
                for vm in qemus:
                    all_vms.append(_normalize_vm(vm, node, "qemu"))
            except Exception:
                pass
            try:
                lxcs = proxmox.nodes(node).lxc.get()
                for ct in lxcs:
                    all_vms.append(_normalize_vm(ct, node, "lxc"))
            except Exception:
                pass

        return all_vms

    except ProxmoxError as e:
        raise HTTPException(status_code=503, detail={"status": "degraded", "detail": str(e)})


@router.get("/{node}/{vm_type}/{vmid}")
def get_vm(node: str, vm_type: str, vmid: int, current_user=Depends(get_current_user)):
    """Stato dettagliato di una singola VM o container."""
    try:
        proxmox = get_proxmox_client()
        if vm_type == "qemu":
            status = proxmox.nodes(node).qemu(vmid).status.current.get()
        else:
            status = proxmox.nodes(node).lxc(vmid).status.current.get()
        return _normalize_vm(status, node, vm_type)
    except ProxmoxError as e:
        raise HTTPException(status_code=503, detail=str(e))


def _power_action(node: str, vm_type: str, vmid: int, action: str):
    """Esegue start / stop / shutdown / reboot su una VM o LXC."""
    try:
        proxmox = get_proxmox_client()
        if vm_type == "qemu":
            target = proxmox.nodes(node).qemu(vmid).status
        else:
            target = proxmox.nodes(node).lxc(vmid).status

        if action == "start":
            task = target.start.post()
        elif action == "stop":
            task = target.stop.post()
        elif action == "shutdown":
            task = target.shutdown.post()
        elif action == "reboot":
            task = target.reboot.post()
        else:
            raise HTTPException(status_code=400, detail="Azione non valida")

        return {"task": task, "action": action, "vmid": vmid, "node": node}

    except ProxmoxError as e:
        raise HTTPException(status_code=503, detail={"status": "degraded", "detail": str(e)})


@router.post("/{node}/{vm_type}/{vmid}/start")
def start_vm(node: str, vm_type: str, vmid: int, current_user=Depends(get_current_user)):
    return _power_action(node, vm_type, vmid, "start")


@router.post("/{node}/{vm_type}/{vmid}/stop")
def stop_vm(node: str, vm_type: str, vmid: int, current_user=Depends(get_current_user)):
    return _power_action(node, vm_type, vmid, "stop")


@router.post("/{node}/{vm_type}/{vmid}/shutdown")
def shutdown_vm(node: str, vm_type: str, vmid: int, current_user=Depends(get_current_user)):
    return _power_action(node, vm_type, vmid, "shutdown")


@router.post("/{node}/{vm_type}/{vmid}/reboot")
def reboot_vm(node: str, vm_type: str, vmid: int, current_user=Depends(get_current_user)):
    return _power_action(node, vm_type, vmid, "reboot")
