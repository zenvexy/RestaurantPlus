-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Disponivel" AS ENUM ('SIM', 'NAO');

-- CreateEnum
CREATE TYPE "Ocupada" AS ENUM ('SIM', 'NAO');

-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('ENTRADA', 'PRATO_PRINCIPAL', 'SOBREMESA', 'BEBIDA');

-- CreateEnum
CREATE TYPE "StatusPedido" AS ENUM ('PENDENTE', 'PREPARANDO', 'CONCLUIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "Pratos" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "preco" DOUBLE PRECISION NOT NULL,
    "disponivel" "Disponivel" NOT NULL DEFAULT 'SIM',
    "categoriaId" INTEGER NOT NULL,

    CONSTRAINT "Pratos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredientes" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "quantidade" INTEGER NOT NULL,

    CONSTRAINT "Ingredientes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Categorias" (
    "id" SERIAL NOT NULL,
    "categoria" "Categoria" NOT NULL,

    CONSTRAINT "Categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pedidos" (
    "id" SERIAL NOT NULL,
    "cliente" TEXT NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "status" "StatusPedido" NOT NULL DEFAULT 'PENDENTE',
    "mesaId" INTEGER NOT NULL,

    CONSTRAINT "Pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mesas" (
    "id" SERIAL NOT NULL,
    "numero" INTEGER NOT NULL,
    "capacidade" INTEGER NOT NULL,
    "ocupada" "Ocupada" NOT NULL DEFAULT 'NAO',

    CONSTRAINT "Mesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_IngredientesToPratos" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_IngredientesToPratos_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Categorias_categoria_key" ON "Categorias"("categoria");

-- CreateIndex
CREATE UNIQUE INDEX "Mesas_numero_key" ON "Mesas"("numero");

-- CreateIndex
CREATE INDEX "_IngredientesToPratos_B_index" ON "_IngredientesToPratos"("B");

-- AddForeignKey
ALTER TABLE "Pratos" ADD CONSTRAINT "Pratos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "Categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pedidos" ADD CONSTRAINT "Pedidos_mesaId_fkey" FOREIGN KEY ("mesaId") REFERENCES "Mesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IngredientesToPratos" ADD CONSTRAINT "_IngredientesToPratos_A_fkey" FOREIGN KEY ("A") REFERENCES "Ingredientes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_IngredientesToPratos" ADD CONSTRAINT "_IngredientesToPratos_B_fkey" FOREIGN KEY ("B") REFERENCES "Pratos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
