import { shopifyApiGraphql } from "../services/map.js";

const shopifyController = {
  getCustomers: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;
    const input = {
      first: 50,
    };
    console.log("req.params.query: ", req.params.query);
    if (req.params.first != 0) input.first = req.params.first;
    if (req.params.query != 0) input.query = req.params.query;
    if (req.params.after != 0) input.after = req.params.after;

    try {
      const response = await shopifyApiGraphql.customer.get(shopifySessionFromInternalApiRequest, input);

      return res.status(200).json(response?.body?.data);
    } catch (err) {
      console.log("shopifyController.getCustomers.err: ", err);
      return res.status(500);
    }
  },
}

export { shopifyController }
