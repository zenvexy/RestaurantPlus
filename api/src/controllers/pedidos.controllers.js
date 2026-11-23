const prisma = require("../data/prisma");

const listar = async (req, res) => {

    const lista = await prisma.pedidos.findMany({
        include: {
            mesa: true
        }
    });

    res.status(200).json(lista);
};

const cadastrar = async (req, res) => {

    const data = req.body;

    const item = await prisma.pedidos.create({
        data
    });

    res.status(201).json(item);
};

const atualizar = async (req, res) => {

    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.pedidos.update({
        where: { id: Number(id) },
        data: dados
    });

    res.status(200).json(item);
};

const excluir = async (req, res) => {

    const { id } = req.params;

    const item = await prisma.pedidos.delete({
        where: { id: Number(id) }
    });

    res.status(200).json(item);
};

module.exports = {
    listar,
    cadastrar,
    atualizar,
    excluir
};
