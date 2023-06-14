const express = require("express");
const { launchesRouter } = require("./routes/launches/launches.router");
const { planetsRouter } = require("./routes/planets/planets.router");

const apiV1 = express.Router();

apiV1.use("/planets", planetsRouter);
apiV1.use("/launches", launchesRouter);

module.exports = {
  apiV1,
};
