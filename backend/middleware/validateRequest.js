// backend/middleware/validateRequest.js
const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    return next();
  } catch (error) {
    const errorMessages = error.issues.map((e) => ({
      // El path ahora es más limpio, quitamos 'body.'
      field: e.path.length > 1 ? e.path[1] : e.path[0],
      message: e.message,
    }));
    return res.status(400).json({ errors: errorMessages });
  }
};

module.exports = validate;
