require("babel-register");
require("dotenv").config({ path: __dirname + "/../.env" });

/**
 * Database configuration.
 */
module.exports = {
  client: process.env.DB_CLIENT,
  connection: "postgres://postgres:password@localhost:5432/sentry_db",
  migrations: {
    tableName: "migrations",
    directory: "./migrations",
    stub: "./stubs/migration.stub"
  },
  seeds: {
    directory: "./seeds",
    stub: "./stubs/seed.stub"
  }
};
