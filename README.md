# 🚗 Sistema de Gestão para Estética Automotiva e Outros! ⚙️

Aplicação web completa para gerenciamento de clientes e agendamentos em estética automotiva.

Desenvolvido com foco em usabilidade, automação de processos e organização do fluxo de serviços.

---

## 🔗 Acesse o sistema

👉 [https://sistemagestao](https://agenda-gestao-cmmo33tsh-dev-danzs-projects.vercel.app/clientes)

---

## ⚙️ Funcionalidades

* 📋 Cadastro e gerenciamento de clientes
* 📅 Agendamento de serviços por data e horário
* 🔄 Atualização de status (Agendado, Em andamento, Concluído, Cancelado)
* 💰 Controle de valores por serviço
* 📊 Dashboard com métricas (clientes, faturamento, serviços do dia)
* 📲 Envio automático de mensagem via WhatsApp ao finalizar serviço

---

## 🧠 Tecnologias utilizadas

### Frontend

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=react,vite,ts,tailwind,motion" />
  </a>
</p>
* Framer Motion

### Backend

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=nodejs,express" />
  </a>
</p>

### Banco de Dados

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=postgres,prisma" />
  </a>
</p>

### Deploy

<p align="center">
  <a href="https://skillicons.dev">
    <img src="https://skillicons.dev/icons?i=vercel" />
  </a>
</p>

* Vercel (Frontend)
* Render (Backend + Banco)

---

## 📁 Estrutura do projeto

```
agenda-gestao/
├── frontend/
│   └── src/
│       ├── pages/
│       ├── components/
│       └── lib/
│
├── backend/
│   └── src/
│       ├── controllers/
│       ├── routes/
│       └── prisma/
```

---

## 🚀 Como rodar localmente

### 1. Clonar o repositório

```
git clone https://github.com/SEU-USUARIO/SEU-REPO.git
```

### 2. Backend

```
cd backend
npm install
npx prisma generate
node src/server.js
```

### 3. Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🔐 Variáveis de ambiente

### Frontend (.env)

```
VITE_API_URL=http://localhost:3000/api
```

### Backend (.env)

```
DATABASE_URL="sua_string_postgres"
```

---

## 📌 Observações

* O sistema utiliza timezone fixo para evitar inconsistência de horários
* Integração com WhatsApp feita via link direto (wa.me)
* Projeto estruturado para fácil escalabilidade

---

## 👨‍💻 Autor

Desenvolvido por **Daniel Soares Pesce - Dev-Danz**

