import { shopify } from "../index.js";

const shopifyApiRest = {
  listProducts: async (session, ids) => {
    const response = await shopify.rest.Product.all(
      {
        session,
        ids,
      }
    );
    return response;
  },
}

export { shopifyApiRest }
