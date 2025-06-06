const CWIDBContext = require('../dataContext/CWIDBContext');
const VMSDBContext = require('../dataContext/VMSDBContext');
const { handleResponse } = require('../utils/responseHandler');
const sql = require('mssql');

const runDbOperation = async (res, dbContext, data, OperationId) => {
  const params = {
    OperationId,
    JsonData: JSON.stringify(data),
  };

  const outputParams = {
    ResultMessage: { type: sql.NVarChar, length: sql.MAX },
    Status: { type: sql.NVarChar, length: sql.MAX },
  };

  try {
    const results = await dbContext.executeProcedure(
      '[dbo].[SP_ScreenOperations]',
      params,
      outputParams
    );
    //console.log(results);
    handleResponse(res, null, results);
  } catch (error) {
    handleResponse(res, error, null);
  }
};

const handleRecord = (req, res, data, OperationId) =>
  runDbOperation(res, CWIDBContext, data, OperationId);

const VMShandleRecord = (req, res, data, OperationId) =>
  runDbOperation(res, VMSDBContext, data, OperationId);

const executeSP = (spName, req, res, dataMap, callback) => {
    try {
        // Validate required parameters
        if (!spName || !req || !res || !dataMap) {
            throw new Error('Missing required parameters');
        }

        // Build input data for stored procedure
        const data = {};
        for (const [key, path] of Object.entries(dataMap)) {
            // Handle nested properties (e.g., 'user.profile.id')
            const value = path.split('.').reduce((obj, prop) => obj?.[prop], req.body);
            
            if (value === undefined) {
                console.warn(`Missing parameter: ${path} for SP ${spName}`);
            }

            // Stringify JSON/array data
            data[key] = (Array.isArray(value) || typeof value === 'object') 
                ? JSON.stringify(value) 
                : value;
        }
        //console.log(data);
        

        // Execute stored procedure
        callStoredProcedure(spName, data, (error, results) => {
            if (error) {
                console.error(`Stored procedure ${spName} error:`, error);
                return res.status(400).json({ 
                    success: false,
                    message: error.message || 'Database operation failed'
                });
            }
            //console.log(results);
            //console.log(callback);
            // Execute callback if provided (e.g., for notifications)
            if (callback) {
                try {
                    //console.log(results);
                    callback(results);
                } catch (callbackError) {
                    console.error(`Callback error in ${spName}:`, callbackError);
                }
            }

            // Send success respSonse
           
        });

    } catch (error) {
        console.error(`API error in ${spName}:`, error);
        res.status(400).json({ 
            success: false,
            message: error.message || 'Invalid request'
        });
    }
};

const callStoredProcedure = async (procName, inputData, callback) => {
    if (!inputData) return callback(new Error('Input data is undefined'));

    try {
        // Pass empty object for outputparam to avoid adding unwanted outputs
        //console.log("File is running"); // First line
        const result = await  VMSDBContext.executeProcedure(procName, inputData, {});
        //console.log(result);
        callback(null, {
            result: result.recordset || [],
            output: {} // Will be empty since we passed {} as outputparam
        });
    } catch (error) {
        callback(error);
    }
};


module.exports = { handleRecord, VMShandleRecord, executeSP };



// // helper.js
// const CWIDBContext = require('../dataContext/CWIDBContext'); // Import the correct database context class
// const VMSDBContext = require('../dataContext/VMSDBContext');
// const { handleResponse } = require('../utils/responseHandler');
// const sql = require('mssql'); // Ensure sql is imported
// //const dbContext = new CWIDBContext(); // Instantiate the derived class



// const handleRecord = async (req, res, data, OperationId) => {
//   const jsonData = JSON.stringify(data);

//   const params = {
//     OperationId: OperationId,
//     JsonData: jsonData,
//   };
//   console.log(params);

//   const outputParams = {
//     ResultMessage: { type: sql.NVarChar, length: sql.MAX },
//     Status: { type: sql.NVarChar, length: sql.MAX },
//   };

//   try {

//     //await dbContext.connect(); // Ensure the connection to the database is established
    
//     const results = await CWIDBContext.executeProcedure(
//       '[dbo].[SP_ScreenOperations]',
//       params,
//       outputParams
//     );
//     //console.log(results);
//     //console.log(results.length);
//     handleResponse(res, null, results); // Pass 'null' for error in the success case
//   } catch (error) {
//     handleResponse(res, error, null); // Pass 'null' for results in the error case
//   }
// };


// const VMShandleRecord = async (req, res, data, OperationId) => {
//   const jsonData = JSON.stringify(data);

//   const params = {
//     OperationId: OperationId,
//     JsonData: jsonData,
//   };
//   console.log(params);

//   const outputParams = {
//     ResultMessage: { type: sql.NVarChar, length: sql.MAX },
//     Status: { type: sql.NVarChar, length: sql.MAX },
//   };

//   try {

//     //await dbContext.connect(); // Ensure the connection to the database is established
    
//     const results = await VMSDBContext.executeProcedure(
//       '[dbo].[SP_ScreenOperations]',
//       params,
//       outputParams
//     );
//     //console.log(results);
//     //console.log(results.length);
//     handleResponse(res, null, results); // Pass 'null' for error in the success case
//   } catch (error) {
//     handleResponse(res, error, null); // Pass 'null' for results in the error case
//   }
// };


// module.exports = { handleRecord, VMShandleRecord };


