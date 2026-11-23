require("dotenv").config();
const express = require("express");
const cors = require("cors");

const categoriasRoutes = require("./src/routes/categorias.routes");
const ingredientesRoutes = require("./src/routes/ingredientes.routes");
const pedidosRoutes = require("./src/routes/pedidos.routes");
const pratosRoutes = require("./src/routes/pratos.routes");
const mesasRoutes = require("./src/routes/mesas.routes");
const enumsRoutes = require("./src/routes/enums.routes");

const app = express();

app.use(express.json());
app.use(cors());

app.use("/categorias", categoriasRoutes);
app.use("/ingredientes", ingredientesRoutes);
app.use("/pedidos", pedidosRoutes);
app.use("/pratos", pratosRoutes);
app.use("/mesas", mesasRoutes);
app.use("/enums", enumsRoutes);

const rotas = [
    { rota: "/", verbo: "GET" },
    { rota: "/categorias/listar", verbo: "GET" },
    { rota: "/categorias/cadastrar", verbo: "POST" },
    { rota: "/categorias/atualizar/:id", verbo: "PUT" },
    { rota: "/categorias/excluir/:id", verbo: "DELETE" },
    { rota: "/ingredientes/listar", verbo: "GET" },
    { rota: "/ingredientes/cadastrar", verbo: "POST" },
    { rota: "/ingredientes/atualizar/:id", verbo: "PUT" },
    { rota: "/ingredientes/excluir/:id", verbo: "DELETE" },
    { rota: "/pedidos/listar", verbo: "GET" },
    { rota: "/pedidos/cadastrar", verbo: "POST" },
    { rota: "/pedidos/atualizar/:id", verbo: "PUT" },
    { rota: "/pedidos/excluir/:id", verbo: "DELETE" },
    { rota: "/pratos/listar", verbo: "GET" },
    { rota: "/pratos/cadastrar", verbo: "POST" },
    { rota: "/pratos/atualizar/:id", verbo: "PUT" },
    { rota: "/pratos/excluir/:id", verbo: "DELETE" },
    { rota: "/mesas/listar", verbo: "GET" },
    { rota: "/mesas/cadastrar", verbo: "POST" },
    { rota: "/mesas/atualizar/:id", verbo: "PUT" },
    { rota: "/mesas/excluir/:id", verbo: "DELETE" },
    { rota: "/enums/categorias", verbo: "GET" },
    { rota: "/enums/disponibilidade", verbo: "GET" },
    { rota: "/enums/ocupacao", verbo: "GET" },
    { rota: "/enums/status-pedido", verbo: "GET" }
];

app.get("/", (req, res) => {
    res.json({
        message: "API RestaurantPlus online",
        rotas
    });
});

module.exports = app;
