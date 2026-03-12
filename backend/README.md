# 🚀 Backend - API Clínica Médica (Node.js + Express + TypeScript)

## 📋 Pré-requisitos

Antes de rodar o backend, certifique-se de que:

- ✅ PostgreSQL está instalado e rodando
- ✅ Banco de dados `clinica_medica` foi criado
- ✅ Script `database/schema.sql` foi executado
- ✅ Node.js 18+ está instalado

---

## 🔧 Como Rodar

### 1️⃣ Instalar dependências

```bash
cd backend
npm install
```

### 2️⃣ Configurar variáveis de ambiente

Copie o arquivo `.env.example` para `.env` e preencha com suas credenciais do PostgreSQL:

```bash
cp .env.example .env
```

Edite o arquivo `.env`:

```env
PORT=3000
NODE_ENV=development

# Preencha com suas credenciais do PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=clinica_medica
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui

CORS_ORIGIN=http://localhost:5173
```

### 3️⃣ Rodar em modo de desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em: **http://localhost:3000**

### 4️⃣ Testar os endpoints

**Health Check:**
```bash
curl http://localhost:3000/health
```

**Resumo de Faturamento (Fevereiro/2025):**
```bash
curl "http://localhost:3000/api/v1/faturamento/resumo?mes=2&ano=2025"
```

**Detalhes do Paciente 1 (com CPF mascarado):**
```bash
curl http://localhost:3000/api/v1/pacientes/1
```

---

## 📖 Documentação da API

A documentação completa está no arquivo **`swagger.yaml`** na raiz do projeto.

Para visualizar no Swagger UI online:
1. Acesse: https://editor.swagger.io/
2. Copie o conteúdo do `swagger.yaml`
3. Cole no editor

---

## 🛡️ Validação de Governança (Spectral)

Para validar se o contrato OpenAPI respeita as regras de governança:

```bash
# Instalar Spectral globalmente (se ainda não tiver)
npm install -g @stoplight/spectral-cli

# Voltar para a raiz do projeto
cd ..

# Executar lint no swagger.yaml
spectral lint swagger.yaml
```

Se houver **errors**, a API NÃO deve ser publicada (Design-First bloqueado).

---

## 📂 Estrutura do Código

```
backend/
├── src/
│   ├── config/
│   │   └── database.ts          # Pool de conexões PostgreSQL
│   ├── controllers/
│   │   ├── faturamento.controller.ts   # Lógica dos endpoints de faturamento
│   │   └── pacientes.controller.ts     # Lógica dos endpoints de pacientes
│   ├── services/
│   │   ├── faturamento.service.ts      # Consome Stored Procedure
│   │   └── pacientes.service.ts        # Mascara CPF (LGPD)
│   ├── routes/
│   │   ├── index.ts                    # Roteador principal
│   │   ├── faturamento.routes.ts       # Rotas de faturamento
│   │   └── pacientes.routes.ts         # Rotas de pacientes
│   ├── middlewares/
│   │   └── errorHandler.ts             # Tratamento centralizado de erros
│   ├── utils/
│   │   └── cpfMask.ts                  # Utilitário de mascaramento LGPD
│   └── index.ts                        # Servidor Express
├── package.json
├── tsconfig.json
├── .env.example
└── README.md (este arquivo)
```

---

## 🎯 Endpoints Disponíveis

### GET /health
**Descrição:** Verifica se a API está online  
**Resposta:**
```json
{
  "status": "OK",
  "timestamp": "2026-03-11T10:30:00.000Z",
  "uptime": 123.456
}
```

### GET /api/v1/faturamento/resumo
**Descrição:** Consome Stored Procedure de faturamento consolidado  
**Query Params:**
- `mes` (number, 1-12): Mês de referência
- `ano` (number, 2020-2030): Ano de referência

**Exemplo:**
```bash
curl "http://localhost:3000/api/v1/faturamento/resumo?mes=2&ano=2025"
```

**Resposta:**
```json
{
  "totalConsultas": 6,
  "totalFaturado": 2560.00,
  "totalRessarcido": 150.00,
  "totalPendente": 1030.00,
  "consultasPorConvenio": [
    {
      "convenioId": 1,
      "quantidade": 3,
      "valorTotal": 1030.00
    }
  ]
}
```

### GET /api/v1/pacientes/:id
**Descrição:** Busca paciente por ID (com CPF mascarado - LGPD)  
**Path Params:**
- `id` (number): ID do paciente

**Exemplo:**
```bash
curl http://localhost:3000/api/v1/pacientes/1
```

**Resposta:**
```json
{
  "id": 1,
  "nomeCompleto": "Maria Silva Santos",
  "cpfMascarado": "***.***. ***-01",
  "dataNascimento": "1985-03-15",
  "telefone": "11987654321",
  "email": "maria.silva@email.com",
  "convenioId": 1,
  "totalConsultas": 2,
  "totalGasto": 650.00
}
```

---

## 🔐 Conformidade LGPD

O mascaramento de CPF ocorre na função `maskCPF()` em `src/utils/cpfMask.ts`.

**Antes (no banco):** `12345678901`  
**Depois (na API):** `***.***. ***-01`

Isso garante que o Frontend nunca recebe dados sensíveis desnecessariamente (Art. 6º, III da LGPD).

---

## 🐛 Troubleshooting

**Erro: "Erro ao conectar no PostgreSQL"**
- Verifique se o PostgreSQL está rodando
- Verifique as credenciais no `.env`
- Teste a conexão: `psql -U postgres -d clinica_medica -c "SELECT 1"`

**Erro: "relation vw_paciente_detalhado does not exist"**
- O script `database/schema.sql` não foi executado
- Execute: `psql -U postgres -d clinica_medica -f database/schema.sql`

**Porta 3000 já está em uso**
- Altere a porta no `.env`: `PORT=3001`

---

## ✅ Checklist de Validação

Antes de avançar para o Frontend, confirme:

- [ ] Backend sobe sem erros (`npm run dev`)
- [ ] Health check retorna 200 OK
- [ ] Endpoint `/faturamento/resumo?mes=2&ano=2025` retorna dados
- [ ] Endpoint `/pacientes/1` retorna dados com CPF mascarado
- [ ] Spectral não apresenta **errors** no `swagger.yaml`

---

**📌 Próximo passo:** Implementar o Frontend React que consumirá esta API!
