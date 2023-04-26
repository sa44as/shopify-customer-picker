import { configurationModel } from "../models/map.js";

const configurationController = {
  find: (req, res) => {
    const response = configurationModel.find(
      {
        shop: req.params.shop,
        shopify_customer_id: req.params.shopify_customer_id,
      }
    );

    res.json(
      {
        response: response,
      }
    ).status(200);
  },

  update: () => {
    return { action: 'update' };
  },

  remove: () => {
    return { action: 'delete' };
  },
}

export { configurationController }
