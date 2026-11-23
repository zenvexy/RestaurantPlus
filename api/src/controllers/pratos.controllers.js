const prisma = require("../data/prisma");

const listar = async (req, res) => {

    const lista = await prisma.pratos.findMany({
        include: {
            categoria: true,
            ingredientes: true
        }
    });

    res.status(200).json(lista);
};

const cadastrar = async (req, res) => {

    const data = req.body;

    const item = await prisma.pratos.create({
        data
    });

    res.status(201).json(item);
};

const atualizar = async (req, res) => {

    const { id } = req.params;
    const dados = req.body;

    const item = await prisma.pratos.update({
        where: { id: Number(id) },
        data: dados
    });

    res.status(200).json(item);
};

const excluir = async (req, res) => {

    const { id } = req.params;

    const item = await prisma.pratos.delete({
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
