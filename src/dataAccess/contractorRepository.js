// const sql = require('mssql');
// const dbContext = require('../dataContext/VMSDBContext');



// const callStoredProcedure = async (procName, inputData, callback) => {
//     if (!inputData) return callback(new Error('Input data is undefined'));

//     try {
//         // Pass empty object for outputparam to avoid adding unwanted outputs
//         const result = await dbContext.executeProcedure(procName, inputData, {});
        
//         callback(null, {
//             result: result.recordset || [],
//             output: {} // Will be empty since we passed {} as outputparam
//         });
//     } catch (error) {
//         callback(error);
//     }
// };

// module.exports = { callStoredProcedure };
