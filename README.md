# RestaurantPlus - Backend

Sistema de gerenciamento de restaurante. O repositório contém uma interface
web simples e uma API REST em Express, com Prisma e PostgreSQL.

## Complementar

Este readme é um complemento ao readme do [Frontend](./web/README.md).

## URL

A url pública da api fica em [restaurantplus-backend.vercel.app](https://restaurantplus-backend.vercel.app)

## Estrutura

- `web/`: interface web.
- `api/`: API, schema Prisma, seed e migrations.
- `docs/insomnia.yaml`: coleção Insomnia; importe o arquivo e use a pasta
  **RestaurantPlus**.

## API local

O backend usa PostgreSQL. O MySQL do XAMPP não é compatível com a configuração
atual do schema e do adapter Prisma.

Requisitos: Node.js, npm e um banco PostgreSQL acessível.

No CMD, a partir da raiz do repositório:

```bat
cd api
npm install
```

Configure `api/.env` com `DATABASE_URL` para um banco PostgreSQL de
desenvolvimento e, opcionalmente, a porta:

```env
PORT=3000
DATABASE_URL="postgresql://USUARIO:SENHA@localhost:5432/restaurant_plus?schema=public"
```

Se estiver usando o Prisma Postgres da Vercel localmente, vincule o projeto e
puxe as variáveis do ambiente **Development**:

```bat
npx vercel login
npx vercel link
npx vercel env pull .env
```

Confirme no painel da Vercel que `DATABASE_URL` está configurada para
**Development**. Não use a URL de produção para `migrate dev` e não envie o
`.env` ao Git.

Valide o schema, gere o Prisma Client e inicie a API:

```bat
npx prisma validate
npx prisma generate
npm run dev
```

A API ficará em `http://localhost:3000`. Para iniciar sem modo de observação,
use `npm start`.

## Banco e migrations

O schema ativo usa PostgreSQL e está em `api/prisma/schema.prisma`. A migration
inicial está em `api/prisma/migrations/`.

Para alterações futuras, com um banco de desenvolvimento acessível:

```bat
npx prisma migrate dev --name NOME_DA_MUDANCA
```

Faça commit do schema e da pasta `api/prisma/migrations` e envie para o GitHub.
O build da Vercel executa `prisma migrate deploy` por meio de `npm run build` e
aplica as migrations pendentes no banco configurado em `DATABASE_URL`.

### Deploy na Vercel

1. Configure o **Root Directory** do projeto como `api` e selecione o preset
   **Express**.
2. Adicione a integração Prisma Postgres e confirme que `DATABASE_URL` está
   configurada para os ambientes de deploy.
3. Use `npm run build` como Build Command. O comando aplica as migrations
   versionadas; o `postinstall` gera o Prisma Client.
4. Envie o commit com as migrations ao GitHub para iniciar o deploy.

Se for necessário criar uma migration inicial **offline**, sem conexão com o
banco, use o CMD dentro de `api`:

```bat
for /f %i in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMddHHmmss"') do set "STAMP=%i"
mkdir prisma\migrations\%STAMP%_init
npx prisma migrate diff --from-empty --to-schema prisma\schema.prisma --script --output prisma\migrations\%STAMP%_init\migration.sql
```

Esse comando gera o SQL, mas não o aplica. A pasta
`prisma/migrations/migration_lock.toml` também deve existir com
`provider = "postgresql"`. `--from-empty` é somente para a migration inicial de
um banco vazio; não gere outra migration inicial se a pasta já existir nem
aplique-a sobre tabelas existentes sem preparar um baseline.

`npx prisma db push` sincroniza o schema diretamente, mas não cria histórico de
migrations. Para produção na Vercel, use migrations versionadas e
`prisma migrate deploy`.

## Seed de desenvolvimento

O seed cadastra exemplos para categorias, ingredientes, mesas, pratos e
pedidos:

```bat
npx prisma db seed
```

**Atenção:** o seed apaga os registros dessas tabelas antes de recriar os
exemplos. Use somente em banco de desenvolvimento.

## Rotas

Cada recurso abaixo tem `GET /listar`, `POST /cadastrar`,
`PUT /atualizar/:id` e `DELETE /excluir/:id`:

- `/categorias`
- `/ingredientes`
- `/pratos`
- `/pedidos`
- `/mesas`

Rotas de enums:

- `GET /enums/categorias`
- `GET /enums/disponibilidade`
- `GET /enums/ocupacao`
- `GET /enums/status-pedido`

`GET /` retorna o status da API e a lista de rotas. Um cadastro ou atualização
com uma categoria já existente retorna `409`.

As listagens incluem as relações do schema. Para cadastrar um prato, envie
`categoria` e `ingredientes` no formato de relações do Prisma, usando `connect`
com IDs existentes. Para cadastrar um pedido, associe a mesa com `mesa.connect`.

Os valores de `Categorias.categoria` e `Mesas.numero` são únicos.
