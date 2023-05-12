import { shopify } from "../../index.js";

const shopifyApiRest = {
  getProduct: async (session, id) => {
    try {
      const response = await shopify.api.rest.Product.find(
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
  },
  createPriceRule: async (session) => {
    try {
      const price_rule = new shopify.api.rest.PriceRule({session});
      price_rule.title = "BuyWithRewardPoints";
      price_rule.value_type = "percentage";
      price_rule.value = "-100.0";
      price_rule.customer_selection = "all";
      price_rule.target_type = "line_item";
      price_rule.target_selection = "entitled";
      price_rule.allocation_method = "each";
      price_rule.starts_at = "2023-05-12T00:00:00-00:00";
      // price_rule.prerequisite_collection_ids = [
      //   7489095598319
      // ];
      price_rule.entitled_product_ids = [
        7489095598319
      ];
      // price_rule.prerequisite_to_entitlement_quantity_ratio = {
      //   "prerequisite_quantity": 1,
      //   "entitled_quantity": 1
      // };
      // price_rule.allocation_limit = 1;

      const response = await price_rule.save(
        {
          update: true,
        }
      );
      console.log('shopifyApiRest.createPriceRule.response: ', response);
      return response;
    } catch (err) {
      console.log("shopifyApiRest.createPriceRule.err: ", err);
      return null;
    }
  },
  listPriceRules: async (session) => {
    try {
      const response = await shopify.api.rest.PriceRule.all({session});
      console.log('listPriceRules.response: ', response);
      return response;
    } catch (err) {
      console.log('listPriceRules.err: ', response);
    }
  }
}

export { shopifyApiRest }
