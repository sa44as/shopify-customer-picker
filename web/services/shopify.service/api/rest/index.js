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
  createPriceRule: async (session, customerId, productId) => {
    try {
      const price_rule = new shopify.api.rest.PriceRule({session});
      price_rule.title = "BuyProduct[7489095598319]WithRewardPoints";
      price_rule.value_type = "percentage";
      price_rule.value = "-100.0";
      price_rule.target_type = "line_item";
      price_rule.target_selection = "entitled";
      price_rule.allocation_method = "each";
      price_rule.starts_at = "2023-05-12T00:00:00-00:00";
      price_rule.prerequisite_customer_ids = [
        customerId,
      ];
      price_rule.entitled_product_ids = [
        productId,
      ];
      price_rule.once_per_customer = true;
      price_rule.allocation_limit = 1;

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
      return null;
    }
  },
  createDiscountCode: async (session, priceRuleId, code) => {
    try {
      const discount_code = new shopify.api.rest.DiscountCode({session});
      discount_code.price_rule_id = priceRuleId;
      discount_code.code = code;
      const response = await discount_code.save(
        {
          update: true,
        }
      );
      console.log('createDiscountCode.response: ', response);
      return response;
    } catch (err) {
      console.log('createDiscountCode.err: ', err);
      return null;
    }
  },
}

export { shopifyApiRest }
