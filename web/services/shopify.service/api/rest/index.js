import { shopify } from "../../index.js";

const shopifyApiRest = {
  shop: {
    metafield: {
      create_or_update: async (session, namespace, key, value, type) => {
        try {
          const metafield = new shopify.api.rest.Metafield({session});
          metafield.namespace = namespace;
          metafield.key = key;
          metafield.value = type === "json" || type === "list.product_reference" ? JSON.stringify(value) : value;
          metafield.type = type;
          await metafield.save(
            {
              update: true,
            }
          );
          return metafield;
        } catch (err) {
          console.log("shopifyApiRest.shop.metafield.create_or_update.err: ", err);
          return null;
        }
      },
    }
  },
  product: {
    get: async (session, id) => {
      try {
        const response = await shopify.api.rest.Product.find(
          {
            session,
            id,
          }
        );
        return response;
      } catch (err) {
        console.log("shopifyApiRest.product.get.err: ", err);
        return null;
      }
    },
    metafield: {
      create: async (session, productId, namespace, key, value, type) => {
        try {
          const metafield = new shopify.api.rest.Metafield({session});
          metafield.product_id = typeof productId === "string" && productId.includes("gid://") ? productId.split("/").length && productId.split("/")[productId.split("/").length - 1] : productId;
          metafield.namespace = namespace;
          metafield.key = key;
          metafield.value = type === "json" ? JSON.stringify(value) : value;
          metafield.type = type;
          await metafield.save(
            {
              update: true,
            }
          );
          return metafield;
        } catch (err) {
          console.log("shopifyApiRest.product.metafield.create.err: ", err);
          return null;
        }
      },
      update: async (session, productId, id, value, type) => {
        try {
          const metafield = new shopify.api.rest.Metafield({session});
          metafield.product_id = typeof productId === "string" && productId.includes("gid://") ? productId.split("/").length && productId.split("/")[productId.split("/").length - 1] : productId;
          metafield.id = id;
          metafield.value = type === "json" ? JSON.stringify(value) : value;
          metafield.type = type;
          await metafield.save({
            update: true,
          });
          return metafield;
        } catch (err) {
          console.log("shopifyApiRest.product.metafield.update.err: ", err);
          return null;
        }
      },
      get: async (session, productId, id) => {
        try {
          const response = await shopify.api.rest.Metafield.find(
            {
              session,
              product_id: typeof productId === "string" && productId.includes("gid://") ? productId.split("/").length && productId.split("/")[productId.split("/").length - 1] : productId,
              id,
            }
          );
          return response;
        } catch (err) {
          console.log("shopifyApiRest.product.metafield.get.err: ", err);
          return null;
        }
      },
      delete: async (session, productId, id) => {
        try {
          await shopify.api.rest.Metafield.delete(
            {
              session,
              product_id: typeof productId === "string" && productId.includes("gid://") ? productId.split("/").length && productId.split("/")[productId.split("/").length - 1] : productId,
              id,
            }
          );
          return true;
        } catch (err) {
          console.log("shopifyApiRest.product.metafield.delete.err: ", err);
          return null;
        }
      },
    },
  },
  customer: {
    metafield: {
      create_or_update: async (session, customerId, namespace, key, value, type) => {
        try {
          const metafield = new shopify.api.rest.Metafield({session});
          metafield.customer_id = typeof customerId === "string" && customerId.includes("gid://") ? customerId.split("/").length && customerId.split("/")[customerId.split("/").length - 1] : customerId;
          metafield.namespace = namespace;
          metafield.key = key;
          metafield.value = type === "json" ? JSON.stringify(value) : value;
          metafield.type = type;
          await metafield.save(
            {
              update: true,
            }
          );
          return metafield;
        } catch (err) {
          console.log("shopifyApiRest.customer.metafield.create_or_update.err: ", err);
          return null;
        }
      },
    },
  },
  // not used in project, can be necessary for the furter development, leaving here
  createPriceRule: async (session, customerId, productId) => {
    try {
      const price_rule = new shopify.api.rest.PriceRule({session});
      price_rule.title = "BuyProduct[7489095598319]WithRewardPoints";
      price_rule.value_type = "percentage";
      price_rule.value = "-100.0";
      price_rule.customer_selection = "prerequisite";
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
  // end of not used in project, can be necessary for the furter development, leaving here
}

export { shopifyApiRest }
