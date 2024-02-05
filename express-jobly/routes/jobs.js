"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/job");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");

const router = new express.Router();


/** POST / { job } =>  { job }
 *
 * job should be { title, salary, equity, company_handle }
 *
 * Returns { id, title, salary, equity, company_handle }
 *
 * Authorization required: ADMIN ONLY 
 */

router.post("/", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
    try {
        const newJob = await Job.create(req.body);
        return res.status(201).json({ newJob });
  } catch (err) {
        return next(err);
  }
});



/** GET /  =>
 *   { jobs: [ { id, title, salary, equity, company_handle}, ...] }
 *
 * Can filter on provided search filters:
 * - title (will find case-insensitive, partial matches)
 * - minSalary
 * - hasEquity 
 *
 * Authorization required: none
 */

router.get("/", async function (req, res, next) {
  try {

    const jobs = await Job.findAll(req.query);
    return res.status(200).json({ jobs });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  =>  { job }
 *
 *  Job is { id, title, salary, equity, companyHandle }
 *http://localhost:3001/jobs?minSalary=100000
 http://localhost:3001/jobs?hasEquity=true
 * Authorization required: none
 */
router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.status(200).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[id] { fld1, fld2, ... } => { id }
 *
 * Patches job data.
 *
 * fields can be: { title, salary, equity }
 *
 * Returns { id, title, salary, equity, companyHandle }
 *
 * Authorization required:  admin
 */

router.patch("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    const job = await Job.update(req.params.id, req.body);
    return res.status(200).json({ job });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[id]  =>  { deleted: id }
 *
 * Authorization: admin
 */

router.delete("/:id", ensureLoggedIn, ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.status(200).json({ deleted: req.params.id });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
