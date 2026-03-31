# ⬡ AWS Cloud Project

Webapp protetta da login con dashboard servizi, timeline interattiva e ruoli admin/utente.

## Stack
- **Frontend**: React 18 + Nginx
- **Backend**: Node.js + Express + JWT
- **Deploy**: Docker / AWS ECS Fargate + ALB + ECR

## Avvio rapido (locale)

```bash
# 1. Copia il file di ambiente
cp .env.example .env

# 2. Avvia con Docker Compose
docker-compose up --build

# 3. Apri il browser
open http://localhost
```

## Credenziali admin

| Email | Password |
|-------|----------|
| milos.kovacevic@gmail.com | Admin1234! |
| elia.sandrin@gmail.com | Admin1234! |
| george.dioane@gmail.com | Admin1234! |
| george.biriri@gmail.com | Admin1234! |
| david.carbone@gmail.com | Admin1234! |

Gli utenti normali possono registrarsi liberamente dal form.

## Struttura progetto

```
aws-cloud-project/
├── backend/
│   ├── src/index.js        # Server Express, routes, JWT auth
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── context/AuthContext.js
│   │   ├── pages/
│   │   │   ├── AuthPage.js       # Login / Registrazione
│   │   │   ├── Dashboard.js      # Dashboard servizi
│   │   │   └── TimelinePage.js   # Timeline principale
│   │   └── components/
│   │       ├── TimelineNode.js   # Singolo nodo timeline
│   │       ├── EditNodeModal.js  # Modal modifica (admin)
│   │       └── UserPanel.js      # Pannello profilo utente
│   ├── public/index.html
│   ├── nginx.conf
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── AWS_DEPLOY.md           # Guida completa deploy AWS
├── .env.example
└── README.md
```

## Deploy su AWS

Vedi **AWS_DEPLOY.md** per la guida completa con:
- ECR (push immagini Docker)
- VPC + Subnet + Security Groups
- ECS Fargate (frontend + backend)
- Application Load Balancer con routing /api/*
- HTTPS con ACM + Route 53 (opzionale)

## Funzionalità

- **Login / Registrazione** con form validato
- **Dashboard** con card servizi
- **Timeline** a nodi alternati — click per aprire dettagli corsi
- **Ruolo ADMIN**: badge visibile + modifica nodi timeline
- **Pannello utente**: info profilo, cambio password
- **Docker Compose** per sviluppo locale
