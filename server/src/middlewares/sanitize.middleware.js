// Strips keys that could be interpreted as MongoDB query operators (e.g. a
// request body of {"email": {"$gt": ""}}) so user input can never be used to
// inject operators into a query. Mutates objects in place rather than
// reassigning req.query/req.params - Express 5 makes req.query a read-only
// getter, so `req.query = ...` would throw.
const sanitizeValue = (value) => {
  if (Array.isArray(value)) {
    value.forEach(sanitizeValue);
    return;
  }

  if (value && typeof value === "object") {
    for (const key of Object.keys(value)) {
      if (key.startsWith("$") || key.includes(".")) {
        delete value[key];
        continue;
      }
      sanitizeValue(value[key]);
    }
  }
};

const sanitizeInput = (req, res, next) => {
  sanitizeValue(req.body);
  sanitizeValue(req.params);
  sanitizeValue(req.query);
  next();
};

module.exports = sanitizeInput;
