import { orderService } from "../services/map.js";

const orderController = {
  find: async (req, res) => {
    console.log('req.shopifySession: ', req.shopifySession);
    console.log('res.locals.shopify.session: ', res.locals.shopify.session);
    const response = await orderService.find(
      {
        shopify_session: req.shopifySession._id,
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
