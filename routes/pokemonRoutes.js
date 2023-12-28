const express = require("express");
const pokemonControllers = require("../controllers/pokemonControllers");
const router = express.Router();

router.param("id", pokemonControllers.checkID);

router
  .route("/")
  .get(pokemonControllers.checkData, pokemonControllers.getPokemons)
  .post(pokemonControllers.checkBody, pokemonControllers.addPokemon);

router
  .route("/:id")
  .get(pokemonControllers.checkData, pokemonControllers.getPokemonById)
  .put(pokemonControllers.checkBodyEdit, pokemonControllers.editPokemon)
  .delete(pokemonControllers.deletePokemon);

router.use("/images", express.static(`${__dirname}/../dev-data/pokemon-img`));

module.exports = router;
