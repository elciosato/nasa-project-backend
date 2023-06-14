const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { apiV1 } = require("./apiV1");

const app = express();

app.use(
  cors({
    origin: "*",
  })
);

app.use(morgan("combined"));
app.use(express.json());
app.use("/v1", apiV1);

module.exports = app;
