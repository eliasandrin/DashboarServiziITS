from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

from app.secrets import load_secrets
from app.db import init_db
from app.routes import auth, nodes, vms, metrics, backups


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Carica secrets da AWS Secrets Manager all'avvio
    load_secrets()
    # Inizializza le tabelle del database
    init_db()
    yield


app = FastAPI(
    title="PWMO - Proxmox Web Management Orchestrator",
    description="Portale di gestione Proxmox per INFORMIX Spa",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,    prefix="/api/auth",    tags=["auth"])
app.include_router(nodes.router,   prefix="/api/nodes",   tags=["nodes"])
app.include_router(vms.router,     prefix="/api/vms",     tags=["vms"])
app.include_router(metrics.router, prefix="/api/metrics", tags=["metrics"])
app.include_router(backups.router, prefix="/api/backups", tags=["backups"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "PWMO Backend"}
