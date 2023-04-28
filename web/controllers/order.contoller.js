import { orderService } from "../services/map.js";

const orderController = {
  find: async (req, res) => {
    const response = await orderService.find(
      {
        shop: req.get('origin').replace(/(^\w+:|^)\/\//, ''),
        shopify_customer_id: req.params.shopify_customer_id,
      }
    );

    const origin = req.get('origin');

    return res.json(
      {
        response: response,
        origin: origin,
      }
    ).status(200);
  }
}

export { orderController }
