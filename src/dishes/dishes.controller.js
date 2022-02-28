
const path = require("path");
const bodyDataHas = require("../utils/bodyDataHas");
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// * validation

function dishExists(req, res, nxt) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    return nxt();
  }
  nxt({
    status: 404,
    message: `Dish does not exist: ${dishId}.`,
  });
}

function idIsValid(req, res, nxt) {
  const { data: { id }, } = req.body;
  const { dishId } = req.params;

  id && id !== dishId
    ? nxt({
        status: 400,
        message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
      })
    : nxt();
}

function priceIsValid(req, res, nxt) {
  const {
    data: { price },
  } = req.body;
  if (typeof price === "number") {
    if (price > 0) {
      return nxt();
    }
  }
  nxt({
    status: 400,
    message: `Dish must have a price that is an integer greater than 0`,
  });
}

// * end validation

// * list / GET
function list(req, res) {
  res.json({ data: dishes });
}

// * create / POST
function create(req, res) {
  const {
    data: { name, description, price, image_url } = {}
  } = req.body;
  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

// * read / GET by id
function read(req, res) {
  res.json({ data: res.locals.dish });
}

// * update / PUT
function update(req, res) {
  const dish = res.locals.dish;
  const {
    data: { name, description, price, image_url },
  } = req.body;

  dish.name = name;
  dish.description = description;
  dish.price = price;
  dish.image_url = image_url;

  res.json({ data: dish });
}

module.exports = {
  list,
  create: [
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    bodyDataHas("price"),
    priceIsValid,
    create,
  ],
  read: [
    dishExists,
    read
  ],
  update: [
    dishExists,
    idIsValid,
    bodyDataHas("name"),
    bodyDataHas("description"),
    bodyDataHas("image_url"),
    bodyDataHas("price"),
    priceIsValid,
    update,
  ],
};