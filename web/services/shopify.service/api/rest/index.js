import { shopify } from "../../index.js";

const shopifyApiRest = {
  getProduct: async (session, id) => {
    try {
      const response = await shopify.rest.Product.find(
        {
          session,
          id,
        }
      );
      return response;
    } catch (err) {
      console.log("shopifyApiRest.getProduct.err: ", err);
      return null;
    }
  }
}

export { shopifyApiRest }
