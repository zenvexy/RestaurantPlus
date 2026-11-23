const express = require("express");
const {
    listar,
    cadastrar,
    atualizar,
    excluir
} = require("../controllers/pratos.controllers");

const router = express.Router();

router.get("/listar", listar);
router.post("/cadastrar", cadastrar);
router.put("/atualizar/:id", atualizar);
router.delete("/excluir/:id", excluir);

module.exports = router;
