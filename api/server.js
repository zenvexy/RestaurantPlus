// require("dotenv").config();

// const express = require("express");
// const cors = require("cors");

// const app = express();

// app.use(express.json());
// app.use(cors());

// const categoriasRoutes = require("./src/routes/categorias.routes");
// const ingredientesRoutes = require("./src/routes/ingredientes.routes");
// const pedidosRoutes = require("./src/routes/pedidos.routes");
// const pratosRoutes = require("./src/routes/pratos.routes");
// const mesasRoutes = require("./src/routes/mesas.routes");
// const enumsRoutes = require("./src/routes/enums.routes");

// app.use("/categorias", categoriasRoutes);
// app.use("/ingredientes", ingredientesRoutes);
// app.use("/pedidos", pedidosRoutes);
// app.use("/pratos", pratosRoutes);
// app.use("/mesas", mesasRoutes);
// app.use("/enums", enumsRoutes);

// const porta = process.env.PORT || 3000;

// app.listen(porta, () => {
//     console.log(`Online em http://localhost:${porta}`);
// });

const app = require("./index");

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
