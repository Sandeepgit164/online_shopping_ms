module.exports = (app) => {
  app.post("/app-events", async (req, res, next) => {
    const { payload } = req.body;
    console.log("product service received  event");
    console.log("payload", payload);
    res.status(200).json(payload);
  });
};
