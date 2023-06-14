const {
  getAllLaunches,
  addNewLaunch,
  getLaunchByFlightNumber,
  abortLaunchByFlightNumber,
} = require("../../models/launches.model");
const { getPagination } = require("../../services/query");

async function httpGetAllLaunches(req, res) {
  const { skip, limit } = getPagination(req.query);
  const launches = await getAllLaunches(skip, limit);
  return res.status(200).json(launches);
}

async function httpAddNewLaunch(req, res) {
  const { mission, rocket, target, launchDate } = req.body;

  if (!mission || !rocket || !target || !launchDate) {
    return res.status(400).json({
      error: "Missing required launch property",
    });
  }

  const newLaunchDate = new Date(launchDate);

  if (isNaN(newLaunchDate)) {
    return res.status(400).json({
      error: "Invalid launch date",
    });
  }

  const launch = { mission, rocket, target, launchDate: newLaunchDate };
  const newLaunch = await addNewLaunch(launch);
  return res.status(201).json(newLaunch);
}

async function httpAbortLaunch(req, res) {
  const flightNumber = Number(req.params.flightNumber);

  const launch = await getLaunchByFlightNumber(flightNumber);

  if (!launch) {
    return res.status(404).json({
      error: "Launch not found!",
    });
  }

  const isLaunchAborted = await abortLaunchByFlightNumber(flightNumber);
  if (!isLaunchAborted) {
    return res.status(400).json({
      error: "Launch not aborted",
    });
  }
  return res.status(200).json({
    message: "Launch has been aborted",
  });
}

module.exports = {
  httpGetAllLaunches,
  httpAddNewLaunch,
  httpAbortLaunch,
};
