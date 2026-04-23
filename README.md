# PWMO — Proxmox Web Management Orchestrator

Portale web leggero per la gestione di VM e container Proxmox, sviluppato per **INFORMIX Spa**.
Stack: **FastAPI** (backend) + **React** (frontend) + **PostgreSQL** (database), tutto containerizzato con Docker.

---

## Avvio rapido (sviluppo locale)

### 1. Prerequisiti
- Docker Desktop installato e avviato
- Git

### 2. Clona il progetto e configura le variabili
```bash
git clone <url-repo>
cd pwmo
cp .env.example .env
# Modifica .env con i dati del tuo cluster Proxmox
```

### 3. Avvia tutto con un solo comando
```bash
docker compose --profile dev up --build
```

L'app sarà disponibile su:
- **Frontend**: http://localhost
- **Backend API docs**: http://localhost:8000/docs

### 4. Login di default
| Username | Password |
|----------|----------|
| admin    | admin123 |

> Cambia la password admin subito dopo il primo accesso.

---

## Variabili d'ambiente

| Variabile | Descrizione | Obbligatoria |
|-----------|-------------|:---:|
| `PROXMOX_HOST` | IP/hostname del nodo Proxmox | ✅ |
| `PROXMOX_TOKEN_NAME` | Nome del token API Proxmox | ✅ |
| `PROXMOX_TOKEN_VALUE` | Valore del token API Proxmox | ✅ |
| `PROXMOX_VERIFY_SSL` | Verifica certificato SSL (default: false) | |
| `PBS_STORAGE` | Nome storage PBS su Proxmox (default: pbs) | |
| `POSTGRES_PASSWORD` | Password database | ✅ |
| `JWT_SECRET` | Chiave segreta per i JWT | ✅ |
| `AWS_SECRET_NAME` | Nome secret su AWS Secrets Manager (solo prod) | |
| `AWS_REGION` | Regione AWS (default: eu-west-1) | |

---

## Come creare il token API su Proxmox

1. Accedi all'interfaccia Proxmox → **Datacenter → Permissions → API Tokens**
2. Clicca **Add** e crea un token per l'utente `root@pam`
3. Copia il valore del token e inseriscilo in `PROXMOX_TOKEN_VALUE`
4. Assegna i permessi necessari: `VM.PowerMgmt`, `VM.Backup`, `Datastore.Audit`

---

## Deploy produzione con AWS

### Step 1 — Crea il secret su AWS Secrets Manager
```json
{
  "PROXMOX_HOST": "192.168.1.10",
  "PROXMOX_TOKEN_NAME": "pwmo",
  "PROXMOX_TOKEN_VALUE": "xxxx-xxxx",
  "DATABASE_URL": "postgresql://user:pass@rds-endpoint:5432/pwmo",
  "JWT_SECRET": "segreto-sicuro"
}
```

```bash
aws secretsmanager create-secret \
  --name pwmo/production \
  --secret-string file://secrets.json
```

### Step 2 — Crea i repository su AWS ECR
```bash
aws ecr create-repository --repository-name pwmo-backend
aws ecr create-repository --repository-name pwmo-frontend
```

### Step 3 — Build e push delle immagini
```bash
# Autenticati su ECR
aws ecr get-login-password --region eu-west-1 | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.eu-west-1.amazonaws.com

# Backend
docker build -t pwmo-backend ./backend
docker tag pwmo-backend:latest <account-id>.dkr.ecr.eu-west-1.amazonaws.com/pwmo-backend:latest
docker push <account-id>.dkr.ecr.eu-west-1.amazonaws.com/pwmo-backend:latest

# Frontend
docker build -t pwmo-frontend ./frontend
docker tag pwmo-frontend:latest <account-id>.dkr.ecr.eu-west-1.amazonaws.com/pwmo-frontend:latest
docker push <account-id>.dkr.ecr.eu-west-1.amazonaws.com/pwmo-frontend:latest
```

### Step 4 — Avvia in produzione (senza postgres locale, usa RDS)
```bash
# Imposta AWS_SECRET_NAME nel tuo ambiente di produzione
export AWS_SECRET_NAME=pwmo/production
docker compose up --build
# Nota: senza --profile dev il container postgres NON viene avviato
```

---

## Struttura del progetto
```
pwmo/
├── backend/
│   ├── app/
│   │   ├── main.py          # Entrypoint FastAPI
│   │   ├── secrets.py       # Loader AWS Secrets Manager
│   │   ├── proxmox.py       # Client Proxmox con gestione errori
│   │   ├── db.py            # Modelli SQLAlchemy + init DB
│   │   └── routes/
│   │       ├── auth.py      # Login + JWT
│   │       ├── nodes.py     # Stato nodi cluster
│   │       ├── vms.py       # Lista VM + power management
│   │       ├── metrics.py   # Timeseries CPU/RAM
│   │       └── backups.py   # Snapshot PBS
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Inventory.jsx
│   │   │   ├── Metrics.jsx
│   │   │   └── Backups.jsx
│   │   ├── api/client.js
│   │   └── App.jsx
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Scelte tecniche

**FastAPI** è stato scelto per l'alta velocità di sviluppo, la generazione automatica della documentazione Swagger e il supporto nativo agli endpoint asincroni.

**proxmoxer** è la libreria standard per le API Proxmox in Python: gestisce l'autenticazione tramite token, la sessione e il retry automatico.

**Secrets all'avvio**: `secrets.py` viene eseguito nell'evento `lifespan` di FastAPI prima che qualsiasi route sia attiva. Se `AWS_SECRET_NAME` non è impostato (sviluppo locale) la funzione non fa nulla e vengono usate le variabili già presenti.

**Error handling PBS**: ogni chiamata a Proxmox è avvolta in un try/except. Se PBS è irraggiungibile il backend restituisce HTTP 503 con `{"status": "degraded"}`. Il frontend mostra un banner di avviso senza crashare.

**Database dual-mode**: in sviluppo il container `db` viene avviato con `--profile dev`. In produzione `DATABASE_URL` viene iniettato da Secrets Manager e punta a RDS; il container postgres non viene avviato.
