# Backend - API Clinica Medica (Node.js + Express + TypeScript)

Este backend implementa uma camada de plataforma para expor funcionalidades de um banco legado de forma governada, com foco em:

- desacoplamento entre API e SQL legado
- conformidade com LGPD (mascaramento de CPF)
- governanca de contrato OpenAPI com Spectral
- autenticacao JWT para endpoints protegidos
- validacao de entrada com Zod
- testes unitarios com Jest
- pipeline de CI com GitHub Actions

## 1. O que foi implementado

### 1.1 Arquitetura por camadas

Fluxo principal da aplicacao:

`route -> middleware -> controller -> service -> repository -> banco`

Resumo das responsabilidades:

- `routes`: definicao de endpoints e composicao de middlewares
- `middlewares`: autenticacao JWT, validacao e tratamento padronizado de erros
- `controllers`: orquestracao da requisicao/resposta HTTP
- `services`: regra de negocio e transformacao de dados
- `repositories`: acesso ao banco e queries SQL

### 1.2 Seguranca e controle de acesso

- endpoint de login: `POST /api/v1/auth/login`
- autenticacao com `Authorization: Bearer <token>`
- duas roles fixas: `admin` e `user`
- token com expiracao de 1 hora
- protecao JWT aplicada nas rotas de faturamento e pacientes

### 1.3 Validacao de entrada

Foi adicionada validacao com Zod:

- `mes`: inteiro entre 1 e 12
- `ano`: inteiro de 4 digitos
- `id`: inteiro positivo

Erros de validacao retornam HTTP 400 no formato padronizado.

### 1.4 Padrao de erros

Todas as respostas de erro seguem o formato:

```json
{
  "code": "STRING",
  "message": "STRING",
  "traceId": "UUID"
}
```

Mapeamento de codigos por status:

- 400 -> `VALIDATION_ERROR`
- 401 -> `UNAUTHORIZED`
- 403 -> `FORBIDDEN`
- 404 -> `NOT_FOUND`
- 500 -> `INTERNAL_ERROR`

### 1.5 Governanca de API

- contrato OpenAPI em `../swagger.yaml`
- ruleset Spectral em `../.spectral.yaml`
- o build do backend foi configurado para executar lint do contrato antes do `tsc`

### 1.6 Qualidade e automacao

- testes unitarios com Jest (`npm test`)
- pipeline de CI em `.github/workflows/ci.yml`

---

## 2. Pre-requisitos

- Node.js 18+
- npm 9+
- PostgreSQL em execucao
- banco `clinica_medica` criado e populado com `database/schema.sql`

---

## 3. Variaveis de ambiente

Crie um arquivo `.env` na pasta `backend`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica_medica
DB_USER=postgres
DB_PASSWORD=sua_senha

CORS_ORIGIN=http://localhost:5173

# opcional (se nao informar, usa fallback tcc_secret_dev)
JWT_SECRET=troque_esta_chave_em_producao
```

---

## 4. Como executar

### 4.1 Instalar dependencias

```bash
cd backend
npm install
```

### 4.2 Ambiente de desenvolvimento

```bash
npm run dev
```

### 4.3 Build

```bash
npm run build
```

### 4.4 Testes

```bash
npm test
```

---

## 5. Endpoints principais

### 5.1 Health check

`GET /health`

Exemplo de resposta:

```json
{
  "status": "OK",
  "timestamp": "2026-04-17T10:30:00.000Z",
  "uptime": 123.456
}
```

### 5.2 Readiness check

`GET /ready`

- retorna `200` quando o banco responde `SELECT 1`
- retorna `503` quando o banco esta indisponivel

Resposta de indisponibilidade:

```json
{
  "code": "DATABASE_UNAVAILABLE",
  "message": "Banco de dados indisponivel",
  "traceId": "57ec3e90-a0f8-4b16-91c0-4d3f89f8b53b"
}
```

### 5.3 Login

`POST /api/v1/auth/login`

Credenciais hardcoded para demonstracao:

- admin: `admin/admin123`
- user: `user/user123`

Exemplo:

```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Resposta esperada:

```json
{
  "accessToken": "<jwt>",
  "tokenType": "Bearer",
  "expiresIn": 3600,
  "role": "admin"
}
```

### 5.4 Faturamento (protegido)

`GET /api/v1/faturamento/resumo?mes=2&ano=2025`

Requer token JWT no header Authorization.

### 5.5 Pacientes (protegido)

`GET /api/v1/pacientes/:id`

Requer token JWT no header Authorization.

---

## 6. Estrutura de pastas (backend)

```text
backend/
  src/
    config/
    controllers/
      auth.controller.ts
      faturamento.controller.ts
      pacientes.controller.ts
    middlewares/
      auth.ts
      errorHandler.ts
      validate.ts
    repositories/
      faturamento.repository.ts
      pacientes.repository.ts
    routes/
      auth.routes.ts
      faturamento.routes.ts
      pacientes.routes.ts
      index.ts
    schemas/
      faturamento.schema.ts
      pacientes.schema.ts
    services/
      faturamento.service.ts
      pacientes.service.ts
    utils/
      cpfMask.ts
    index.ts
  tests/
    middlewares/
      auth.middleware.test.ts
    services/
      faturamento.service.test.ts
    utils/
      cpfMask.test.ts
  jest.config.ts
  tsconfig.jest.json
  tsconfig.json
  package.json
  README.md
```

---

## 7. Referencia ao pipeline de CI

Pipeline configurado em:

- `.github/workflows/ci.yml`

Ordem das etapas:

1. checkout
2. setup-node (v18)
3. npm ci (backend)
4. npm run lint:spectral (backend)
5. npm test (backend)
6. npm run build (backend)

Qualquer falha interrompe o pipeline.

---

## 8. Troubleshooting rapido

### 8.1 Erro de conexao com PostgreSQL

- confirme que o servico do PostgreSQL esta ativo
- confirme host, porta, usuario e senha no `.env`
- teste conexao manual com `SELECT 1`

### 8.2 Relacao nao encontrada no banco

Se aparecer erro de tabela/view/function ausente, rode o script:

```bash
psql -U postgres -d clinica_medica -f database/schema.sql
```

### 8.3 Porta ocupada

Altere `PORT` no `.env` (ex.: 3001).

---

## 9. Apendice A - Evidencias tecnicas

### A.1 Evidencia de build (Spectral + TypeScript)

Comando executado no backend:

```bash
npm run build
```

Saida registrada:

```text
> tcc-plataforma-medica-backend@1.0.0 build
> npm run lint:spectral && tsc


> tcc-plataforma-medica-backend@1.0.0 lint:spectral
> spectral lint ../swagger.yaml --ruleset ../.spectral.yaml


c:/Users/jose.ailton/Documents/TCC-PROJETO/swagger.yaml
   9:6   warning  info-license           Info object must have "license" object.
                        info
   9:6   warning  license-url            License object must include "url".
                        info
  24:11  warning  contact-properties     Contact object must have "name", "url" 
and "email".            info.contact
 161:10  warning  operation-description  Operation "description" must be present
 and non-empty string.  paths./auth/login.post
 161:10  warning  operation-operationId  Operation must have "operationId".
                        paths./auth/login.post
  218:9  warning  operation-operationId  Operation must have "operationId".
                        paths./faturamento/resumo.get
  313:9  warning  operation-operationId  Operation must have "operationId".
                        paths./pacientes/{id}.get

✖ 7 problems (0 errors, 7 warnings, 0 infos, 0 hints)
```

### A.2 Evidencia de testes unitarios

Comando executado no backend:

```bash
npm test
```

Saida registrada:

```text
> tcc-plataforma-medica-backend@1.0.0 test
> jest --runInBand

PASS  tests/middlewares/auth.middleware.test.ts
PASS  tests/services/faturamento.service.test.ts
PASS  tests/utils/cpfMask.test.ts

Test Suites: 3 passed, 3 total
Tests:       9 passed, 9 total
Snapshots:   0 total
Time:        1.656 s
Ran all test suites.
```

### A.3 Nota metodologica sobre bloqueio de execucao local

Durante a tentativa de validacao HTTP em runtime (`/health`, `/ready` e `/api/v1/auth/login`) no ambiente local de avaliacao, a API nao subiu por indisponibilidade do PostgreSQL em `localhost:5432` (erro de conexao recusada).

Consequencia metodologica:

- os endpoints HTTP ficaram inacessiveis no ambiente de coleta
- as evidencias de build e testes foram obtidas integralmente
- a camada de codigo para `health`, `ready`, autenticacao e middlewares foi implementada e compilada sem erros bloqueantes

Esta condicao caracteriza limitacao de infraestrutura local, e nao de implementacao do backend.
