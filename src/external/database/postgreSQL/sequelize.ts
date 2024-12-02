import { Sequelize } from "@sequelize/core";
import { PostgresDialect } from "@sequelize/postgres";

// Configure PostgreSQL connection
const sequelize = new Sequelize({
  dialect: PostgresDialect,
  database: "fastfood", // Database name
  password: "admin", // Your password
  host: "localhost", // Hostname
  port: 5432, // PostgreSQL default port
  clientMinMessages: "notice", // Optional: Minimum log level
});

export default sequelize;
