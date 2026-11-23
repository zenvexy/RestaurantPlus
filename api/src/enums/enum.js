const categorias = (req, res) => {
    res.status(200).json([
        "ENTRADA",
        "PRATO_PRINCIPAL",
        "SOBREMESA",
        "BEBIDA"
    ]);
};

const disponibilidade = (req, res) => {
    res.status(200).json(["SIM", "NAO"]);
};

const ocupacao = (req, res) => {
    res.status(200).json(["SIM", "NAO"]);
};

const status = (req, res) => {
    res.status(200).json([
        "PENDENTE",
        "PREPARANDO",
        "CONCLUIDO",
        "CANCELADO"
    ]);
};

module.exports = {
    categorias,
    disponibilidade,
    ocupacao,
    status
};