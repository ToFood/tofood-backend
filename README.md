# ToFood tech challenge

Projeto em desenvolvimento conforme progresso da pós-graduação da FIAP - Software Architecture

## Membros:

- Leonardo de Almeida Ferreira [rm353533]
- Robert Alves do Anjos [rm353529] 
  <br /><br />

## Links

- [YOUTUBE] : https://youtu.be/a_2wD4GU-P4
- [SWAGGER] : http://localhost:2019/swagger/
- [NOTION] : https://www.notion.so/FAST-FOOD-SYSTEM-f96fe451104340b29864b4611d3e348c
- [MIRO] : https://miro.com/welcomeonboard/bmxDZjE3SGdwYXVHTGpRT0MxMVgyU1gwNUZjNUliODluM1BIRnkxUjhKMXp0SzNNY3dhWkI2WnhCWmxoNnBHUnwzNDU4NzY0NTg1NDEwMDQzNjMyfDI=?share_link_id=781584269137
- [DOCKER IMAGE] : https://hub.docker.com/r/leonardo10sp/tech-challenge
- [POSTMAN INVITE] : https://app.getpostman.com/join-team?invite_code=fbd076935fee97ec62555f1837032175&target_code=ee3d3de9b5097fa6b0cf8d1f6e3a59ca

<br />

# Endpoints

## Users:

- [POST] _/users_ <br />
  exemplo: <br />
  url: http://localhost:3000/users<br />

```
body: {
    "name":"Usuário não identificado",
    "email":"unidentified@gmail.com",
    "cpf":"12345678909"
}
```

- [GET] _/users/{cpf}_ <br />
  exemplo: http://localhost:3000/users/12345678909
  <br /><br /><br />

## Products:

- [POST] _/products_ <br />
  exemplo: <br />
  url: http://localhost:3000/products<br />

```
body: {
    "name":"Dogão",
    "category":"lanche",
    "price":"1300",
    "description": "Super dogão",
    "image": file input
}
```

- [PUT] _/products/{productId}_ <br />
  exemplo: <br />
  url: http://localhost:3000/products/66a1758bf5c6fac16f138b77<br />

- [GET] _/products/{productId}_ <br />
  exemplo: <br />
  url: http://localhost:3000/products/66a1758bf5c6fac16f138b77<br />

- [GET] _/products/category/{categoryName}_ <br />
  exemplo: <br />
  url: http://localhost:3000/products/category/lanche<br />

```
category = "lanche" | "acompanhamento" | "bebida" | "sobremesa"
```

- [DELETE] _/products/{productId}_ <br />
  exemplo: <br />
  url: http://localhost:3000/products/66a1758bf5c6fac16f138b77<br />
  <br /><br />

  ## Orders:

- [POST] _/orders_ <br />
  exemplo: <br />
  url: http://localhost:3000/orders<br />

```
body: {
    "userCpf": 12345678909,
    "products": [
        {"product": "66a1758bf5c6fac16f138b77", "quantity": 2},
        {"product": "66a17627f5c6fac16f138b81", "quantity": 1}
    ]
}
```

- [POST] _/orderPayment_ <br />
  exemplo: <br />
  url: http://localhost:3000/orderPayment<br />

```
body: {
    "orderId": "66a9716938ac0093ffce3d06"
}
```

- [POST] _/order/{orderId}/status}_ <br />
  exemplo: <br />
  url: http://localhost:3000/order/66a969770d6ec4b096cfd7b1/status<br />

```
body: {
    "status": "PREPARING"
}

status = "OPENED" | "RECEIVED" | "PREPARING" | "DONE" | "FINISHED" | "CANCELED"
```

- [GET] _/orders/status_ <br />
  exemplo: <br />
  url: http://localhost:3000/orders/status?status=OPENED<br />

  ```
  params: {
   status=OPENED
  }

  status = "OPENED" | "RECEIVED" | "PREPARING" | "DONE" | "FINISHED" | "CANCELED"
  ```

- [GET] _/order/payment/status_ <br />
  exemplo: <br />
  url: http://localhost:3000/order/payment/status?orderId=66a9716938ac0093ffce3d06<br />

```
 params: {
  orderId=66a9716938ac0093ffce3d06
 }
```

- [GET] _/orders_ <br />
  exemplo: <br />
  url: http://localhost:3000/orders<br />
  <br />

## Kubernetes Deployment

### Pré-requisitos

- Kubernetes instalado e configurado
- `kubectl` configurado para se conectar ao seu cluster Kubernetes
- Docker Desktop (se estiver usando um ambiente local)

# Configuração do Ambiente de Desenvolvimento com Minikube

Este guia descreve como configurar e rodar o ambiente Kubernetes localmente usando Minikube.

## Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- Docker
- Minikube
- kubectl

### Instalação e Configuração do Minikube

#### Windows

1. **Instalar o Minikube usando Chocolatey**:
   Execute o comando abaixo em um terminal (cmd ou PowerShell) para instalar o Minikube:
   ```bash
   choco install minikube
   ```

#### MacOs

1. **Instalar o Minikube usando Homebrew**:
   Execute o comando abaixo em um terminal para instalar o Minikube:

   ```bash
   brew install minikube

   ```

2. **Comandos para rodar o minikube**

   **Rodar no terminal fora do projeto**

   - minikube start
   - kubectl config use-context minikube

     **Rodar no terminal do projeto (raiz)**

   - kubectl apply -f deployments/deployment.yaml
   - kubectl apply -f deployments/service.yaml

     (opcionais)

   - kubectl get pods
   - minikube service tech-challenge-service --url

### Instalação e Configuração do AWS

## Instalando Windows

- msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi

## Instalando MacOs

- [msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi](https://awscli.amazonaws.com/AWSCLIV2.pkg)

# configurando o aws na sua máquina (terminal da máquina)

- aws configure

#### Você preencherá nessa sequência

SUA_KEY
SUA_SECRET_KEY
Default region name: us-east-1
Default output format: json

- Mostrar usuário AWS: aws iam get-user

### Instalação e Configuração do EKSCTL

## Instalando eksctl (terminal da máquina)

- curl -o eksctl.zip https://github.com/weaveworks/eksctl/releases/download/latest_release/eksctl_Windows_amd64.zip
- Expand-Archive -Path ~\Downloads\eksctl_Windows_amd64.zip -DestinationPath ~\Downloads\eksctl

- mkdir "C:\Program Files\eksctl"
- Move-Item -Path ~\Downloads\eksctl\eksctl.exe -Destination "C:\Program Files\eksctl\eksctl.exe"

## Configurando variável de ambiente eksctl (terminal da máquina)

- $env:PATH += ";C:\Program Files\eksctl"
- eksctl version
- eksctl help

## Criando clusters

eksctl create cluster --name tech-challenge-cluster --region us-east-1 --nodes 3

## Atualizando clusters

aws eks --region us-east-1 update-kubeconfig --name tech-challenge-cluster

## Por fim, na raiz do projeto

kubectl apply -f deployments/deployment.yaml
kubectl apply -f deployments/service.yaml

## Visualizar nodes ou pods

kubectl get nodes
kubectl get pods
