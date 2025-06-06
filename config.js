module.exports = {
    PORT: process.env.PORT || 3000,
    
    // Database Configurations for Multiple Databases
    DB_CONFIGS: {
      CWIdb: {
        user: 'sa',
        password: 'sadguru',
        server:'CWIDEVLAP02/SQLEXPRESS',//'CWIDEVLAP02/SQLEXPRESS',
        database: 'CWI_db',
        connectionTimeout: 30000, 
        requestTimeout: 30000,  
        options: {
          encrypt: true, // Azure
          trustServerCertificate: true, 
        },
      },
      CWIVMS: {
        user: 'sa',
        password: 'sadguru',
        server: 'CWIDEVLAP02/SQLEXPRESS',
        database: 'QAVMS2',
        options: {
          encrypt: true, // Azure
          trustServerCertificate: true, 
        },
      },
      
      // Add more databases as needed
    },
  };
  