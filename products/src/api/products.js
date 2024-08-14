const ProductService = require("../services/product-service");
const UserAuth = require("./middlewares/auth");
const {
  PublishCustomerEvent,
  PublishShoppingEvent,
  PublishMessage,
} = require("./../utils");
const { CUSTOMER_BINDING_KEY, SHOPPING_BINDING_KEY } = require("../config");
module.exports = (app, channel) => {
  const service = new ProductService();

  app.post("/create", async (req, res, next) => {
    try {
      const { name, desc, type, unit, price, available, suplier, banner } =
        req.body;
      // validation
      const { data } = await service.CreateProduct({
        name,
        desc,
        type,
        unit,
        price,
        available,
        suplier,
        banner,
      });
      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/category/:type", async (req, res, next) => {
    const type = req.params.type;

    try {
      const { data } = await service.GetProductsByCategory(type);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/:id", async (req, res, next) => {
    const productId = req.params.id;

    try {
      const { data } = await service.GetProductDescription(productId);
      return res.status(200).json(data);
    } catch (err) {
      next(err);
    }
  });

  app.post("/ids", async (req, res, next) => {
    try {
      const { ids } = req.body;
      const products = await service.GetSelectedProducts(ids);
      return res.status(200).json(products);
    } catch (err) {
      next(err);
    }
  });

  app.put("/wishlist", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    // get the payload to send to customer service

    try {
      const payload = await service.GetProductPaylod(
        _id,
        {
          productId: req.body._id,
        },
        "ADD_TO_WISHLIST"
      );
      // webhook call
      //PublishCustomerEvent(payload);

      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload));

      return res.status(200).json(payload.data.product);
    } catch (err) {}
  });

  app.delete("/wishlist/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;
    const productId = req.params.id;

    try {
      const payload = await service.GetProductPaylod(
        _id,
        {
          productId: productId,
        },
        "REMOVE_FROM_WISHLIST"
      );
      //PublishCustomerEvent(payload);
      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload));

      return res.status(200).json(payload.data.product);
    } catch (err) {
      next(err);
    }
  });

  app.put("/cart", UserAuth, async (req, res, next) => {
    const { _id, qty } = req.body;

    try {
      const payload = await service.GetProductPaylod(
        req.user._id,
        {
          productId: _id,
          qty,
        },
        "ADD_TO_CART"
      );
      // PublishCustomerEvent(payload);
      //PublishShoppingEvent(payload);

      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload));
      PublishMessage(channel, SHOPPING_BINDING_KEY, JSON.stringify(payload));

      const response = {
        product: payload.data.product,
        unit: payload.data.qty,
      };

      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  });

  app.delete("/cart/:id", UserAuth, async (req, res, next) => {
    const { _id } = req.user;

    try {
      const payload = await service.GetProductPaylod(
        _id,
        {
          productId: req.params.id,
          qty: 0,
        },
        "REMOVE_FROM_CART"
      );
      PublishCustomerEvent(payload);
      PublishShoppingEvent(payload);

      PublishMessage(channel, CUSTOMER_BINDING_KEY, JSON.stringify(payload));

      PublishMessage(channel, SHOPPING_BINDING_KEY, JSON.stringify(payload));

      const response = {
        product: payload.data.product,
        unit: payload.data.qty,
      };

      return res.status(200).json(response);
    } catch (err) {
      next(err);
    }
  });

  //get Top products and category
  app.get("/", async (req, res, next) => {
    //check validation
    try {
      const { data } = await service.GetProducts();
      return res.status(200).json(data);
    } catch (error) {
      next(err);
    }
  });
};
