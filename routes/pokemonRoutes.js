const express = require("express");
const pokemonControllers = require("../controllers/pokemonControllers");
const router = express.Router();

router.param("id", pokemonControllers.checkID);

router
  .route("/")
  .get(pokemonControllers.checkData, pokemonControllers.getPokemons);

router
  .route("/addPokemon")
  .post(pokemonControllers.checkBody, pokemonControllers.addPokemon);

router
  .route("/:id")
  .get(pokemonControllers.checkData, pokemonControllers.getPokemonById)
  .put(pokemonControllers.checkBody, pokemonControllers.editPokemon)
  .delete(pokemonControllers.deletePokemon);

module.exports = router;
