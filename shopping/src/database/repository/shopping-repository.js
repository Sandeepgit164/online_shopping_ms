const { OrderModel, CartModel } = require("../models");
const { v4: uuidv4 } = require("uuid");
const { APIError, BadRequestError } = require("../../utils/app-errors");
const { PublishCustomerEvent } = require("../../utils");

//Dealing with data base operations
class ShoppingRepository {
  // payment

  async Orders(customerId) {
    try {
      const orders = await OrderModel.find({ customerId: customerId });
      return orders;
    } catch (err) {
      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Orders"
      );
    }
  }

  async Cart(customerId) {
    try {
      const cartItems = await CartModel.find({ customerId: customerId });
      console.log("customer id", customerId);
      console.log("cartItems", cartItems);
      if (cartItems) {
        return cartItems;
      } else {
        throw new Error("Data Not found!");
      }
    } catch (error) {
      throw error;
    }
  }

  async AddCartItems(customerId, product, qty, isRemove) {
    const cart = await CartModel.findOne({ customerId: customerId });
    console.log("customerId", customerId);
    console.log("product", product);
    console.log("qty", qty);

    if (cart) {
      let isExist = false;
      let cartItems = cart.items;
      console.log("cart items", cartItems);
      if (cartItems.length > 0) {
        cartItems.map((item) => {
          if (item?.product?._id == product._id) {
            if (isRemove) {
              cartItems.splice(cartItems.indexOf(item), 1);
            } else {
              item.unit = qty;
            }
            isExist = true;
          }
        });
      }
      if (!isExist && !isRemove) {
        cartItems.push({ product: { ...product }, unit: qty });
      }

      cart.items = cartItems;

      return await cart.save();
    } else {
      return await CartModel.create({
        customerId,
        items: [{ product: { ...product }, unit: qty }],
      });
    }
  }

  async CreateNewOrder(customerId, txnId) {
    //check transaction for payment Status

    try {
      const cart = await CartModel.findOne({ customerId: customerId });
      console.log("cart in shopping reppo", cart);
      if (cart) {
        let amount = 0;

        let cartItems = cart.items;
        console.log("cartItems", cartItems);
        if (cartItems.length > 0) {
          //process Order
          cartItems.map((item) => {
            amount += parseInt(item.product.price) * parseInt(item.unit);
          });

          const orderId = uuidv4();

          const order = new OrderModel({
            orderId,
            customerId,
            amount,
            status: "received",
            txnId,
            items: cartItems,
          });

          console.log("order", order);

          cart.items = [];

          const orderResult = await order.save();

          await cart.save();

          return orderResult;
        }
      }

      return {};
    } catch (err) {
      console.log("error in shopping service repository", err);

      throw APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Category"
      );
    }
  }
}

module.exports = ShoppingRepository;
