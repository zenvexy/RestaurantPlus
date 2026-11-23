# Média Bimestral - Backend

API REST para gerir professores, alunos e notas escolares. Ela calcula a média dos quatro bimestres no servidor, deixando o futuro front-end responsável apenas pela interface.

**API publicada:** [https://media-bimestral.vercel.app](https://media-bimestral.vercel.app)

## Documentação relacionada

- [Frontend Média Bimestral](web/README.md)

## Tecnologias

Node.js, Express, Prisma, PostgreSQL, bcrypt e Vercel. O CORS já está habilitado para o front-end em `web/` poder consumir a API.

## Estrutura

```text
api/
├── index.js                  # Express e rotas
├── server.js                 # Servidor local
├── src/controllers/          # Regras de negócio
├── src/routes/               # Endpoints
├── src/data/prisma.js        # Conexão com o banco
└── prisma/                   # Schema, migrations e seed
```

## Rodar e testar localmente no CMD

Você precisa de Node.js, npm e PostgreSQL. No Prompt de Comando, a partir da raiz do projeto:

```bat
cd api
npm install
```

Crie `api/.env` com a conexão local:

```env
PORT=3000
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/media_bimestral?schema=public"
```

Crie o banco `media_bimestral` no PostgreSQL e aplique as tabelas:

```bat
npm run db:migrate -- --name nome_da_mudanca
npm run dev
```

A API ficará em `http://localhost:3000`. Teste se ela está online:

```bat
curl.exe http://localhost:3000
```

Para parar o servidor, use `Ctrl + C`. Para iniciá-lo sem observar alterações, use `npm start`.

### Usar MySQL pelo XAMPP

Há blocos comentados prontos para alternar o banco local:

1. Em `api/src/data/prisma.js`, comente o bloco `PrismaPg` e descomente o `PrismaMariaDb`.
2. Em `api/prisma/schema.prisma`, alterne o datasource de `postgresql` para `mysql`.
3. Inicie o MySQL no XAMPP, crie o banco `media_bimestral` no phpMyAdmin e use esta URL no `.env`:

```env
DATABASE_URL="mysql://root:@localhost:3306/media_bimestral"
```

Para voltar ao PostgreSQL, inverta essas alterações. As migrations atuais são de PostgreSQL; para usar MySQL, mantenha migrations próprias para ele.

### Dados de exemplo

```bat
node prisma/seed.js
```

O seed cria dados de teste e apaga notas, alunos e professores já existentes no banco conectado. Use somente em desenvolvimento. A senha dos professores de exemplo é `senha123`.

## Como a API funciona

```text
Front-end / Insomnia / Postman → Express → Controllers → Prisma → Banco de dados
```

Envie `Content-Type: application/json` em `POST` e `PUT`. Para testar o fluxo: cadastre um professor, cadastre um aluno, use o `id` e a `matricula` retornados para cadastrar uma nota e então liste as notas.

A coleção para Insomnia está em [`docs/Insomnia_2026-11-21-16-01-24.yaml`](docs/Insomnia_2026-11-21-16-01-24.yaml).

## Rotas

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/` | Status e catálogo das rotas |
| `POST` | `/professores/login` | Valida as credenciais de um professor |
| `GET` | `/professores/listar` | Lista professores sem as senhas |
| `POST` | `/professores/cadastrar` | Cadastra professor |
| `PUT` | `/professores/atualizar/:id` | Atualiza professor por ID |
| `DELETE` | `/professores/excluir/:id` | Exclui professor por ID |
| `GET` | `/alunos/listar` | Lista alunos |
| `POST` | `/alunos/cadastrar` | Cadastra aluno |
| `PUT` | `/alunos/atualizar/:matricula` | Atualiza aluno por matrícula |
| `DELETE` | `/alunos/excluir/:matricula` | Exclui aluno por matrícula |
| `GET` | `/notas/listar` | Lista notas |
| `POST` | `/notas/cadastrar` | Cadastra nota e calcula a média |
| `PUT` | `/notas/atualizar/:id` | Atualiza nota e recalcula a média |
| `DELETE` | `/notas/excluir/:id` | Exclui nota por ID |
| `GET` | `/materias/listar` | Lista as matérias aceitas |

### Professor — cadastro e login

`POST /professores/cadastrar`

```json
{
  "nome": "Ana Silva",
  "email": "ana@escola.com",
  "senha": "senha123",
  "materia": "MATEMATICA"
}
```

Matérias aceitas: `MATEMATICA`, `PORTUGUES`, `HISTORIA` e `GEOGRAFIA`. A senha é protegida com bcrypt e não é retornada pela API.

`POST /professores/login`

```json
{
  "email": "ana@escola.com",
  "senha": "senha123"
}
```

### Aluno — cadastro

`POST /alunos/cadastrar`

```json
{
  "nome": "João Santos"
}
```

A `matricula` é gerada pelo banco e deve ser usada no lançamento das notas.

### Nota — cadastro

`POST /notas/cadastrar`

```json
{
  "alunoMatricula": 1,
  "professorId": 1,
  "bimestre1": 8,
  "bimestre2": 7.5,
  "bimestre3": 9,
  "bimestre4": 8.5
}
```

`alunoMatricula` e `professorId` devem existir. A API calcula `mediaFinal` pela média aritmética dos quatro bimestres, arredondada para uma casa decimal. Em atualizações parciais, ela recalcula a média com os dados existentes.

## Deploy na Vercel com Prisma Postgres

### Criar o projeto e conectar o banco

1. Envie o repositório ao GitHub e importe-o em [vercel.com/new](https://vercel.com/new).
2. Na configuração do projeto, selecione **Root Directory** `api` e
   **Application Preset** `Express`. Em **Build and Output Settings**, use
   `npm run build` como Build Command e deixe Output Directory vazio.

   ![Importação do repositório e configuração do projeto Express na Vercel](Assets/screenshots/screenshot1.png)

3. Na seção **Optional Integrations**, clique em **Add** ao lado de **Prisma Postgres**.

   ![Integração Prisma Postgres disponível durante a criação do projeto](Assets/screenshots/screensht2.png)

4. Avance pelas etapas da integração até **Connect a Project**. Selecione o projeto Vercel e os ambientes **Production** e **Preview**.
5. Na etapa da variável, configure **Custom Prefix** como `DATABASE` e mantenha o sufixo `_URL`. Assim, o nome criado será `DATABASE_URL`. Mantenha **Sensitive** ativado e clique em **Connect**.

   ![Conexão do Prisma Postgres com a variável DATABASE_URL](Assets/screenshots/screenshot3.png)

6. Termine a criação do projeto e faça o deploy. A integração provisiona o PostgreSQL e cria a variável secreta `DATABASE_URL`; não é necessário colar manualmente a URL local do `.env`.

O backend usa `DATABASE_URL` no adapter PostgreSQL. O prefixo `DATABASE` mais
o sufixo `_URL` faz a integração criar exatamente essa variável. Como ela é
secreta, o valor não fica visível no painel depois de salvo.

### Aplicar o schema ao banco

O **Build Command** `npm run build` executa `prisma migrate deploy`. A migration
inicial versionada em `api/prisma/migrations/` cria as tabelas e relações no
banco remoto durante o deploy. Para futuras mudanças, crie e versione uma nova
migration antes de fazer deploy:

```bat
cd api
npm run db:migrate -- --name nome_da_mudanca
```

Depois, envie os arquivos de migration ao GitHub. O deploy de produção aplicará
as migrations pendentes. Confira no log que o build executou
`prisma migrate deploy` e aplicou a migration.

Como `DATABASE_URL` é uma variável secreta, `vercel env pull` pode informar que
não consegue baixá-la. Nesse caso, o arquivo `.env` local continua com a URL
local; comandos Prisma executados localmente usarão esse banco local, não o de
produção. Para produção, deixe a migration ser aplicada pelo build da Vercel.

### Verificar o deploy

- `https://media-bimestral.vercel.app/` deve retornar a mensagem da API e a
  lista de rotas.
- `https://media-bimestral.vercel.app/materias/listar` deve retornar as
  matérias disponíveis.
- `https://media-bimestral.vercel.app/professores/listar` deve retornar `[]`
  se ainda não houver professores cadastrados.

O Root Directory seleciona a pasta `api`; com o preset Express, não é
necessário um `vercel.json` para esse propósito. Nunca use `localhost` na
`DATABASE_URL` do Vercel nem envie o `.env` ao Git.
