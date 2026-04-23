# Test Plan — PWMO

## 1. Autenticazione

| Test | Metodo | Endpoint | Input | Risultato atteso |
|------|--------|----------|-------|-----------------|
| Login corretto | POST | /api/auth/login | username=admin, password=admin123 | 200 + token JWT |
| Login errato | POST | /api/auth/login | username=admin, password=sbagliata | 401 Unauthorized |
| Accesso senza token | GET | /api/nodes/ | — | 401 Unauthorized |
| Token scaduto | GET | /api/nodes/ | token scaduto | 401 Unauthorized |

## 2. Nodi cluster

| Test | Metodo | Endpoint | Risultato atteso |
|------|--------|----------|-----------------|
| Lista nodi | GET | /api/nodes/ | 200 + array nodi con CPU%, RAM%, disk |
| Stato singolo nodo | GET | /api/nodes/{node}/status | 200 + dettaglio nodo |
| Nodo offline | GET | /api/nodes/{node}/status | 200 con status=offline, valori a 0 |

## 3. VM e Container

| Test | Metodo | Endpoint | Risultato atteso |
|------|--------|----------|-----------------|
| Lista tutte le VM | GET | /api/vms/ | 200 + array VM/LXC con campi normalizzati |
| Start VM | POST | /api/vms/{node}/qemu/{vmid}/start | 200 + task ID |
| Stop VM | POST | /api/vms/{node}/qemu/{vmid}/stop | 200 + task ID |
| Shutdown VM | POST | /api/vms/{node}/qemu/{vmid}/shutdown | 200 + task ID |
| Reboot VM | POST | /api/vms/{node}/qemu/{vmid}/reboot | 200 + task ID |
| Start LXC | POST | /api/vms/{node}/lxc/{vmid}/start | 200 + task ID |

## 4. Metriche

| Test | Metodo | Endpoint | Risultato atteso |
|------|--------|----------|-----------------|
| Metriche VM (ultimi 30 min) | GET | /api/metrics/{node}/qemu/{vmid} | 200 + array datapoints con time, cpu, mem_percent |
| Metriche nodo | GET | /api/metrics/node/{node} | 200 + array datapoints |
| CPU normalizzata | — | — | Valore tra 0 e 100 (non decimale Proxmox) |
| RAM normalizzata | — | — | Valore in MB, non in byte |

## 5. Backup e Snapshot

| Test | Metodo | Endpoint | Risultato atteso |
|------|--------|----------|-----------------|
| Lista backup VM | GET | /api/backups/{node}/{vmid} | 200 + array backup con ctime, size_gb, storage |
| Trigger snapshot | POST | /api/backups/{node}/qemu/{vmid}/snapshot | 200 + task ID |
| PBS offline | POST | /api/backups/.../snapshot | 503 con message "PBS non raggiungibile" |
| Nessun backup | GET | /api/backups/{node}/{vmid} | 200 + backups: [] |

## 6. Error Handling

| Scenario | Comportamento atteso |
|----------|---------------------|
| Proxmox non raggiungibile | HTTP 503 con {"status":"degraded","detail":"..."} — app NON crasha |
| PBS offline | HTTP 503, frontend mostra banner giallo di avviso |
| Credenziali Proxmox mancanti | Errore al boot con log chiaro, non crash silenzioso |
| Database non raggiungibile | Errore al boot con log chiaro |
| JWT Secret mancante | Usa valore di default in dev, errore in prod se non impostato |

## 7. Come eseguire i test con curl

```bash
# 1. Login e salva il token
TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -d "username=admin&password=admin123" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# 2. Lista nodi
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/nodes/

# 3. Lista VM
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/vms/

# 4. Metriche (sostituisci node e vmid)
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/metrics/pve1/qemu/100

# 5. Start VM
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/vms/pve1/qemu/100/start

# 6. Trigger snapshot
curl -X POST -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/backups/pve1/qemu/100/snapshot
```

## 8. Test interfaccia web

1. Aprire http://localhost
2. Effettuare il login con admin / admin123
3. Verificare che la Dashboard mostri i nodi con CPU, RAM e disco
4. Navigare su Inventario e verificare la lista VM
5. Fare Start su una VM ferma e verificare che lo status cambi a "running"
6. Navigare su Metriche, selezionare una VM e verificare i grafici
7. Navigare su Backup, verificare la lista snapshot e avviare un nuovo snapshot
8. Verificare il banner di avviso se PBS non è raggiungibile
