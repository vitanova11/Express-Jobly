"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */
describe("create", function () {
  test("works", async function () {
    const newJob = {
      title: "New Job",
      salary: 60000,
      equity: "0",
      companyHandle: "c1"
    };

    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: expect.any(Number),
      title: "New Job",
      salary: 60000,
      equity: "0",
      companyHandle: "c1"
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`, [job.id]);
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "New Job",
        salary: 60000,
        equity: "0",
        company_handle: "c1"
      },
    ]);
  });
});


/************************************** findAll */
describe("findAll", function () {
    test("works: no filter", async function () {
      await Job.create({ title: "Software Engineer", salary: 100000, equity: "0.001", companyHandle: "c1" });
      await Job.create({ title: "Data Analyst", salary: 80000, equity: "0", companyHandle: "c2" });
      await Job.create({ title: "Product Manager", salary: 120000, equity: "0.005", companyHandle: "c3" });
  
      let jobs = await Job.findAll();
      jobs.sort((a, b) => a.id - b.id); // Sort jobs by id
  
      expect(jobs).toEqual([
        {
          id: expect.any(Number),
          title: "Software Engineer",
          salary: 100000,
          equity: "0.001",
          companyHandle: "c1"
        },
        {
          id: expect.any(Number),
          title: "Data Analyst",
          salary: 80000,
          equity: "0",
          companyHandle: "c2"
        },
        {
          id: expect.any(Number),
          title: "Product Manager",
          salary: 120000,
          equity: "0.005",
          companyHandle: "c3"
        }
      ].sort((a, b) => a.id - b.id)); // Sort expected jobs by id 
    });
  });


/************************************** update */
describe("update", function () {
  test("works", async function () {
    let newJob = await Job.create({ title: "Old Job", salary: 50000, equity: "0", companyHandle: "c1" });
    const updateData = {
      title: "Updated Job",
      salary: 70000,
      equity: "0.1"
    };

    let job = await Job.update(newJob.id, updateData);
    expect(job).toEqual({
      id: newJob.id,
      ...updateData,
      companyHandle: "c1",
    });
  });
});


/************************************** remove */
describe("remove", function () {
  test("works", async function () {
    let newJob = await Job.create({ title: "Job to delete", salary: 50000, equity: "0", companyHandle: "c1" });
    await Job.remove(newJob.id);
    const res = await db.query("SELECT id FROM jobs WHERE id = $1", [newJob.id]);
    expect(res.rows.length).toEqual(0);
  });
});
