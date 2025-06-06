// utils/dbContext.js (Abstract Base Class with Implementation)
const sql = require('mssql');
const config = require('../../config').DB_CONFIGS;

class DbContext {
  constructor() {
    if (this.constructor === DbContext) {
      throw new Error("Cannot instantiate an abstract class.");
    }
    this.dbName = '';
    this.pool = '';
  }

  // Set dbName in derived classes
  setDatabaseName(dbName) {
    this.dbName = dbName;
  }


  async createPool() {
    const dbConfig = config[this.dbName];
    if (!dbConfig) {
      throw new Error(`Database configuration for ${this.dbName} not found`);
    }
      try {
          this.pool = await new sql.ConnectionPool(dbConfig).connect();
          console.log("✅ Connected to MSSQL");
          
          // Handle connection errors
          this.pool.on("error", async (err) => {
              console.error("❌ Connection pool error", err);
              await this.createPool(); // Reconnect if the connection fails
          });
      } catch (err) {
          console.error("❌ Database connection failed", err);
          setTimeout(() => this.createPool(), 5000);
          //setTimeout(createPool, 5000); // Retry after 5 seconds
      }
  };
  // utils/dbContext.js (or sqlContext.js)
async closePool() {
  try {
    if (this.pool) {
      await this.pool.close();
      console.log(`🔒 Closed pool for ${this.dbName}`);
    }
  } catch (error) {
    console.error(`❌ Error closing pool for ${this.dbName}:`, error);
  }
}



  async executeQuery(query, params = {}) {
    try {
      const request = this.pool.request();
      Object.entries(params).forEach(([key, value]) => request.input(key, value));
      const result = await request.query(query);
      return result.recordset;
    } catch (error) {
      throw new Error(`Error executing query on ${this.dbName}: ${error.message}`);
    }
  }
async executeQuery1(query) {
    try {
        const request = this.pool.request(); // like in your executeQuery
        //console.log(query);
        const result = await request.query(query);
        //console.log(result);
        return result.recordset;
    } catch (err) {
        throw new Error(`Error executing query on ${this.dbName}: ${err.message}`);
    }
}
async executeQuery2(query) {
    try {
        const request = this.pool.request(); // like in your executeQuery
        const result = await request.query(query);
        //console.log(result);
        return result;
    } catch (err) {
        throw new Error(`Error executing query on ${this.dbName}: ${err.message}`);
    }
}
async  executeQueryrowsAffected(query) {
    try {
       const request = this.pool.request(); // like in your executeQuery
        const result = await request.query(query);

        //console.result;
        return result.rowsAffected;
    } catch (err) {
        console.error('❌ Error executing query:', err);
        throw err;
    }
}
async  executeForMultipleDS(query) {
    try {
        // const pool = await poolPromise; // Get the pool
        // const result = await pool.request().query(query);
        const request = this.pool.request(); // like in your executeQuery
        const result = await request.query(query);

        // Define dataset names
        const datasetNames = ['data', 'headers', 'reportinfo'];
        const namedDatasets = {};

        // Assign each dataset to its corresponding name
        result.recordsets.forEach((dataset, index) => {
            namedDatasets[datasetNames[index] || `UnnamedDataset${index + 1}`] = dataset;
        });

        return namedDatasets;
    } catch (err) {
        console.error('❌ Error executing query:', err);
        throw err;
    }
}

  
  async executeNonQuery(query, params = {})  {
    try {
      const request = this.pool.request();
      Object.entries(params).forEach(([key, value]) => request.input(key, value));
      await request.query(query);
    } catch (error) {
      throw new Error(`Error executing non-query on ${dbName}: ${error.message}`);
    }
  };
  // Execute a stored procedure (select,insert, update, delete)
  async executeProcedure(procName, params = {},outputparam = {}) {
    try {
      const request = this.pool.request();
      Object.entries(params).forEach(([key, value]) => request.input(key, value));
      if (Object.keys(outputparam).length > 0) {
        Object.entries(outputparam).forEach(([key, value]) => request.output(key, value));
      }
      console.log(`Executing ${procName} with params:`, params);
      const result = await request.execute(procName);
      //console.log(result);
      //console.log("File is running"); // First line
      return result;
    } catch (error) {
      throw new Error(`Error executing procedure ${procName} on ${this.dbName}: ${error.message}`);
    }
  }

  // Execute a stored procedure and return a scalar value (e.g., count or result of scalar query)
  async executeScalarProcedure(procName, params = {}) {
    try {
      const request = this.pool.request();
      Object.entries(params).forEach(([key, value]) => request.input(key, value));
      const result = await request.execute(procName);
      return result.recordset[0] ? result.recordset[0][Object.keys(result.recordset[0])[0]] : null;
    } catch (error) {
      throw new Error(`Error executing scalar procedure ${procName} on ${this.dbName}: ${error.message}`);
    }
  }
}

module.exports = DbContext;
