const https = require("https");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const app = require("./app");
const { loadLaunchesData } = require("./models/launches.model");
const { loadPlanetsData } = require("./models/planets.model");
const { mongoConnect } = require("./services/mongo");

const options = {
  key: fs.readFileSync(path.join(__dirname, "..", "cert", "server.key")),
  cert: fs.readFileSync(path.join(__dirname, "..", "cert", "server.crt")),
};

const server = https.createServer(options, app);
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
