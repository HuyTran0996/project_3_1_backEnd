const express = require("express");
const pokemonControllers = require("../controllers/pokemonControllers");
const router = express.Router();

router.param("id", pokemonControllers.checkID);

router
  .route("/")
  .get(pokemonControllers.checkData, pokemonControllers.getPokemons)
  .post(pokemonControllers.checkBody, pokemonControllers.addPokemon);

// router.route("/").post(pokemonControllers.checkBody, pokemonControllers.addPokemon);

router
  .route("/:id")
  .get(pokemonControllers.checkData, pokemonControllers.getPokemonById)
  .put(pokemonControllers.checkBody, pokemonControllers.editPokemon)
  .delete(pokemonControllers.deletePokemon);

// router.route("/images").express.static(`${__dirname}/../dev-data/pokemon-img`);
router.use("/images", express.static(`${__dirname}/../dev-data/pokemon-img`));

module.exports = router;
