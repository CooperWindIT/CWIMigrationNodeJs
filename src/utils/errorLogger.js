// const { executeInsert } = require('../dataContext/LogDBContext');

// const logErrorToDatabase = async (method, url, message, stackTrace) => {
//   const query = `
//     INSERT INTO ErrorLogs (Method, URL, Message, StackTrace)
//     VALUES (@method, @url, @message, @stackTrace)
//   `;
//   const params = { method, url, message, stackTrace };
//   try {
//     //await executeInsert(query, params);
//   } catch (dbError) {
//     console.error('Error logging to database:', dbError.message);
//   }
// };

// module.exports = logErrorToDatabase;
