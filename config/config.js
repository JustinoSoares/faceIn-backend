require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: "postgres",
    timezone: "+01:00", // Luanda está em UTC+1
    logging: false,
     dialectOptions: {
       ssl: {
         require: true,
         rejectUnauthorized: true, // Use true em produção
       },
     },
  },
  test: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: "postgres",
    timezone: "+01:00", // Luanda está em UTC+1
    logging: false,
     dialectOptions: {
       ssl: {
         require: true,
         rejectUnauthorized: true, // Use true em produção
       },
     },
  },
  production: {
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    host: process.env.DATABASE_HOST,
    dialect: "postgres",
    timezone: "+01:00", // Luanda está em UTC+1
    logging: false,
     dialectOptions: {
       ssl: {
         require: true,
         rejectUnauthorized: true, // Use true em produção
       },
     },
  },
};
