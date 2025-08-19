const express = require('express');
require('dotenv').config();
const helmet = require('helmet');
const cors = require('cors');

const app = express();
const config = require('./config');
const logger = require('./src/utils/logger');
const errorHandler = require('./src/middlewares/errorMiddleware');

const CWIRoutes = require('./src/routes/CWIRoutes');
const ADMINRoutes = require('./src/routes/SuperAdminRoutes');
const contractorRoutes = require('./src/routes/ContractorRoutes');
const visitorRoutes = require('./src/routes/visitorRoutes');
const UserAccessRoutes = require('./src/routes/UserAccessRoutes');
const uploadRoutes = require('./src/routes/file.upload.router');
const ReportRoutes =  require('./src/routes/ReportsRoutes');
const PublicRoutes = require('./src/routes/PublicRoutes');


const cwiDb = require('./src/dataContext/CWIDBContext');
const vmsDb = require('./src/dataContext/VMSDBContext');

const PORT = config.PORT || 3000;
const host = '0.0.0.0';

// Middleware setup
app.use(helmet());
app.use(cors());
app.use(express.json());

// Logger middleware - place this early
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

app.use('/public', PublicRoutes);
app.use('/CWIRoutes', CWIRoutes);
app.use('/ADMINRoutes', ADMINRoutes);
app.use('/file_upload', uploadRoutes);
app.use('/contractor', contractorRoutes);
app.use('/visitor', visitorRoutes);
app.use('/auth', UserAccessRoutes);
app.use('/Report',ReportRoutes);


// Simulate error
app.get('/error', (req, res, next) => {
  try {
    throw new Error('Simulated error');
  } catch (error) {
    next(error);
  }
});

// 404 handler
app.use((req, res, next) => {
  const error = new Error('Route not found');
  error.status = 404;
  next(error);
});

// Global error handler
//app.use(errorHandler);

// Start server only after DB connections
const startServer = async () => {
  try {
    // await cwiDb.createPool();
    await vmsDb.createPool();

    app.listen(PORT, host, () => {
      logger.info(`✅ running at http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error("❌ Failed to start server:", err);
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Server is shutting down...');
  await cwiDb.closePool();
  await vmsDb.closePool();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Server is shutting down...');
  await cwiDb.closePool();
  await vmsDb.closePool();
  process.exit(0);
});



// const express = require('express');
// require('dotenv').config();
// const app = express();
// const helmet = require('helmet');
// app.use(helmet()); 
// const config = require('./config');
// const errorHandler = require('./src/middlewares/errorMiddleware');
// const logger = require('./src/utils/logger');
// const CWIRoutes = require('./src/routes/CWIRoutes');
// const ADMINRoutes = require('./src/routes/SuperAdminRoutes');
// const contractorRoutes = require('./src/routes/ContractorRoutes');
// const UserAccessRoutes = require('./src/routes/UserAccessRoutes');
// const uploadRoutes =require('./src/routes/file.upload.router');
// const cwiDb = require('./src/dataContext/CWIDBContext');
// const vmsDb = require('./src/dataContext/VMSDBContext');
// const cors = require('cors');
// app.use(cors());
// app.use(express.json());


// const startServer = async () => {
//   try {
//     await cwiDb.createPool();
//     await vmsDb.createPool();

//     app.listen(PORT, host, () => {
//       logger.info(`✅ running at http://localhost:${PORT}`);
//     });
//   } catch (err) {
//     logger.error("❌ Failed to start server:", err);
//   }
// };

// startServer();

// // Define a basic route to test that the server is working
// app.get('/', (req, res) => {
//   res.send('Hello, world!');
// });  

// app.use((req, res, next) => {
//   logger.info(`${req.method} ${req.url}`);
//   next();
// });

// app.use('/CWIRoutes', CWIRoutes);
// app.use('/ADMINRoutes', ADMINRoutes);
// app.use('/file_upload', uploadRoutes);
// app.use('/contractor', contractorRoutes);
// app.use('/auth', UserAccessRoutes);
// // app.use('/Report',ReportRoutes);
// // app.use('/visitor', visitorRoutes);

// app.use((req, res, next) => {
//     const error = new Error('Route not found');
//     error.status = 404;
//     next(error); // Pass 404 to global handler
// });
// app.get('/error', (req, res, next) => {
//   try {
//     throw new Error('Simulated error');
//   } catch (error) {
//     next(error); // Pass error to middleware
//   }
// });

// // Global error handler
// app.use(errorHandler);

// // Start server
// const PORT = config.PORT || 3000;
// const host = '0.0.0.0'; // This makes the server accessible externally (from any IP)
// app.listen(PORT, () => {
//   logger.info(`running at http://localhost:${PORT}`);
// });


// process.on('SIGINT', async () => {
//   console.log('\n🛑 Server is shutting down...');
//   await cwiDb.closePool();
//   await vmsDb.closePool();
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   console.log('\n🛑 Server is shutting down...');
//   await cwiDb.closePool();
//   await vmsDb.closePool();
//   process.exit(0);
// });
