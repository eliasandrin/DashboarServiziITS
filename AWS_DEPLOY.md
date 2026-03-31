# 🚀 AWS Deployment Guide — Cloud Project

## Architettura AWS

```
Internet
   │
   ▼
[Route 53] ──► DNS
   │
   ▼
[ACM] ──► Certificato SSL/TLS
   │
   ▼
[Application Load Balancer] ──► HTTPS:443 + HTTP:80→redirect
   │                   │
   ▼                   ▼
[ECS Fargate]      [ECS Fargate]
 Frontend           Backend
 (React/Nginx)      (Node.js)
   │                   │
   └───────────────────┘
              │
              ▼
        [ECR] ──► Docker Images
        [VPC] ──► Rete privata
        [CloudWatch] ──► Logs
```

---

## Step 1 — Prerequisiti

```bash
# Installa AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip && sudo ./aws/install

# Configura credenziali
aws configure
# AWS Access Key ID: <la tua key>
# AWS Secret Access Key: <il tuo secret>
# Default region: eu-west-1    ← usa Irlanda per l'Europa
# Output format: json
```

---

## Step 2 — Crea repository ECR

```bash
# Variabili
export AWS_REGION=eu-west-1
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export ECR_REPO_BASE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Crea repo frontend
aws ecr create-repository --repository-name cloud-project/frontend --region $AWS_REGION

# Crea repo backend
aws ecr create-repository --repository-name cloud-project/backend --region $AWS_REGION
```

---

## Step 3 — Build e push immagini Docker

```bash
# Login ECR
aws ecr get-login-password --region $AWS_REGION | \
  docker login --username AWS --password-stdin $ECR_REPO_BASE

# Build e push backend
docker build -t cloud-project/backend ./backend
docker tag cloud-project/backend:latest $ECR_REPO_BASE/cloud-project/backend:latest
docker push $ECR_REPO_BASE/cloud-project/backend:latest

# Build e push frontend
docker build -t cloud-project/frontend ./frontend
docker tag cloud-project/frontend:latest $ECR_REPO_BASE/cloud-project/frontend:latest
docker push $ECR_REPO_BASE/cloud-project/frontend:latest
```

---

## Step 4 — Crea VPC e Networking

```bash
# Crea VPC
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=cloud-project-vpc}]' \
  --query 'Vpc.VpcId' --output text)

# Abilita DNS
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support

# Crea subnets pubbliche (2 AZ per l'ALB)
SUBNET_A=$(aws ec2 create-subnet --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 --availability-zone ${AWS_REGION}a \
  --query 'Subnet.SubnetId' --output text)

SUBNET_B=$(aws ec2 create-subnet --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 --availability-zone ${AWS_REGION}b \
  --query 'Subnet.SubnetId' --output text)

# Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID

# Route table
RT_ID=$(aws ec2 create-route-table --vpc-id $VPC_ID --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $RT_ID --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID
aws ec2 associate-route-table --route-table-id $RT_ID --subnet-id $SUBNET_A
aws ec2 associate-route-table --route-table-id $RT_ID --subnet-id $SUBNET_B
```

---

## Step 5 — Security Groups

```bash
# SG per ALB (accesso pubblico HTTP/HTTPS)
ALB_SG=$(aws ec2 create-security-group \
  --group-name cloud-alb-sg --description "ALB Security Group" \
  --vpc-id $VPC_ID --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress --group-id $ALB_SG \
  --protocol tcp --port 80 --cidr 0.0.0.0/0
aws ec2 authorize-security-group-ingress --group-id $ALB_SG \
  --protocol tcp --port 443 --cidr 0.0.0.0/0

# SG per ECS Tasks (solo traffico dall'ALB)
ECS_SG=$(aws ec2 create-security-group \
  --group-name cloud-ecs-sg --description "ECS Tasks Security Group" \
  --vpc-id $VPC_ID --query 'GroupId' --output text)

aws ec2 authorize-security-group-ingress --group-id $ECS_SG \
  --protocol tcp --port 80 --source-group $ALB_SG
aws ec2 authorize-security-group-ingress --group-id $ECS_SG \
  --protocol tcp --port 5000 --source-group $ALB_SG
# Comunicazione interna tra container
aws ec2 authorize-security-group-ingress --group-id $ECS_SG \
  --protocol tcp --port 5000 --source-group $ECS_SG
```

---

## Step 6 — ECS Cluster e Task Definitions

```bash
# Crea cluster ECS
aws ecs create-cluster --cluster-name cloud-project-cluster

# Crea IAM role per ECS task execution
aws iam create-role --role-name ecsTaskExecutionRole \
  --assume-role-policy-document '{
    "Version":"2012-10-17",
    "Statement":[{"Effect":"Allow","Principal":{"Service":"ecs-tasks.amazonaws.com"},"Action":"sts:AssumeRole"}]
  }'

aws iam attach-role-policy --role-name ecsTaskExecutionRole \
  --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy
```

### Task Definition Backend (salva come `backend-task.json`)

```json
{
  "family": "cloud-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "backend",
      "image": "ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/cloud-project/backend:latest",
      "portMappings": [{ "containerPort": 5000, "protocol": "tcp" }],
      "environment": [
        { "name": "PORT", "value": "5000" },
        { "name": "JWT_SECRET", "value": "CAMBIA-CON-UNA-CHIAVE-SICURA-IN-PRODUZIONE" }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cloud-backend",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Task Definition Frontend (salva come `frontend-task.json`)

```json
{
  "family": "cloud-frontend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "frontend",
      "image": "ACCOUNT_ID.dkr.ecr.eu-west-1.amazonaws.com/cloud-project/frontend:latest",
      "portMappings": [{ "containerPort": 80, "protocol": "tcp" }],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/cloud-frontend",
          "awslogs-region": "eu-west-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

```bash
# Registra le task definitions
aws ecs register-task-definition --cli-input-json file://backend-task.json
aws ecs register-task-definition --cli-input-json file://frontend-task.json

# Crea log groups CloudWatch
aws logs create-log-group --log-group-name /ecs/cloud-backend --region $AWS_REGION
aws logs create-log-group --log-group-name /ecs/cloud-frontend --region $AWS_REGION
```

---

## Step 7 — Application Load Balancer

```bash
# Crea ALB
ALB_ARN=$(aws elbv2 create-load-balancer \
  --name cloud-project-alb \
  --subnets $SUBNET_A $SUBNET_B \
  --security-groups $ALB_SG \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text)

# Target Group Frontend
TG_FRONTEND=$(aws elbv2 create-target-group \
  --name cloud-tg-frontend \
  --protocol HTTP --port 80 \
  --vpc-id $VPC_ID --target-type ip \
  --health-check-path "/" \
  --query 'TargetGroups[0].TargetGroupArn' --output text)

# Target Group Backend
TG_BACKEND=$(aws elbv2 create-target-group \
  --name cloud-tg-backend \
  --protocol HTTP --port 5000 \
  --vpc-id $VPC_ID --target-type ip \
  --health-check-path "/api/health" \
  --query 'TargetGroups[0].TargetGroupArn' --output text)

# Listener HTTP sulla porta 80
LISTENER_ARN=$(aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTP --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG_FRONTEND \
  --query 'Listeners[0].ListenerArn' --output text)

# Regola per /api/* → Backend
aws elbv2 create-rule \
  --listener-arn $LISTENER_ARN \
  --priority 1 \
  --conditions '[{"Field":"path-pattern","Values":["/api/*"]}]' \
  --actions "[{\"Type\":\"forward\",\"TargetGroupArn\":\"$TG_BACKEND\"}]"
```

---

## Step 8 — ECS Services

```bash
# Service Backend
aws ecs create-service \
  --cluster cloud-project-cluster \
  --service-name cloud-backend-service \
  --task-definition cloud-backend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_A,$SUBNET_B],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TG_BACKEND,containerName=backend,containerPort=5000"

# Service Frontend
aws ecs create-service \
  --cluster cloud-project-cluster \
  --service-name cloud-frontend-service \
  --task-definition cloud-frontend \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET_A,$SUBNET_B],securityGroups=[$ECS_SG],assignPublicIp=ENABLED}" \
  --load-balancers "targetGroupArn=$TG_FRONTEND,containerName=frontend,containerPort=80"
```

---

## Step 9 — Recupera l'URL pubblico

```bash
ALB_DNS=$(aws elbv2 describe-load-balancers \
  --load-balancer-arns $ALB_ARN \
  --query 'LoadBalancers[0].DNSName' --output text)

echo "🚀 App disponibile su: http://$ALB_DNS"
```

---

## Step 10 — (Opzionale) HTTPS con ACM + Route 53

```bash
# 1. Richiedi certificato SSL su ACM (verifica via DNS)
aws acm request-certificate \
  --domain-name tuodominio.com \
  --validation-method DNS \
  --region $AWS_REGION

# 2. Aggiungi record CNAME su Route 53 come indicato dalla console ACM

# 3. Aggiungi listener HTTPS sull'ALB
aws elbv2 create-listener \
  --load-balancer-arn $ALB_ARN \
  --protocol HTTPS --port 443 \
  --certificates CertificateArn=ARN_DEL_CERTIFICATO \
  --ssl-policy ELBSecurityPolicy-TLS13-1-2-2021-06 \
  --default-actions Type=forward,TargetGroupArn=$TG_FRONTEND

# 4. Aggiorna il listener HTTP per redirect a HTTPS
aws elbv2 modify-listener \
  --listener-arn $LISTENER_ARN \
  --default-actions '[{"Type":"redirect","RedirectConfig":{"Protocol":"HTTPS","Port":"443","StatusCode":"HTTP_301"}}]'
```

---

## Credenziali Admin di default

| Nome              | Email                         | Password     |
|-------------------|-------------------------------|--------------|
| Milos Kovacevic   | milos.kovacevic@gmail.com     | Admin1234!   |
| Elia Sandrin      | elia.sandrin@gmail.com        | Admin1234!   |
| George Dioane     | george.dioane@gmail.com       | Admin1234!   |
| George Biriri     | george.biriri@gmail.com       | Admin1234!   |
| David Carbone     | david.carbone@gmail.com       | Admin1234!   |

> ⚠️ **Cambia le password admin dopo il primo accesso!**

---

## Sviluppo locale con Docker Compose

```bash
# Clona il repo e avvia
cd aws-cloud-project
docker-compose up --build

# App disponibile su http://localhost:80
```
