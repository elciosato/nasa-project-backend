const request = require("supertest");
const app = require("../../app");
const { loadPlanetsData } = require("../../models/planets.model");
const { mongoConnect, mongoDisconnect } = require("../../services/mongo");

describe("Launches API", () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData();
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe("Test GET /v1/launches", () => {
    test("It should respond with 200 success", async () => {
      const response = await request(app)
        .get("/v1/launches")
        .expect("Content-Type", /json/)
        .expect(200);
      // expect(response.statusCode).toBe(200);
    });
  });

  describe("Test POST /v1/launches", () => {
    const launchWithoutDate = {
      mission: "USS Enterprise",
      rocket: "NCC 1701-D",
      target: "Kepler-1652 b",
    };
    const launchDate = "January 4, 2028";

    test("It should respond with 201 created", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({ ...launchWithoutDate, launchDate })
        .expect("Content-Type", /json/)
        .expect(201);
      expect(response.body).toMatchObject(launchWithoutDate);
      const requestLaunchDate = new Date(launchDate).valueOf();
      const responseLaunchDate = new Date(response.body.launchDate).valueOf();
      expect(requestLaunchDate).toBe(responseLaunchDate);
      // console.log(launchWithoutDate);
    }, 10000);

    test("It should catch missing required properties", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send(launchWithoutDate)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Missing required launch property",
      });
    });

    test("It should catch invalid date", async () => {
      const response = await request(app)
        .post("/v1/launches")
        .send({ ...launchWithoutDate, launchDate: "Hello" })
        .expect("Content-Type", /json/)
        .expect(400);
      expect(response.body).toStrictEqual({
        error: "Invalid launch date",
      });
    });
  });
});
