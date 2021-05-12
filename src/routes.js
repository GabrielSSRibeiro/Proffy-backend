const { Router } = require("express");
const routes = Router();

const ClassesController = require("./controllers/ClassesController");
const ConnectionsController = require("./controllers/ConnectionsController");

routes.get("/classes", ClassesController.index);
routes.post("/classes", ClassesController.store);

routes.get("/connections", ConnectionsController.index);
routes.post("/connections", ConnectionsController.store);

module.exports = routes;
