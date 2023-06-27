import { shopify } from "../services/map.js";

const shopifyController = {
  getCustomers: async (req, res) => {
    const shopifySessionFromInternalApiRequest = res.locals.shopify.session;
    const requestData = {
      session:shopifySessionFromInternalApiRequest,
      // fields: "id,email,first_name,last_name",
    };
    if (req.params.since_id != 0) requestData.since_id = req.params.since_id;
    if (req.params.limit != 0) requestData.limit = req.params.limit;

    try {
      // debugger
      console.log("requestData: ", requestData);
      const response = await shopify.api.rest.Customer.all(requestData);

      // debugger
      console.log("response: ", response);
      return res.status(200).json(
        {
          customers: response,
        }
      );
    } catch (err) {
      console.log("shopifyController.getCustomers.err: ", err);
      return res.status(500);
    }
  },
}

export { shopifyController }
