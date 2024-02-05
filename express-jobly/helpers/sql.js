const { BadRequestError } = require("../expressError");

/**
 This function is used to create a part of an SQL update query when only a subset
 of columns need to be updated. It maps JavaScript object keys (field names in the dataToUpdate object) to corresponding SQL column names using the jsToSql mapping, and creates a string for use inan SQL SET clause, as well as an array of values for the query parameters.
 - dataToUpdate: an object where keys represent the columns to update and values represent the new values.
 - jsToSql: an object mapping JavaScript camelCase field names to SQL snake_case column names.
          e.g., {firstName: 'first_name', lastName: 'last_name'}
 - Returns: an object with two properties:
    - setCols: A string of column-value pairs for the SQL SET clause.
               e.g., '"first_name"=$1, "last_name"=$2'
    - values: An array of values corresponding to the placeholders in the setCols string.
              e.g., ['Aliya', 32]
 
 -And throws BadRequestError if dataToUpdate is empty.
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
