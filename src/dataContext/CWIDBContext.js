// dataAccess/sqlDbContext.js (Derived Class)
const DbContext = require('./sqlContext')

class CWIDBContext extends DbContext {
  constructor() {
    super(); // Call the base class constructor
    let dbName = 'CWIdb';
    this.setDatabaseName(dbName);
    //this.createPool();
  }
}
const instance = new CWIDBContext(); // ✅ create the instance
module.exports = instance; // ✅ export the instance directly


