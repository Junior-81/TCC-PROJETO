# ⚛️ Frontend - Clínica Médica (React + TypeScript + Vite)

## 📋 Pré-requisitos

Antes de rodar o frontend, certifique-se de que:

- ✅ Backend Node.js está rodando em `http://localhost:3000`
- ✅ Node.js 18+ está instalado
- ✅ Backend foi testado e está funcionando corretamente

---

## 🔧 Como Rodar

### 1️⃣ Instalar dependências

```bash
cd frontend
npm install
```

### 2️⃣ Rodar em modo de desenvolvimento

```bash
npm run dev
```

O frontend estará disponível em: **http://localhost:5173**

O navegador abrirá automaticamente!

---

## 📖 Como Usar a Aplicação

### Página 1: Faturamento (Demonstração de Desacoplamento)

1. Acesse: http://localhost:5173/
2. Selecione o **mês** e **ano** (ex: Fevereiro/2025)
3. Clique em **"Buscar Resumo"**
4. O sistema exibirá:
   - Total de consultas
   - Total faturado
   - Total ressarcido (franquias de convênio)
   - Total pendente
   - Detalhamento por convênio

**🎓 TCC: O que está sendo demonstrado?**
- O Frontend consome um endpoint REST moderno (`GET /faturamento/resumo`)
- Por trás, uma **Stored Procedure complexa** roda no PostgreSQL (cruza 4 tabelas)
- O Frontend **não sabe e não precisa saber** dessa complexidade
- Isso é o **desacoplamento** em ação!

---

### Página 2: Paciente (Demonstração de Conformidade LGPD)

1. Acesse: http://localhost:5173/paciente
2. Digite o **ID do paciente** (ex: 1, 2, 3...)
3. Clique em **"Buscar Paciente"**
4. O sistema exibirá:
   - Nome completo
   - **CPF mascarado** (`***.***. ***-01`)
   - Data de nascimento
   - Telefone, e-mail, convênio
   - Total de consultas e gastos

**🔒 TCC: O que está sendo demonstrado?**
- O banco de dados armazena o CPF completo (`12345678901`)
- A **camada de Plataforma (backend)** mascara o CPF antes de retornar
- O Frontend **NUNCA recebe** o CPF completo
- Isso garante conformidade com a **LGPD (Art. 6º, III - Minimização de Dados)**

---

## 🔍 Como Validar a Conformidade LGPD

1. Abra o **DevTools** do navegador (F12)
2. Vá para a aba **Network**
3. Busque um paciente (ex: ID 1)
4. Clique na requisição `pacientes/1` na aba Network
5. Vá para a aba **Response**
6. Verifique que o campo `cpfMascarado` contém: `"***.***. ***-01"`

✅ **Prova:** O CPF completo NUNCA trafegou pela rede!

---

## 📂 Estrutura do Código

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Faturamento.tsx    # Página de resumo de faturamento
│   │   └── Paciente.tsx        # Página de detalhes do paciente
│   ├── services/
│   │   └── api.ts              # Cliente HTTP (axios) para comunicação com backend
│   ├── types/
│   │   └── index.ts            # Interfaces TypeScript (contratos de dados)
│   ├── App.tsx                 # Componente principal (rotas)
│   ├── App.css                 # Estilos da aplicação
│   ├── main.tsx                # Ponto de entrada React
│   └── index.css               # Estilos globais
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .env.example
└── README.md (este arquivo)
```

---

## 🎨 Funcionalidades da Interface

### Layout Responsivo
- Design moderno com gradientes e animações
- Totalmente responsivo (desktop, tablet, mobile)
- Tema escuro (dark mode nativo)

### Indicadores Visuais de TCC
- **Boxes azuis**: Indicam demonstração de desacoplamento
- **Boxes verdes**: Indicam demonstração de conformidade LGPD
- **Destaque verde no CPF**: CPF mascarado em evidência

### Feedback ao Usuário
- Loading states durante requisições
- Mensagens de erro amigáveis
- Logs no console para debugging (abra o DevTools)

---

## 🛠️ Build para Produção

```bash
npm run build
```

Os arquivos otimizados estarão em `dist/`.

Para testar o build localmente:

```bash
npm run preview
```

---

## 🔐 Segurança e Boas Práticas

### Type Safety (TypeScript)
- Todas as interfaces correspondem aos schemas do `swagger.yaml`
- Type checks em tempo de compilação garantem contratos respeitados

### Validação de Contratos
- Frontend **nunca** assume estrutura de dados
- Sempre valida através de interfaces TypeScript
- Erros de API são tratados de forma padronizada

### CORS
- Backend configurado para aceitar requisições apenas de `http://localhost:5173`
- Em produção, configurar variável `CORS_ORIGIN` no backend

---

## 🐛 Troubleshooting

**Erro: "Failed to fetch" ou "Network Error"**
- Verifique se o backend está rodando em `http://localhost:3000`
- Teste o health check: `curl http://localhost:3000/health`
- Verifique CORS no backend (deve permitir `http://localhost:5173`)

**Erro: "Cannot find module"**
- Apague `node_modules` e rode `npm install` novamente
- Limpe o cache do Vite: `rm -rf node_modules/.vite`

**Porta 5173 já está em uso**
- Modifique a porta no `vite.config.ts`:
  ```ts
  server: {
    port: 5174
  }
  ```

**Dados não carregam**
- Verifique se executou o script `database/schema.sql` no PostgreSQL
- Teste os endpoints manualmente:
  ```bash
  curl "http://localhost:3000/api/v1/faturamento/resumo?mes=2&ano=2025"
  curl http://localhost:3000/api/v1/pacientes/1
  ```

---

## ✅ Checklist de Validação

Antes de considerar o MVP completo, confirme:

- [ ] Frontend sobe sem erros (`npm run dev`)
- [ ] Consegue navegar entre as páginas (Faturamento e Paciente)
- [ ] Endpoint de Faturamento retorna dados corretamente
- [ ] Endpoint de Paciente retorna dados com CPF mascarado
- [ ] DevTools/Network confirma que CPF completo nunca é trafegado
- [ ] Console do navegador mostra logs de debug do TCC
- [ ] Interface está responsiva (testar em diferentes resoluções)

---

## 🎯 Próximos Passos (Pós-MVP)

Melhorias que podem ser implementadas:

- [ ] Autenticação JWT (Bearer Token)
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes E2E (Playwright ou Cypress)
- [ ] Paginação nos endpoints
- [ ] Filtros avançados de busca
- [ ] Dashboard com gráficos (Chart.js ou Recharts)
- [ ] Export de relatórios (PDF, Excel)
- [ ] Logs estruturados (Winston + ELK Stack)

---

**📌 TCC COMPLETO! Banco → Backend → Frontend integrados e funcionando! 🎉**
