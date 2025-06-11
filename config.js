module.exports = {
    PORT: process.env.PORT || 3000,
    
    // Database Configurations for Multiple Databases
    DB_CONFIGS: {
      
      CWIVMS: {
        user: 'admin',
        password: 'vms123456',
        server: 'vms2025.crioumyeym6x.eu-north-1.rds.amazonaws.com',
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
  
