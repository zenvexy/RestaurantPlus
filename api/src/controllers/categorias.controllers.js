const prisma = require("../data/prisma");

const listar = async (req, res) => {

    const lista = await prisma.categorias.findMany({
        include: {
            pratos: true
        }
    });

    res.status(200).json(lista);
};

const cadastrar = async (req, res) => {

    const data = req.body;

    const categoriaExistente = await prisma.categorias.findUnique({
        where: { categoria: data.categoria }
    });

    if (categoriaExistente) {
        return res.status(409).json({
            message: "Essa categoria já está cadastrada"
        });
    }

    const item = await prisma.categorias.create({
        data
    });

    res.status(201).json(item);
};

const atualizar = async (req, res) => {

    const { id } = req.params;
    const dados = req.body;

    if (dados.categoria) {
        const categoriaExistente = await prisma.categorias.findUnique({
            where: { categoria: dados.categoria }
        });

        if (categoriaExistente && categoriaExistente.id !== Number(id)) {
            return res.status(409).json({
                message: "Essa categoria já está cadastrada"
            });
        }
    }

    const item = await prisma.categorias.update({
        where: { id: Number(id) },
        data: dados
    });

    res.status(200).json(item);
};

const excluir = async (req, res) => {

    const { id } = req.params;

    const item = await prisma.categorias.delete({
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
