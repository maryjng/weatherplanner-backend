const { BadRequestError } = require("../expressError");

// Takes two objects: dataToUpdate and the js variable to column name objects as jsToSql
// Organizes the info that will be updated into parametized form and returns them as a list separated by commas, ready for use in query ex. ['"first_name"=$1', '"age"=$2']
// also returns the values in dataToUpdate

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
