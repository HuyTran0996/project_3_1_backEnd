const express = require("express");
const pokemonControllers = require("../controllers/pokemonControllers");
const router = express.Router();

router.param("id", pokemonControllers.checkID);

router
  .route("/")
  .get(pokemonControllers.checkData, pokemonControllers.getAllPokemons)
  .post(pokemonControllers.checkBody, pokemonControllers.createBook);

router
  .route("/:id")
  .get(pokemonControllers.getBook)
  .patch(pokemonControllers.checkBody, pokemonControllers.updateBook)
  .delete(pokemonControllers.deleteBook);

module.exports = router;
