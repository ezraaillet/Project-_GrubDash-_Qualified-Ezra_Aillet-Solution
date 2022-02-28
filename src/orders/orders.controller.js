const path = require("path");
const bodyDataHas = require("../utils/bodyDataHas");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// * validation
function orderExists(req, res, nxt) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);

  if (foundOrder) {
    res.locals.order = foundOrder;
    return nxt();
  }
  nxt({
    status: 404,
    message: `Order ID not found: ${orderId}`,
  });
}

function idIsValid(req, res, nxt) {
  const {
    data: { id },
  } = req.body;
  const { orderId } = req.params;

  id && id !== orderId
    ? nxt({
        status: 400,
        message: `Order id does not match route id. Order: ${id}, Route: ${orderId}.`,
      })
    : nxt();
}


function _dishesQuantityIsValid(nxt, quantity, index) {
  if (!quantity || !Number.isInteger(quantity) || !(quantity > 0)) {
    // * if any of these is false status 400
    nxt({
      status: 400,
      message: `Dish ${index} must have a quantity that is an integer greater than 0`,
    });
    return false
  }
  if (quantity && Number.isInteger(quantity) && quantity > 0) {
    return true;
  }
}

function dishesIsValid(req, res, nxt) {
  const {
    data: { dishes },
  } = req.body;

  if (
    !Array.isArray(dishes) || // * is dishes an array??
    dishes.length <= 0 || // * is dishes at least one item??
    !dishes.every(({ quantity }, index) => _dishesQuantityIsValid(nxt, quantity, index))) {
    return nxt({
      status: 400,
      message: `Order must include at least one dish`,
    });
  }
  nxt();
}

function statusIsValid(req, res, nxt) {
  const {
    data: { status },
  } = req.body;
  const validStatus = ["pending", "preparing", "out-for-delivery", "delivered"];
  validStatus.includes(status)
    ? nxt()
    : nxt({
        status: 400,
        message: `Order must have a status of pending, preparing, out-for-delivery, delivered`,
      });
}

function statusIsNotDelivered(req, res, nxt) {
  const {
    data: { status },
  } = req.body;
  if (status === "delivered") {
    return nxt({
      status: 400,
      message: `A delivered order cannot be changed`,
    });
  }
  nxt();
}

function statusIsPending(req, res, nxt) {
  const order = res.locals.order;
  order.status !== "pending"
    ? nxt({
        status: 400,
        message: `An order cannot be deleted unless it is pending`,
      })
    : nxt();
}

// * end validation

// * list / GET
function list(req, res) {
  res.json({ data: orders });
}

// * create / POST
function create(req, res) {
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;
  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes: [...dishes],
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

// * read / GET by id
function read(req, res) {
  res.json({ data: res.locals.order });
}

// * update / PUT
function update(req, res) {
  const order = res.locals.order;
  const {
    data: { deliverTo, mobileNumber, status, dishes },
  } = req.body;

  order.deliverTo = deliverTo;
  order.mobileNumber = mobileNumber;
  order.status = status;
  order.dishes = [...dishes];

  res.json({ data: order });
}

// * destroy / DELETE
function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id == orderId);
  const deletedOrder = orders.splice(index, 1);
  res.sendStatus(204);
}

module.exports = {
  list,
  create: [
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesIsValid,
    create,
  ],
  delete: [orderExists, statusIsPending, destroy],
  read: [orderExists, read],
  update: [
    orderExists,
    idIsValid,
    bodyDataHas("status"),
    statusIsValid,
    statusIsNotDelivered,
    bodyDataHas("deliverTo"),
    bodyDataHas("mobileNumber"),
    bodyDataHas("dishes"),
    dishesIsValid,
    update,
  ],
};