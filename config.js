module.exports = {
    PORT: process.env.PORT || 3000,
    
    // Database Configurations for Multiple Databases
    DB_CONFIGS: {
      
      CWIVMS: {
        user: 'sa',
        password: 'Cwidb@1234',
        server: '68.178.163.111',
        database: 'QAVMS1',
        connectionTimeout: 30000, 
        requestTimeout: 30000,
        options: {
          encrypt: true, // Azure
          trustServerCertificate: true, 
        },
      },
      // Add more databases as needed
    },
  };
  
