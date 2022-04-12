const { sqlForPartialUpdate } = require("./sql.js");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
    test("works", async function () {
        const updateData = {firstName: 'Dan', isAdmin: true};
        const { setCols, values } = sqlForPartialUpdate(
            updateData,
            {
              firstName: "first_name",
              lastName: "last_name",
              isAdmin: "is_admin",
            });
        expect(setCols).toEqual(`"first_name"=$1, "is_admin"=$2`);
        expect(values).toEqual(["Dan",true]);
    });
    test("fails with no data", async function () {
        try {
        const { setCols, values } = sqlForPartialUpdate(
            {},
            {
              firstName: "first_name",
              lastName: "last_name",
              isAdmin: "is_admin",
            });
        } catch (err) {
            expect(err instanceof BadRequestError).toBeTruthy();
        }
    });
});