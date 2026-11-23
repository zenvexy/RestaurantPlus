require("dotenv").config();

const prisma = require("../src/data/prisma");

async function main() {
    await prisma.$transaction(async (transaction) => {
        await transaction.pedidos.deleteMany();
        await transaction.pratos.deleteMany();
        await transaction.ingredientes.deleteMany();
        await transaction.categorias.deleteMany();
        await transaction.mesas.deleteMany();

        const categorias = await Promise.all([
            transaction.categorias.create({
                data: { categoria: "ENTRADA" }
            }),
            transaction.categorias.create({
                data: { categoria: "PRATO_PRINCIPAL" }
            }),
            transaction.categorias.create({
                data: { categoria: "SOBREMESA" }
            }),
            transaction.categorias.create({
                data: { categoria: "BEBIDA" }
            })
        ]);
        console.log("Categorias de teste cadastradas.");

        const ingredientes = await Promise.all([
            transaction.ingredientes.create({
                data: { nome: "Tomate", quantidade: 30 }
            }),
            transaction.ingredientes.create({
                data: { nome: "Alface", quantidade: 20 }
            }),
            transaction.ingredientes.create({
                data: { nome: "Carne", quantidade: 15 }
            }),
            transaction.ingredientes.create({
                data: { nome: "Arroz", quantidade: 25 }
            }),
            transaction.ingredientes.create({
                data: { nome: "Chocolate", quantidade: 12 }
            }),
            transaction.ingredientes.create({
                data: { nome: "Farinha", quantidade: 25 }
            }),
            transaction.ingredientes.create({
                data: { nome: "Laranja", quantidade: 18 }
            })
        ]);
        console.log("Ingredientes de teste cadastrados.");

        const mesas = await Promise.all([
            transaction.mesas.create({
                data: { numero: 1, capacidade: 4, ocupada: "SIM" }
            }),
            transaction.mesas.create({
                data: { numero: 2, capacidade: 2, ocupada: "SIM" }
            }),
            transaction.mesas.create({
                data: { numero: 3, capacidade: 6 }
            }),
            transaction.mesas.create({
                data: { numero: 4, capacidade: 4 }
            })
        ]);
        console.log("Mesas de teste cadastradas.");

        await Promise.all([
            transaction.pratos.create({
                data: {
                    nome: "Salada da casa",
                    descricao: "Salada fresca",
                    preco: 18,
                    categoria: {
                        connect: { id: categorias[0].id }
                    },
                    ingredientes: {
                        connect: [
                            { id: ingredientes[0].id },
                            { id: ingredientes[1].id }
                        ]
                    }
                }
            }),
            transaction.pratos.create({
                data: {
                    nome: "Prato da casa",
                    descricao: "Carne com arroz",
                    preco: 42,
                    categoria: {
                        connect: { id: categorias[1].id }
                    },
                    ingredientes: {
                        connect: [
                            { id: ingredientes[2].id },
                            { id: ingredientes[3].id }
                        ]
                    }
                }
            }),
            transaction.pratos.create({
                data: {
                    nome: "Bolo de chocolate",
                    descricao: "Bolo com cobertura de chocolate",
                    preco: 16,
                    categoria: {
                        connect: { id: categorias[2].id }
                    },
                    ingredientes: {
                        connect: [
                            { id: ingredientes[4].id },
                            { id: ingredientes[5].id }
                        ]
                    }
                }
            }),
            transaction.pratos.create({
                data: {
                    nome: "Suco de laranja",
                    descricao: "Suco natural de laranja",
                    preco: 9,
                    categoria: {
                        connect: { id: categorias[3].id }
                    },
                    ingredientes: {
                        connect: [{ id: ingredientes[6].id }]
                    }
                }
            })
        ]);
        console.log("Pratos de teste cadastrados.");

        await Promise.all([
            transaction.pedidos.create({
                data: {
                    cliente: "Cliente 1",
                    total: 60,
                    status: "PREPARANDO",
                    mesa: {
                        connect: { id: mesas[0].id }
                    }
                }
            }),
            transaction.pedidos.create({
                data: {
                    cliente: "Cliente 2",
                    total: 42,
                    status: "PENDENTE",
                    mesa: {
                        connect: { id: mesas[1].id }
                    }
                }
            })
        ]);
        console.log("Pedidos de teste cadastrados.");
    });
}

main()
    .catch((erro) => {
        console.error(erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
