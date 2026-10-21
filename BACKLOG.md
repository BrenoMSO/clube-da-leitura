# Planeamento e Backlog: MVP Competição de Leitura

## 🗺️ 1. Panorama Geral da Solução (Atualizado)

O **Sistema de Competição de Leitura** é uma aplicação web desenhada para incentivar o hábito da leitura através da gamificação.

* **Backend:** Node.js, Express, TypeScript e MongoDB Atlas (Mongoose).
* **Frontend:** HTML5, CSS3 e JavaScript puro (Vanilla JS), focado na simplicidade e preparado para ser hospedado no **GitHub Pages**. Sem frameworks pesados.
* **Integração:** API Oficial do Google Books para busca de livros.

---

## ⚙️ 2. Estrutura do Frontend (Vanilla JS)

Como o frontend será hospedado no GitHub Pages, ele consistirá em ficheiros estáticos que farão requisições (via `fetch`) para o Backend hospedado noutro local (ex: Render, Railway, etc.).

### Ficheiros Essenciais:
1. `index.html` (e `auth.js`): Página inicial com formulários de Login e Registo. Salva o token JWT no `localStorage`.
2. `dashboard.html` (e `dashboard.js`): Lista os grupos do utilizador. Tem formulários para "Criar Grupo" e "Entrar com Código".
3. `grupo.html` (e `grupo.js`): A página principal da competição. Mostra o Ranking do grupo e permite a busca e gestão de livros.

### A Regra do Debounce (Obrigatório)
No ficheiro `grupo.js`, o input de pesquisa de livros na API do Google **deve** implementar uma função de *Debounce* de 500ms.
* **Objetivo:** Evitar o erro 429 (Too Many Requests).
* **Regra:** O JavaScript só deve disparar o `fetch` para a rota `/api/livros/buscar` se o utilizador parar de digitar por 500 milissegundos e o termo tiver mais de 2 caracteres.

---

## 🧪 3. Testes da API (Backend)

Para garantir a estabilidade do sistema, o backend deve incluir testes automatizados para as rotas principais. Recomenda-se o uso de **Jest** e **Supertest**.

### Casos de Teste a Implementar:
* **Autenticação (`/api/auth`):**
  * Deve registar um novo utilizador com sucesso (retorna 201).
  * Não deve permitir registo com e-mail duplicado (retorna 400).
  * Deve fazer login e retornar um token JWT válido (retorna 200).
* **Grupos (`/api/grupos`):**
  * Deve criar um grupo e gerar um código de 6 caracteres (retorna 201).
  * Deve permitir que um utilizador entre num grupo via código (retorna 200).
* **Leituras e Progresso (`/api/leituras`):**
  * Deve adicionar um livro ao grupo corretamente.
  * Deve atualizar as páginas lidas e calcular o `concluido: true` se atingir o total de páginas.
  * Deve bloquear notas (avaliação) se o livro não estiver concluído.
* **Google Books (`/api/livros/buscar`):**
  * Deve retornar um array de livros formatado corretamente (fazer mock da chamada ao axios/fetch externo para não consumir a cota real da Google durante os testes).

---

## 📋 4. Backlog de Execução para a IA (Épicos)

### Épico 1: Setup e Autenticação
* Criar a estrutura base do Backend (Express, TS, MongoDB, .env com JWT e MONGODB_URI).
* Criar `index.html` e `auth.js` com design básico e integração de Login/Registo.
* Configuração inicial dos testes de API (Jest/Supertest) cobrindo `/api/auth`.

### Épico 2: Gestão de Grupos
* Criar rotas de criação e entrada em Grupos no Backend.
* Criar `dashboard.html` e `dashboard.js` para listar os grupos e permitir a entrada via código.

### Épico 3: Google Books e Leituras (Com Debounce)
* Criar rota `/api/livros/buscar` no Backend (usando a `GOOGLE_BOOKS_API_KEY`).
* Criar `grupo.html` e `grupo.js`.
* **Importante:** Implementar o campo de pesquisa com a função *Debounce* no `grupo.js`.
* Criar rotas para adicionar livro, atualizar páginas lidas e avaliar.

### Épico 4: Ranking e Testes
* Criar rota que calcula o Ranking (1 página = 1 ponto) e exibe no `grupo.html`.
* Configurar o Jest/Supertest e escrever os testes descritos na Secção 3 deste documento.
