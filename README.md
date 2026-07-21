# MindBlog - API Backend

API RESTful para a plataforma MindBlog, desenvolvida para o case prático da Mind Consulting.

## Tecnologias
- Node.js
- Express
- TypeScript
- Prisma ORM
- MySQL
- JWT (JSON Web Tokens)
- BCryptJS

## Endpoints Principais

### Autenticação
- `POST /api/users` - Cadastro de novo usuário
- `POST /api/sessions` - Autenticação / Login

### Artigos
- `GET /api/articles` - Listagem de todos os artigos com dados do autor
- `GET /api/articles/:id` - Busca detalhada de um artigo por ID
- `POST /api/articles` - Criação de artigo (requer token JWT)
- `PUT /api/articles/:id` - Edição de artigo (requer token JWT)
- `DELETE /api/articles/:id` - Remoção de artigo (requer token JWT)

## Instalação e Execução

```bash
# Instalar dependências
npm install

# Executar migrações do banco
npx prisma migrate dev

# Rodar o servidor de desenvolvimento
npm run dev
```

A API estará disponível em `http://localhost:3333`.
