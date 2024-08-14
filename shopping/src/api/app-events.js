const ShoppingService = require("../services/shopping-service");

module.exports = (app) => {
  const shopServive = new ShoppingService();
  app.post("/app-events", async (req, res, next) => {
    const { payload } = req.body;

    shopServive.SubscribeEvents(payload);
    console.log("shopping service received  event");
    console.log("payload", payload);
    res.status(200).json(payload);
  });
};
