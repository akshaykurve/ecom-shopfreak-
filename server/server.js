require("dotenv").config();

const validateEnv = require("./src/utils/validateEnv");
validateEnv();

const app = require("./src/app");
const { disconnectDB } = require("./src/config/db");

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Let in-flight requests finish and close the DB connection cleanly instead
// of dropping connections when the platform stops/restarts the process.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
