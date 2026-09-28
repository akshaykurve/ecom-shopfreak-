const REQUIRED_ENV_VARS = [
  "MONGO_URI",
  "ACCESS_TOKEN_SECRET",
  "REFRESH_TOKEN_SECRET",
  "CLIENT_URL",
];

// Fails fast with a clear message instead of limping along and producing
// confusing errors later (e.g. jwt.sign silently using `undefined` as a secret).
const validateEnv = () => {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variable(s): ${missing.join(", ")}`);
    console.error("Copy .env.example to .env and fill in real values.");
    process.exit(1);
  }
};

module.exports = validateEnv;
