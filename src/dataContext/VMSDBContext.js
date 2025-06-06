const DbContext = require('./sqlContext')

class VMSDBContext extends DbContext {
  constructor() {
    super(); // Call the base class constructor
    let dbName = 'CWIVMS';
    this.setDatabaseName(dbName);
    //this.createPool();
  }
}
const instance = new VMSDBContext();
module.exports = instance; // ✅ export the instance directly



