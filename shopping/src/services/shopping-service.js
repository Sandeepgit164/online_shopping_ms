const { ShoppingRepository } = require("../database");
const { FormateData } = require("../utils");

// All Business logic will be here
class ShoppingService {
  constructor() {
    this.repository = new ShoppingRepository();
  }

  async getCart(_id) {
    try {
      const cartItems = await this.repository.Cart(_id);
      return FormateData(cartItems);
    } catch (error) {
      throw error;
    }
  }

  async PlaceOrder(userInput) {
    const { _id, txnNumber } = userInput;

    // Verify the txn number with payment logs

    try {
      const orderResult = await this.repository.CreateNewOrder(_id, txnNumber);
      console.log("orderResult", orderResult);
      return FormateData(orderResult);
    } catch (err) {
      console.log("error in placeorder service", err);
      throw new APIError("Data Not found", err);
    }
  }

  async GetOrders(customerId) {
    try {
      const orders = await this.repository.Orders(customerId);
      return FormateData(orders);
    } catch (err) {
      throw new APIError("Data Not found", err);
    }
  }

  async ManageCart(customerId, product, qty, isRemove) {
    try {
      const cartResults = await this.repository.AddCartItems(
        customerId,
        product,
        qty,
        isRemove
      );

      return FormateData(cartResults);
    } catch (error) {
      throw error;
    }
  }

  async SubscribeEvents(payload) {
    const { data, event } = JSON.parse(payload);

    const { userId, product, qty } = data;

    switch (event) {
      case "ADD_TO_CART":
        this.ManageCart(userId, product, qty, false);
        break;
      case "REMOVE_FROM_CART":
        this.ManageCart(userId, product, qty, true);
      default:
        break;
    }
  }

  async GetOrderPayload(userId, order, event) {
    if (order) {
      const payload = {
        event,
        data: { userId, order },
      };
      return payload;
    } else {
      return FormateData({ error: "No Order Available" });
    }
  }
}

module.exports = ShoppingService;
