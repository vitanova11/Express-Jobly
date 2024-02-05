const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe("sqlForPartialUpdate", function () {
  test("works: valid input", function () {
    const dataToUpdate = { firstName: "Test", lastName: "Tester" };
    const jsToSql = { firstName: "first_name", lastName: "last_name" };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "last_name"=$2',
      values: ["Test", "Tester"],
    });
  });

  test("throws error: no data", function () {
    expect(() => {
      sqlForPartialUpdate({}, {});
    }).toThrow(BadRequestError);
  });

  test("works: unmapped keys", function () {
    const dataToUpdate = { firstName: "Test", age: 30 };
    const jsToSql = { firstName: "first_name" };
    const result = sqlForPartialUpdate(dataToUpdate, jsToSql);

    expect(result).toEqual({
      setCols: '"first_name"=$1, "age"=$2',
      values: ["Test", 30],
    });
  });
});
