import { orderService, shopifyApiRest } from "../services/map.js";

const orderController = {
  find: async (req, res) => {
    const response = await orderService.find(
      {
        shopify_session: req.shopifySession._id,
        shopify_customer_id: req.params.shopify_customer_id,
      }
    );

    return res.json(
      {
        response: response,
      }
    ).status(200);
  },
  beforeAddToCart: async (req, res) => {
    const isProductAbleToBuyWithPoints = true; // to do
    if (!isProductAbleToBuyWithPoints) {
      return res.json(
        {
          error: {
            message: "The product is not allowed to buy with points.",
          },
        }
      ).status(400);
    }

    const isUserPointsBalanceEnoughToBuyProduct = true; // to do
    if (!isUserPointsBalanceEnoughToBuyProduct) {
      return res.json(
        {
          error: {
            message: "The user points balance is not enough to buy the selected product.",
          },
        }
      ).status(400);
    }

    const createPriceRuleResponse = await shopifyApiRest.createPriceRule(req.shopifySession, req.params.shopify_customer_id, req.params.shopify_product_id);
    if (createPriceRuleResponse === null) {
      return res.json(
        {
          error: {
            message: "Price Rule doesn't created",
          },
        }
      ).status(400);
    }

    const priceRules = await shopifyApiRest.listPriceRules(shopifySession);
    const isPriceRulesValid = priceRules && Array.isArray(priceRules) && priceRules.length;
    if (!isPriceRulesValid) {
      return res.json(
        {
          error: {
            message: "Can't list Price Rules",
          },
        }
      ).status(400);
    }

    const createDiscountCode = await shopifyApiRest.createDiscountCode(shopifySession, priceRules[0].id, priceRules[0].title);
    if (createDiscountCode === null) {
      return res.json(
        {
          error: {
            message: "Discount Code doesn't created",
          },
        }
      ).status(400);
    }

    return res.json(
      {
        response: {
          message: "User can buy the product with points, continue adding product to the cart",
        },
      }
    ).status(200);
  },
}

export { orderController }
