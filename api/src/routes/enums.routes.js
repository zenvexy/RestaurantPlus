const express = require("express");
const {
    categorias,
    disponibilidade,
    ocupacao,
    status
} = require("../enums/enum");

const router = express.Router();

router.get("/categorias", categorias);
router.get("/disponibilidade", disponibilidade);
router.get("/ocupacao", ocupacao);
router.get("/status-pedido", status);

module.exports = router;
