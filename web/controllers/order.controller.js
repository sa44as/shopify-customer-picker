import { orderService, shopifyApiRest } from "../services/map.js";
// to do, below all methods need to be reviewed, and changed as necessary, controller is not finilized
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
    console.log('req.shopifySession: ', req.shopifySession);
    const isProductAbleToBuyWithPoints = true; // to do, The necessary information are stored in Shopify Customer and Product metafields, but need to double check this information with internal mongoDB, because the metafield values can be changed manually, so if the values are incorrect here can be runned the metafields corrector function as well, that need to be created as well.
    if (!isProductAbleToBuyWithPoints) {
      return res.status(400).json(
        {
          error: {
            message: "The product is not allowed to buy with points.",
          },
        }
      );
    }

    const isUserPointsBalanceEnoughToBuyProduct = true; // to do, The necessary information are stored in Shopify Customer and Product metafields, but need to double check this information with internal mongoDB, because the metafield values can be changed manually, so if the values are incorrect here can be runned the metafields corrector function as well, that need to be created as well.
    if (!isUserPointsBalanceEnoughToBuyProduct) {
      return res.status(400).json(
        {
          error: {
            message: "The user points balance is not enough to buy the selected product.",
          },
        }
      );
    }

    /* createPriceRuleResponse, priceRules, createDiscountCode are not necessary for project logic, but leaving here with related shopifyApiRest service functions, can be used in the future for other logics of course if it will be necessary, because functionality for product-dicount are replaced with product-discount extension */
    // const createPriceRuleResponse = await shopifyApiRest.createPriceRule(req.shopifySession, req.params.shopify_customer_id, req.params.shopify_product_id);
    // if (createPriceRuleResponse === null) {
    //   return res.status(400).json(
    //     {
    //       error: {
    //         message: "Price Rule doesn't created",
    //       },
    //     }
    //   );
    // }

    // const priceRules = await shopifyApiRest.listPriceRules(req.shopifySession);
    // const isPriceRulesValid = priceRules && Array.isArray(priceRules) && priceRules.length;
    // if (!isPriceRulesValid) {
    //   return res.status(400).json(
    //     {
    //       error: {
    //         message: "Can't list Price Rules",
    //       },
    //     }
    //   );
    // }

    // const createDiscountCode = await shopifyApiRest.createDiscountCode(req.shopifySession, priceRules[0].id, priceRules[0].title);
    // if (createDiscountCode === null) {
    //   return res.status(400).json(
    //     {
    //       error: {
    //         message: "Discount Code doesn't created",
    //       },
    //     }
    //   );
    // }
    /* end of createPriceRuleResponse, priceRules, createDiscountCode are not necessary for project logic, but leaving here with related shopifyApiRest service functions, can be used in the future for other logics of course if it will be necessary, because functionality for product-dicount are replaced with product-discount extension */

    return res.status(200).json(
      {
        response: {
          message: "User can buy the product with points, continue adding product to the cart",
        },
      }
    );
  },
}

export { orderController }
