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
    const newJob = {
        title: "new",
        salary: 50000,
        equity: 0.0,
        companyHandle: 'c1',
    };

    test("works", async function () {
        let job = await Job.create(newJob);
        expect(job).toEqual({
            id: expect.any(Number),
            title: "new",
            salary: 50000,
            equity: "0",
            companyHandle: 'c1',
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'new'`);
        expect(result.rows).toEqual([
            {
                id: expect.any(Number),
                title: "new",
                salary: 50000,
                equity: "0",
                companyHandle: 'c1',
            },
        ]);
    });
});

/************************************** findAll */

describe("findAll", function () {
    test("works: no filter", async function () {
        let jobs = await Job.findAll();
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "junior software engineer",
                salary: 80000,
                equity: "0.0",
                companyHandle: 'c1',
            },
            {
                id: expect.any(Number),
                title: "senior software engineer",
                salary: 130000,
                equity: "0.1",
                companyHandle: 'c3',
            },
            {
                id: expect.any(Number),
                title: "director of technology",
                salary: 200000,
                equity: "0.5",
                companyHandle: 'c3',
            },
        ]);
    });
});

/************************************** find */

describe("find", function () {
    test("works with filter", async function () {
        let jobs = await Job.find({ title: 'software engineer', minSalary: 100000, hasEquity: true });
        expect(jobs).toEqual([
            {
                id: expect.any(Number),
                title: "senior software engineer",
                salary: 130000,
                equity: "0.1",
                companyHandle: 'c3',
            },
        ]);
    });
});

/************************************** get */

describe("get", function () {
    test("works", async function () {
        let job = await Job.find({ title: 'junior software engineer' });
        let jobRes = await Job.get(job[0].id);
        expect(jobRes).toEqual({
            id: job[0].id,
            title: "junior software engineer",
            salary: 80000,
            equity: "0.0",
            companyHandle: "c1",
        });
    });

    test("not found if no job id", async function () {
        try {
            await Job.get(1000000);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});

/************************************** update */

describe("update", function () {
    const updateData = {
        title: "New",
        salary: 50000,
        equity: 1.0,
    };

    test("works", async function () {
        let job = await Job.find({ title: 'junior software engineer' });
        let jobRes = await Job.update(job[0].id, updateData);
        expect(jobRes).toEqual({
            id: job[0].id,
            title: "New",
            salary: 50000,
            equity: "1",
            companyHandle: "c1",
        });

        const result = await db.query(
            `SELECT id, title, salary, equity, company_handle AS "companyHandle"
           FROM jobs
           WHERE title = 'New'`);
        expect(result.rows).toEqual([{
            id: job[0].id,
            title: "New",
            salary: 50000,
            equity: "1",
            companyHandle: "c1",
        }]);
    });

    test("not found if no such job", async function () {
        try {
            await Job.update(1000000, updateData);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });

    test("bad request with no data", async function () {
        try {
            let job = await Job.find({ title: 'junior software engineer' });
            
            await Job.update(job[0].id, {});
            fail();
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});

/************************************** remove */

describe("remove", function () {

    test("works", async function () {
        let job = await Job.find({ title: 'junior software engineer' });
        await Job.remove(job[0].id);
        const res = await db.query(
            `SELECT id FROM jobs WHERE id=${job[0].id}`);
        expect(res.rows.length).toEqual(0);
    });

    test("not found if no job", async function () {
        try {
            await Job.remove(1000000);
            fail();
        } catch (err) {
            expect(err instanceof NotFoundError).toBeTruthy();
        }
    });
});
