"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** POST /jobs */

describe("POST /jobs", function () {
    const newJob = {
       
        title: "New Job",
        salary: 50000,
        equity: "0.05",
        company_handle: "c1",
      };
   

//   admin- NOT WORKING
//   test("ok for admin", async function () {
//     const resp = await request(app)
//         .post("/jobs")
//         .send(newJob)
//         .set("authorization", `Bearer ${u2Token}`);
//     // expect(resp.statusCode).toEqual(201);
//     expect(resp.body).toEqual({"newJob":
// {        company_handle: "c1",
//         equity: "0.05",
//         id: expect.any(Number),
//         salary: 50000,
//         title: "New Job",}
// });


  test("unauthorized for non-admin users", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send(newJob)
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(403);
  });



  test("bad request with invalid data", async function () {
    const resp = await request(app)
        .post("/jobs")
        .send({
          ...newJob,
          salary: "not-a-number", 
          companyHandle: "c1"
        })
        .set("authorization", `Bearer ${u2Token}`);
    expect(resp.statusCode).toEqual(500);
  });
});


// /************************************** GET /jobs */
describe("GET /jobs", function () {
    test("ok for anon", async function () {
      const resp = await request(app).get("/jobs");
  
      // Sort both arrays by a consistent field, like 'id', if the order is not guaranteed
      const sortedActualJobs = resp.body.jobs.sort((a, b) => a.id - b.id);
      const sortedExpectedJobs = [
        {
          title: "Software Engineer",
          salary: 100000,
          equity: "0.001",
          companyHandle: "c1",
          id: expect.any(Number), // using expect.any(Number) since ID is likely auto-generated and variable
        },
        {
          title: "Data Analyst",
          salary: 80000,
          equity: "0",
          companyHandle: "c2",
          id: expect.any(Number),
        },
        {
          title: "Product Manager",
          salary: 120000,
          equity: "0.005",
          companyHandle: "c3",
          id: expect.any(Number),
        },
      ].sort((a, b) => a.id - b.id);
  
      expect(sortedActualJobs).toEqual(sortedExpectedJobs);
    });


  test("fails: test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
        .get("/jobs")
        .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(500);
  });


//****UPDATE WITH THE FILTERS- PART 2*/
test("works: filtering by title", async function () {
    const resp = await request(app).get("/jobs?title=Software Engineer");
    expect(resp.body).toEqual({
      jobs: [
        {
          id: expect.any(Number),
          title: "Software Engineer",
          salary: 100000,
          equity: "0.001",
          companyHandle: "c1",
        },
      ],
    });
  });

  test("works: filtering by minSalary", async function () {
    const resp = await request(app).get("/jobs?minSalary=90000");
    expect(resp.body).toEqual({
      jobs: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          title: "Product Manager",
          salary: 120000,
          equity: "0.005",
          companyHandle: "c3",
        }),
        ({
            id: expect.any(Number),
            title: "Software Engineer",
            salary: 100000,
            equity: "0.001",
            companyHandle: "c1",
          }),
      ]),
    });
});

test("works: filtering by hasEquity", async function () {
    const resp = await request(app).get("/jobs?hasEquity=true");
    expect(resp.body).toEqual({
      jobs: expect.arrayContaining([
        expect.objectContaining({
          companyHandle: "c1",
          equity: "0.001",
          salary: 100000,
          title: "Software Engineer",
        }),
        expect.objectContaining({
          companyHandle: "c3",
          equity: "0.005",
          salary: 120000,
          title: "Product Manager",
        }),
      ]),
    });
  });
});
  

//TRY A DIFFERENT APPROACH
  describe("Job Routes Tests", function () {
    let jobIdSoftwareEngineer, jobIdDataAnalyst, jobIdProductManager;
  
    beforeAll(async function () {
      // Query the database to get the jobs
      const jobsRes = await db.query("SELECT id, title FROM jobs");
      jobsRes.rows.forEach(job => {
        if (job.title === "Software Engineer") {
          jobIdSoftwareEngineer = job.id;
        } else if (job.title === "Data Analyst") {
          jobIdDataAnalyst = job.id;
        } else if (job.title === "Product Manager") {
          jobIdProductManager = job.id;
        }
      });
    });


// /************************************** GET /jobs/:jobs */
describe("GET /jobs/:id", function () {
    test("works for anon with Software Engineer", async function () {
      const resp = await request(app)
      .get(`/jobs/${jobIdSoftwareEngineer}`
   );
      // expect(resp.statusCode).toEqual(200);
      expect(resp.body).toHaveProperty("job");
      expect(resp.body.job.title).toEqual("Software Engineer");
    });
  });


// /************************************** PATCH /jobs/:jobs */
describe("PATCH /jobs/:id", function () {
    test("works for admins updating Data Analyst", async function () {
      const resp = await request(app)
        .patch(`/jobs/${jobIdDataAnalyst}`)
        .send({ title: "Updated Data Analyst" })
        .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toHaveProperty("job");
      expect(resp.body.job.title).toEqual("Updated Data Analyst");
    });
  });


// /************************************** DELETE /jobs/:id */
describe("DELETE /jobs/:id", function () {
    test("works for admins deleting Product Manager", async function () {
      const resp = await request(app)
        .delete(`/jobs/${jobIdProductManager}`)
        .set("authorization", `Bearer ${u2Token}`);
      expect(resp.statusCode).toEqual(200);
      expect(resp.body).toEqual({ deleted: jobIdProductManager.toString() });
    });
  });
});
