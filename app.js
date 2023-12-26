const express = require("express");
const morgan = require("morgan");
const pokemonRouter = require("./routes/pokemonRoutes");

const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use("/api/pokemons", pokemonRouter);

module.exports = app;
