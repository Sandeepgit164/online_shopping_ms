const ShoppingService = require("../services/shopping-service");
const UserAuth = require("./middlewares/auth");
const {
  PublishCustomerEvent,
  PublishMessage,
  SubscribeMessage,
} = require("../utils");
const { CUSTOMER_BINDING_KEY } = require("../config");

module.exports = (app, channel) => {
  const service = new ShoppingService();
  SubscribeMessage(channel, service);

  app.post("/order", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const { txnId } = req.body;
    console.log("userId", _id);
    console.log("txnId", txnId);

    try {
      const { data } = await service.PlaceOrder({ _id, txnId });
      const payload = await service.GetOrderPayload(_id, data, "CREATE_ORDER");
      console.log("data", data);
      console.log("payload", payload);
      //PublishCustomerEvent(payload);
      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload));
      return res.status(200).json(data);
    } catch (err) {
      console.log("error in order api", err);
      next(err);
    }
  });

  app.get("/orders", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const { data } = await service.GetOrders(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/cart", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    try {
      console.log("_id", _id);
      const { data } = await service.getCart(_id);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });
};
