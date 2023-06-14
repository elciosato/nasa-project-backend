const http = require("http");

const app = require("./app");
const { loadLaunchesData } = require("./models/launches.model");
const { loadPlanetsData } = require("./models/planets.model");
const { mongoConnect } = require("./services/mongo");

require("dotenv").config();

const server = http.createServer(app);
const PORT = process.env.PORT || 3333;

async function startServer() {
  await mongoConnect();
  await loadPlanetsData();
  await loadLaunchesData();

  server.listen(PORT, () => {
    console.log("Server listening on port", PORT);
  });
}

startServer();
