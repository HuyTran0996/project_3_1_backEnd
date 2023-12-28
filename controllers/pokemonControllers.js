const fs = require("fs");
const csv = require("csvtojson");

const databe = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/db.json`));

const pokemonTypes = [
  "bug",
  "dragon",
  "fairy",
  "fire",
  "ghost",
  "ground",
  "normal",
  "psychic",
  "steel",
  "dark",
  "electric",
  "fighting",
  "flyingText",
  "grass",
  "ice",
  "poison",
  "rock",
  "water",
];
const pokemonExists = (id, name) => {
  return databe.data.some(
    (pokemon) => pokemon.id * 1 === id * 1 || pokemon.name === name
  );
};

const checkData = async (req, res, next) => {
  if (databe.data.length === 0) {
    try {
      let dataFromCsv = await csv().fromFile(
        `${__dirname}/../dev-data/pokemon.csv`
      );
      // console.log("dataFromCsv la", dataFromCsv);
      //slice to 721 due to img quantity
      dataFromCsv = await dataFromCsv.slice(0, 721).map((e, index) => {
        return {
          id: index + 1,
          name: e.Name,
          types: [e.Type1, e.Type2],
          url: `http://127.0.0.1:5000/api/pokemons/images/${index + 1}.png`,
        };
      });

      databe.data = dataFromCsv;
      databe.totalPokemons = databe.data.length;

      fs.writeFileSync(
        `${__dirname}/../dev-data/db.json`,
        JSON.stringify(databe)
      );
    } catch (error) {
      console.log("Failed to create pokemons:", error);
      return res.status(404).json({
        status: "fail",
        message: error,
      });
    }
  }
  next();
};

const checkID = (req, res, next, val) => {
  // console.log(`book id is ${val}`);
  // const book = data.books.find((e) => e.id === req.params.id);
  //note: req.params.id và val cho giá trị như nhau
  const id = req.params.id * 1;
  const pokemon = databe.data.find((e) => e.id === id);
  if (!pokemon) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id",
    });
  }
  next();
};

const checkBody = (req, res, next) => {
  if (!req.body.id || !req.body.name || !req.body.types || !req.body.url) {
    console.log("Missing required data.");
    return res.status(400).json({
      status: "fail",
      message: "Missing required data.",
    });
  }

  if (req.body.types.length > 2) {
    console.log("Pokemon can only have one or two types.");
    return res.status(400).json({
      status: "fail",
      message: "Pokemon can only have one or two types.",
    });
  }

  const nullCount = req.body.types.reduce(
    (count = 0, type) => (type === null ? count + 1 : count),
    0
  );

  if (nullCount > 1) {
    console.log(nullCount);
    console.log("Pokemon have to have one or two types.");

    return res.status(400).json({
      status: "fail",
      message: "Pokemon have to have one or two types.",
    });
  }

  if (
    !req.body.types.every(
      (type) => type === null || " " || pokemonTypes.includes(type)
    )
  ) {
    console.log("request body types", req.body);
    console.log("Pokemon's type is invalid.");
    return res.status(400).json({
      status: "fail",
      message: "Pokemon's type is invalid.",
    });
  }

  if (pokemonExists(req.body.id, req.body.name)) {
    console.log("The Pokémon already exists.");
    return res.status(400).json({
      status: "fail",
      message: "The Pokémon already exists.",
    });
  }

  next();
};
const checkBodyEdit = (req, res, next) => {
  if (!req.body.id || !req.body.name || !req.body.types || !req.body.url) {
    console.log("Missing required data.");
    return res.status(400).json({
      status: "fail",
      message: "Missing required data.",
    });
  }

  if (req.body.types.length > 2) {
    console.log("Pokemon can only have one or two types.");
    return res.status(400).json({
      status: "fail",
      message: "Pokemon can only have one or two types.",
    });
  }

  const nullCount = req.body.types.reduce(
    (count = 0, type) => (type === null ? count + 1 : count),
    0
  );

  if (nullCount > 1) {
    console.log(nullCount);
    console.log("Pokemon have to have one or two types.");

    return res.status(400).json({
      status: "fail",
      message: "Pokemon have to have one or two types.",
    });
  }

  if (
    !req.body.types.every(
      (type) => type === null || " " || pokemonTypes.includes(type)
    )
  ) {
    console.log("request body types", req.body);
    console.log("Pokemon's type is invalid.");
    return res.status(400).json({
      status: "fail",
      message: "Pokemon's type is invalid.",
    });
  }
  const pokemonIndex = databe.data.findIndex((e) => e.id === req.params.id * 1);
  //change others, keep id and name
  if (
    req.body.id * 1 === req.params.id * 1 &&
    req.body.name === databe.data[pokemonIndex].name
  ) {
    next();
    return;
  }
  //change others, keep id
  if (req.body.id * 1 === req.params.id * 1) {
    next();
    return;
  }
  //change others, keep name
  if (req.body.name === databe.data[pokemonIndex].name) {
    next();
    return;
  }
  if (pokemonExists(req.body.id, req.body.name)) {
    console.log("The Pokémon already exists.");
    return res.status(400).json({
      status: "fail",
      message: "The Pokémon already exists.",
    });
  }

  next();
};

const getPokemons = async (req, res) => {
  const { page, limit, search, type = "" } = req.query;
  let limitNumber = limit * 1;
  let pageNumber = page * 1;

  let startIndex = (pageNumber - 1) * limitNumber;
  let endIndex = startIndex + limitNumber;

  try {
    let data = databe.data.slice(startIndex, endIndex);

    if (type) {
      data = databe.data
        .filter((pokemon) =>
          pokemon.types.some((t) =>
            t ? t.toLowerCase() === type.toLowerCase() : false
          )
        )
        .slice(startIndex, endIndex);
    }

    if (search) {
      data = databe.data
        .filter((pokemon) =>
          pokemon.name.toLowerCase().includes(search.toLowerCase())
        )
        .slice(startIndex, endIndex);
    }

    res.status(200).json({ data });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid in getAllPokemons",
    });
  }
};

const getPokemonById = async (req, res) => {
  try {
    const id = req.params.id * 1;
    const pokemon = databe.data.find((e) => e.id === id);
    const previousPokemon = databe.data.find((e) => e.id === id - 1);
    const nextPokemon = databe.data.find((e) => e.id === id + 1);
    let data = Object.assign({ pokemon, previousPokemon, nextPokemon });
    res.status(200).json({ data });
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id in getPokemon",
    });
  }
};

const addPokemon = async (req, res) => {
  console.log("123123", req.body);

  try {
    const idConvert = Number(req.body.id);

    const newPokemon = Object.assign(req.body, { id: idConvert });

    const data = newPokemon;

    databe.data.push(data);
    databe.totalPokemons = databe.data.length;
    fs.writeFile(
      `${__dirname}/../dev-data/db.json`,
      JSON.stringify(databe),
      (err) => {
        if (err) {
          return res.status(500).json({
            status: "fail",
            message: "Could not write to file",
          });
        }
        res.status(201).json({ data });
      }
    );
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id in createBook",
    });
  }
};

const editPokemon = async (req, res) => {
  try {
    const pokemonIndex = await databe.data.findIndex(
      (e) => e.id === req.params.id * 1
    );

    const updatedPokemon = Object.assign(req.body);

    databe.data[pokemonIndex] = updatedPokemon;
    databe.totalPokemons = databe.data.length;

    fs.writeFile(
      `${__dirname}/../dev-data/db.json`,
      JSON.stringify(databe),
      (err) => {
        if (err) {
          return res.status(500).json({
            status: "fail",
            message: "Could not write to file",
          });
        }

        res.status(200).json({
          status: "success",
          data: {
            book: req.body,
          },
        });
      }
    );
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id in updateBook",
    });
  }
};

const deletePokemon = async (req, res) => {
  try {
    const pokemonIndex = databe.data.findIndex(
      (e) => e.id === req.params.id * 1
    );

    databe.data.splice(pokemonIndex, 1);
    databe.totalPokemons = databe.data.length;

    fs.writeFile(
      `${__dirname}/../dev-data/db.json`,
      JSON.stringify(databe),
      (err) => {
        if (err) {
          return res.status(500).json({
            status: "fail",
            message: "Could not write to file",
          });
        }

        res.status(200).json({
          status: "success",
          data: null,
        });
      }
    );
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id in deleteBook",
    });
  }
};

module.exports = {
  getPokemons,
  getPokemonById,
  addPokemon,
  editPokemon,
  deletePokemon,
  checkID,
  checkBody,
  checkData,
  checkBodyEdit,
};
