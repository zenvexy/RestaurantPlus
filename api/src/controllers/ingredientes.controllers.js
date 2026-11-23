const prisma = require("../data/prisma");

const listar = async (req, res) => {

    const lista = await prisma.ingredientes.findMany({
        include: {
            pratos: true
        }
    });

    res.status(200).json(lista);
};

const cadastrar = async (req, res) => {

    const data = req.body;

    const item = await prisma.ingredientes.create({
        data
    });

    res.status(201).json(item);
};

const atualizar = async (req, res) => {

    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.ingredientes.update({
        where: { id: Number(id) },
        data: dados
    });

    res.status(200).json(item);
};

const excluir = async (req, res) => {

    const { id } = req.params;

    const item = await prisma.ingredientes.delete({
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
