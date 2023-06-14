const launches = require("./launches.mongo");
const planets = require("./planets.mongo");
const axios = require("axios");

// const launches = new Map();

// let latestFlightNumber = 99;

const DEFAULT_FLIGHT_NUMBER = 500;

const launch = {
  flightNumber: DEFAULT_FLIGHT_NUMBER,
  mission: "Kepler Explorion X",
  rocket: "Explorer IS1",
  launchDate: new Date("December 27, 2030"),
  target: "Kepler-442 b",
  customers: ["ZTM", "NASA"],
};

async function findLaunch(filter) {
  return await launches.findOne(filter);
}

async function getLaunchByFlightNumber(flightNumber) {
  // return launches.has(id);
  return await findLaunch({ flightNumber });
}

async function getLatestFlightNumber() {
  const latestLaunch = await launches.findOne().sort("-flightNumber");
  return latestLaunch.flightNumber || DEFAULT_FLIGHT_NUMBER;
}

async function getAllLaunches(skip, limit) {
  // return Array.from(launches.values());
  return await launches
    .find(
      {},
      {
        _id: 0,
        __v: 0,
      }
    )
    .skip(skip)
    .limit(limit)
    .sort({ flightNumber: 1 });
}

async function saveLaunch(launch) {
  await launches.findOneAndUpdate(
    { flightNumber: launch.flightNumber },
    launch,
    {
      upsert: true,
    }
  );
}

// saveLaunch(launch);

async function addNewLaunch(launch) {
  const planet = await planets.findOne({ keplerName: launch.target });

  if (!planet) {
    throw new Error("No mathing planet found");
  }

  const latestFlightNumber = (await getLatestFlightNumber()) + 1;
  const newLaunch = Object.assign(launch, {
    flightNumber: latestFlightNumber,
    customers: launch.customer || ["Zero to Master", "NASA"],
    upcoming: true,
    success: true,
  });
  // launches.set(launch.flightNumber, newLaunch);
  await saveLaunch(launch);
  return newLaunch;
}

async function abortLaunchByFlightNumber(flightNumber) {
  // const aborted = launches.get(flightNumber);
  const aborted = await launches.updateOne(
    { flightNumber },
    {
      upcoming: false,
      success: false,
    }
  );

  return aborted.modifiedCount === 1;
}

const SPACEX_API_URL = "https://api.spacexdata.com/v4/launches/query";

async function loadLaunchesData() {
  const launch = await findLaunch({
    flightNumber: 1,
    rocket: "Falcon 1",
    mission: "FalconSat",
  });
  if (launch) {
    console.log("Launch data alread loaded");
    return;
  }
  console.log("Downloading Launch data from SpaceX API");
  const response = await axios.post(SPACEX_API_URL, {
    query: {},
    options: {
      pagination: false,
      populate: [
        {
          path: "rocket",
          select: {
            name: 1,
          },
        },
        {
          path: "payloads",
          select: {
            customers: 1,
          },
        },
      ],
    },
  });
  const launchDocs = response.data.docs;
  for (const launchDoc of launchDocs) {
    const payloads = launchDoc["payloads"];
    // console.log(payloads);
    const customers = payloads.flatMap((payload) => {
      return payload["customers"];
    });
    const launch = {
      flightNumber: launchDoc["flight_number"],
      mission: launchDoc["name"],
      rocket: launchDoc["rocket"]["name"],
      launchDate: launchDoc["date_local"],
      upcoming: launchDoc["upcoming"],
      success: launchDoc["success"],
      customers,
    };
    console.log(launch["flightNumber"], launch["mission"]);
    await saveLaunch(launch);
  }
}

module.exports = {
  getLaunchByFlightNumber,
  getAllLaunches,
  addNewLaunch,
  abortLaunchByFlightNumber,
  loadLaunchesData,
};
