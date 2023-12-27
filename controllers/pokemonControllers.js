const fs = require("fs");
const csv = require("csvtojson");

const data = JSON.parse(fs.readFileSync(`${__dirname}/../dev-data/db.json`));

const checkData = async (req, res, next) => {
  if (data.data.length === 0) {
    try {
      let dataFromCsv = await csv().fromFile(
        `${__dirname}/../dev-data/pokemon.csv`
      );
      console.log("dataFromCsv la", dataFromCsv);
      //slice to 721 due to img quantity
      dataFromCsv = await dataFromCsv.slice(0, 721).map((e, index) => {
        return {
          id: index + 1,
          name: e.Name,
          types: [e.Type1, e.Type2],
          url: `http://localhost:5000/images/${index + 1}.png`,
        };
      });

      data.data = dataFromCsv;
      data.totalPokemons = data.data.length;

      fs.writeFileSync(
        `${__dirname}/../dev-data/db.json`,
        JSON.stringify(data)
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
  const pokemon = data.data.find((e) => e.id === id);
  if (!pokemon) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id",
    });
  }
  next();
};

const checkBody = (req, res, next) => {
  if (
    !req.body.author ||
    !req.body.country ||
    !req.body.imageLink ||
    !req.body.language ||
    !req.body.link ||
    !req.body.pages ||
    !req.body.title ||
    !req.body.year
  ) {
    return res.status(400).json({
      status: "fail",
      message:
        "missing information, please give info of author, country, imageLink, language, link, pages, title, year ",
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
    let result = data.data.slice(startIndex, endIndex);

    if (type) {
      result = data.data
        .filter((pokemon) =>
          pokemon.types.some((t) =>
            t ? t.toLowerCase() === type.toLowerCase() : false
          )
        )
        .slice(startIndex, endIndex);
    }

    if (search) {
      result = data.data
        .filter((pokemon) =>
          pokemon.name.toLowerCase().includes(search.toLowerCase())
        )
        .slice(startIndex, endIndex);
    }

    res.status(200).json({
      data: {
        pokemons: result,
      },
    });
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
    const pokemon = data.data.find((e) => e.id === id);
    const previousPokemon = data.data.find((e) => e.id === id - 1);
    const nextPokemon = data.data.find((e) => e.id === id + 1);

    res
      .status(200)
      .json(Object.assign({ pokemon, previousPokemon, nextPokemon }));
  } catch (error) {
    return res.status(404).json({
      status: "fail",
      message: "Invalid id in getPokemon",
    });
  }
};

const addPokemon = async (req, res) => {
  try {
    const newId = (await data.books[data.books.length - 1].id) + 1;
    const newBook = Object.assign({ id: newId }, req.body);

    data.books.push(newBook);
    fs.writeFile(
      `${__dirname}/../dev-data/db.json`,
      JSON.stringify(data),
      (err) => {
        if (err) {
          return res.status(500).json({
            status: "fail",
            message: "Could not write to file",
          });
        }
        res.status(201).json({
          status: "success",
          data: {
            book: newBook,
          },
        });
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
    const bookIndex = await data.books.findIndex((e) => e.id === req.params.id);

    const book = await data.books.find((e) => e.id === req.params.id);
    const updatedBook = Object.assign({ id: book.id }, req.body);

    data.books[bookIndex] = updatedBook;

    fs.writeFile(
      `${__dirname}/../dev-data/db.json`,
      JSON.stringify(data),
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
    const bookIndex = data.books.findIndex((e) => e.id === req.params.id);

    data.books.splice(bookIndex, 1);

    fs.writeFile(
      `${__dirname}/../dev-data/db.json`,
      JSON.stringify(data),
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
};
