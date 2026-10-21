# 📚 Clube da Leitura - MVP Competição de Leitura

Aplicação web completa concebida para gamificar o hábito de leitura em grupo, com pontuação baseada em páginas lidas ($1\text{ página} = 1\text{ ponto}$), busca integrada ao **Google Books API** e frontend estático pronto para **GitHub Pages**.

---

## 🗂️ Arquitetura do Repositório

```text
clube-da-leitura/
├── BACKLOG.md                  # Backlog completo do projeto em Markdown
├── README.md                   # Instruções de setup e guia do projeto
├── .gitignore                  # Ignora node_modules, .env e ficheiros sensíveis
│
├── backend/                    # API RESTful (Node.js + Express + TypeScript + MongoDB + JWT)
│   ├── .env                    # Variáveis de ambiente locais (MONGODB_URI, JWT_SECRET, etc.)
│   ├── .env.example            # Exemplo de configuração
│   ├── jest.config.js          # Configuração do Jest com TypeScript
│   ├── package.json            # Scripts de execução e dependências
│   ├── tsconfig.json           # Configurações do TypeScript
│   └── src/
│       ├── config/database.ts  # Conexão resiliente ao MongoDB Atlas via Mongoose
│       ├── controllers/        # auth, grupo, leitura, livro
│       ├── middlewares/        # authMiddleware (Validação de Token JWT Bearer)
│       ├── models/             # Usuario, Grupo, Leitura
│       ├── routes/             # Rotas organizadas da API
│       ├── services/           # googleBooksService (integração Axios com Google Books)
│       ├── tests/              # Testes automatizados com Jest + Supertest + In-Memory Mongo
│       │   ├── setup.ts        # Configuração de isolamento do banco para testes
│       │   ├── auth.test.ts    # Testes de registo e login (/api/auth)
│       │   ├── grupos.test.ts  # Testes de criação e entrada via código (/api/grupos)
│       │   ├── leituras.test.ts# Testes de adição, páginas lidas e avaliação (/api/leituras)
│       │   └── livros.test.ts  # Testes de busca no catálogo Google Books (/api/livros)
│       └── server.ts           # Servidor Express principal
│
└── frontend/                   # Frontend estático em Vanilla JS (HTML5 + CSS3 + JS Puro)
    ├── index.html              # Página inicial com abas de Login e Registo
    ├── auth.js                 # Lógica de autenticação e persistência de token JWT
    ├── dashboard.html          # Painel de clubes: criar grupo e entrar via código
    ├── dashboard.js            # Lógica do painel de grupos
    ├── grupo.html              # Ecrã da competição: ranking, leituras e busca de livros
    ├── grupo.js                # Lógica da competição com DEBOUNCE de 500ms
    ├── config.js               # Configuração centralizada de API e helper authFetch
    └── style.css               # Estilos modernos, responsivos e acessíveis
```

---

## 🚀 Como Executar o Projeto

### 1. Backend (API Node.js / Express / TypeScript)

1. Entre na pasta `backend`:
   ```bash
   cd backend
   ```
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Garanta que o ficheiro `.env` está configurado com a sua string de conexão do MongoDB Atlas:
   ```env
   PORT=3000
   MONGODB_URI=mongodb+srv://<usuario>:<senha>@<cluster>.mongodb.net/
   JWT_SECRET=minha_chave_secreta_super_segura_mvp_123
   GOOGLE_BOOKS_API_KEY=sua_chave_aqui
   ```
4. Inicie o servidor em modo de desenvolvimento:
   ```bash
   npm run dev
   ```
   A API estará disponível em `http://localhost:3000`.

### 2. Frontend (Vanilla JS / GitHub Pages)

O frontend é composto por ficheiros estáticos que podem ser abertos diretamente no navegador ou servidos localmente:
```bash
# Opção A: Utilizando qualquer servidor estático (ex: npx serve ou Live Server do VS Code)
npx serve frontend

# Opção B: Abra diretamente frontend/index.html no navegador
```
* Em ambiente local (`localhost` ou `127.0.0.1`), o frontend direciona automaticamente as requisições para `http://localhost:3000`.
* Para publicação no **GitHub Pages**, configure no arquivo [`frontend/config.js`](file:///frontend/config.js) a URL da sua API em produção (Render, Railway, etc.).

---

## 🧪 Como Executar os Testes Automatizados da API

Os testes cobrem todas as regras descritas no backlog:
* Autenticação (`/api/auth`): registo, e-mail duplicado (400), login com JWT (200), senha incorreta (401).
* Grupos (`/api/grupos`): criação de grupo com código de 6 caracteres e entrada via código de convite.
* Leituras (`/api/leituras`): adição de livro, atualização de páginas com cálculo de conclusão (`concluido: true`) e bloqueio de avaliação caso não concluído.
* Google Books (`/api/livros/buscar`): formato da listagem e mock do cliente HTTP sem gastar quota da Google.

Execute os testes com:
```bash
cd backend
npm test
```

---

## ⏱️ A Regra do Debounce (Busca Google Books)

Para evitar erros de cota e `Status Code 429 (Too Many Requests)`:
* O ficheiro [`frontend/grupo.js`](file:///frontend/grupo.js) implementa a função `debounce(callback, 500)`.
* Requisições para `/api/livros/buscar` só são disparadas se o utilizador parar de digitar por **500 milissegundos** e o termo tiver **mais de 2 caracteres**.
