import { orderModel, configurationModel } from "../models/map.js";
import { shopifySessionService, shopifyApiRest } from "./map.js";

const getCalculatedPoints = (multiplier, shopifyQuantity, shopifyPrice) => {
  const calculatedPoints = multiplier * shopifyQuantity * shopifyPrice;
  return calculatedPoints;
}

const getCalculatedOrderPoints = async (transformedShopifyLineItemsData) => {
  let calculatedPoints = 0;
  for (const transformedShopifyLineItemData of transformedShopifyLineItemsData) {
    calculatedPoints += transformedShopifyLineItemData.points;
  }
  return calculatedPoints;
}

const getCalculatedLineItemPoints = async (shopifySession, configuration, shopifyCustomerId, shopifyProductId, shopifyVariantId, shopifyQuantity, shopifyPrice, isShopifyLineItemPurchasedWithPoints) => {
  const shopifyProduct = await shopifyApiRest.product.get(shopifySession, shopifyProductId);
  const isShopifyProductfound = shopifyProduct && Array.isArray(shopifyProduct.variants);
  if (isShopifyLineItemPurchasedWithPoints && isShopifyProductfound) {
    let getRewardProductConfiguration = configuration.reward_products.filter((rewardProduct) => rewardProduct.shopify_product_id == shopifyProductId);
    let isRewardProductConfigurationFound = getRewardProductConfiguration.length;
    if (!isRewardProductConfigurationFound) {
      console.log('Unexpected error: The product not found in internal mongoDB database as reward product, but seems it has been purchased with points, possible reason is configuration was changed pararelly with the current order so continuing logic as reward product and minus customer reward points.');
    }

    let rewardProductConfiguration = isRewardProductConfigurationFound ? getRewardProductConfiguration[0] : null;
    let pointsPriceFromConfiguration = isRewardProductConfigurationFound ? rewardProductConfiguration.points_price : null;
    let shopifyMetafieldIdFromConfiguration = isRewardProductConfigurationFound ? rewardProductConfiguration.shopify_metafield.id : null;

    let getRewardProductConfigurationFromShopifyProductMetafield = await shopifyApiRest.product.metafield.get(shopifySession, shopifyProductId, shopifyMetafieldIdFromConfiguration);
    // debugger
    console.log("getRewardProductConfigurationFromShopifyProductMetafield: ", getRewardProductConfigurationFromShopifyProductMetafield);
    let isRewardProductConfigurationFromShopifyProductMetafieldFound = getRewardProductConfigurationFromShopifyProductMetafield && getRewardProductConfigurationFromShopifyProductMetafield.id;
    if (!isRewardProductConfigurationFromShopifyProductMetafieldFound) {
      console.log('Unexpected error: The product not found in Shopify as reward product, but seems it has been purchased with points, possible reason is configuration was changed pararelly with the current order or the product metafield has been changed manually so continuing logic as reward product and minus customer reward points.');
    }

    let rewardProductConfigurationFromShopifyProductMetafield = null;
    try {
      rewardProductConfigurationFromShopifyProductMetafield = JSON.parse(getRewardProductConfigurationFromShopifyProductMetafield);
    } catch (err) {
      console.log('Unexpected error: Can not parse rewardProductConfigurationFromShopifyProductMetafield');
    }

    if (rewardProductConfigurationFromShopifyProductMetafield?.points_price != pointsPriceFromConfiguration) {
      console.log('Unexpected error: rewardProductConfiguration points prices are not equal when comparing internal mongo db info with info from shopify, possible reason is metafield has been changed manually.');
    }

    let pointsPrice = pointsPriceFromConfiguration || rewardProductConfigurationFromShopifyProductMetafield?.points_price;

    // can be improvement, can be done later. When rewardProductConfiguration found but not on Shopify metafield, then we can update the metafield with rewardProductConfiguration values is it exists, because seems the metafield has been changed manually.

    if (!pointsPrice) {
      console.log('Unexpected error: pointsPrice not found');
      return 0;
    }

    let calculatedPointsPrice = -(pointsPrice * shopifyQuantity);
    return calculatedPointsPrice;
  }

  const getShopifyVariant = isShopifyProductfound ? shopifyProduct.variants.filter((variant) => variant.id === shopifyVariantId) : null;
  const isShopifyVariantFound = getShopifyVariant.length;
  const shopifyVariant = isShopifyVariantFound ? getShopifyVariant[0] : null;
  const isPreSale = isShopifyVariantFound ? (
      shopifyVariant.inventory_quantity < 1 && shopifyVariant.inventory_policy === 'continue' ||
      shopifyVariant.inventory_quantity > 0 && shopifyProduct.tags.includes('bn_pre_important')
    ) : false;
  const isGiftCard = isShopifyProductfound ? shopifyProduct.product_type === 'Gift Cards' : false;

  const currentDate = new Date();

  const getShopifyCustomerPoints = configuration.customers_points.filter((customerPoints) => customerPoints.shopify_customer_id == shopifyCustomerId);
  const getShopifyProductPoints = configuration.products_points.filter((productPoints) => productPoints.shopify_product_id == shopifyProductId);
  const getDatesPoints = configuration.dates_points.filter((datePoints) => currentDate > datePoints.from && currentDate < datePoints.to);
  // debugger
  console.log('getDatesPoints: ', getDatesPoints);
  const defaultPoints = configuration.default_points;
  const shopifyCustomerPoints = getShopifyCustomerPoints.length ? getShopifyCustomerPoints[0].points : 0;
  const shopifyProductPoints = getShopifyProductPoints.length ? getShopifyProductPoints[0].points : 0;
  const datePoints = getDatesPoints.length ? getDatesPoints[0].points : 0;
  const preSaleProductsPoints = isPreSale ? configuration.pre_sale_products_points : 0;
  const giftCardProductsPoints = isGiftCard ? configuration.gift_card_products_points : 0;

  const allLevelsPoints = [defaultPoints, shopifyCustomerPoints, shopifyProductPoints, datePoints, preSaleProductsPoints, giftCardProductsPoints];
  const multiplier = Math.max(...allLevelsPoints);

  const calculatedPoints = getCalculatedPoints(multiplier, shopifyQuantity, shopifyPrice);
  return calculatedPoints;
}

const getTransformedShopifyLineItemsData = async (shopifySession, configuration, shopifyCustomerId, shopifyLineItems) => {
  const isShopifyLineItemsDataValid = Array.isArray(shopifyLineItems) && shopifyLineItems.length;
  if (!isShopifyLineItemsDataValid) return null;

  let transformedShopifyLineItems = [];

  let isShopifyLineItemDataValid, isShopifyLineItemPurchasedWithPoints, transformedShopifyLineItem, calculatedLineItemPoints;
  for (const shopifyLineItem of shopifyLineItems) {
    isShopifyLineItemDataValid = shopifyLineItem.shopify_product_id &&
      shopifyLineItem.shopify_variant_id &&
      shopifyLineItem.shopify_quantity &&
      shopifyLineItem.shopify_price;

    if (!isShopifyLineItemDataValid) continue;

    isShopifyLineItemDataValid = false;
    isShopifyLineItemPurchasedWithPoints = Array.isArray(shopifyLineItem.shopify_properties) &&
      shopifyLineItem.shopify_properties.length &&
      // to do, shopifyProperty not using need to review and exclude
      shopifyLineItem.shopify_properties.filter((shopifyProperty) => shopifyProperty.name === "Buy with" && shopifyProperty.value === "points") &&
      Array.isArray(shopifyLineItem.shopify_discount_allocations) &&
      shopifyLineItem.shopify_discount_allocations.length &&
      shopifyLineItem.shopify_discount_allocations.filter((discountAllocation) => discountAllocation.amount - shopifyLineItem.shopify_quantity * shopifyLineItem.shopify_price === 0).length;
    transformedShopifyLineItem = {};

    calculatedLineItemPoints = await getCalculatedLineItemPoints(shopifySession, configuration, shopifyCustomerId, shopifyLineItem.shopify_product_id, shopifyLineItem.shopify_variant_id, shopifyLineItem.shopify_quantity, shopifyLineItem.shopify_price, isShopifyLineItemPurchasedWithPoints);

    transformedShopifyLineItem.shopify_product_id = shopifyLineItem.shopify_product_id;
    transformedShopifyLineItem.shopify_variant_id = shopifyLineItem.shopify_variant_id;
    transformedShopifyLineItem.shopify_quantity = shopifyLineItem.shopify_quantity;
    transformedShopifyLineItem.shopify_price = shopifyLineItem.shopify_price;
    transformedShopifyLineItem.points = calculatedLineItemPoints;

    transformedShopifyLineItems = [...transformedShopifyLineItems, transformedShopifyLineItem];
  }

  return transformedShopifyLineItems.length ? transformedShopifyLineItems : null;
}

const getTransformedOrderData = async (shopifySession, documents) => {
  const isDocumentsDataValid = Array.isArray(documents) && documents.length && documents[0];
  if (!isDocumentsDataValid) return null;

  const getConfiguration = await configurationModel.find(
    {
      shopify_session: shopifySession._id,
    }
  );
  if (getConfiguration.error) return null;
  const configuration = getConfiguration[0];

  let transformedData = [];

  let isDocumentDataValid, doc, transformedShopifyLineItemsData, calculatedOrderPoints;
  for (const item of documents) {
    isDocumentDataValid = typeof item === 'object' &&
      (
        item.shopify_webhook_id ||
        item.shopify_order_id ||
        item.shopify_customer_id ||
        item.shopify_line_items ||
        item.shopify_total_line_items_price ||
        item.shopify_order_number
      );
    
    if (!isDocumentDataValid) continue;

    doc = {};

    transformedShopifyLineItemsData = await getTransformedShopifyLineItemsData(shopifySession, configuration, item.shopify_customer_id, item.shopify_line_items);
    calculatedOrderPoints = await getCalculatedOrderPoints(transformedShopifyLineItemsData);

    doc.shopify_session = shopifySession._id;
    if (item.shopify_webhook_id) doc.shopify_webhook_id = item.shopify_webhook_id;
    if (item.shopify_order_id) doc.shopify_order_id = item.shopify_order_id;
    if (item.shopify_customer_id) doc.shopify_customer_id = item.shopify_customer_id;
    if (transformedShopifyLineItemsData) doc.shopify_line_items = transformedShopifyLineItemsData;
    if (item.shopify_total_line_items_price) doc.shopify_total_line_items_price = item.shopify_total_line_items_price;
    if (item.shopify_order_number) doc.shopify_order_number = item.shopify_order_number;
    if (calculatedOrderPoints) doc.points = calculatedOrderPoints;

    transformedData = [...transformedData, doc];
  }

  return transformedData.length ? transformedData : null;
}

const getCustomerPointsBalance = async (shopify_session__id, shopify_customer_id) => {
  const response = await aggregate(
    [
      {
        $match: {
          shopify_session: shopify_session__id,
          shopify_customer_id: shopify_customer_id,
        }
      },
      {
        $group: {
          _id: null,
          points_balance: {
            $sum: "$points"
          }
        }
      }
    ]
  );

  const pointsBalance = response?.points_balance?.[0]?.points_balance || 0;
  return pointsBalance;
}

const create = async (shop, documents) => {
  const getShopifySession = await shopifySessionService.find(
    {
      shop: shop,
    }
  );
  if (getShopifySession.error) {
    return {
      error: true,
      message: `Error while creating Order, Shopify session not found for shop: ${shop}`,
    };
  }
  const shopifySession = getShopifySession[0];

  const transformedOrderData = await getTransformedOrderData(shopifySession, documents);
  // debugger
  console.log('transformedOrderData: ', transformedOrderData);

  if (!transformedOrderData) {
    return {
      error: true,
      message: 'Error while creating Order, the provided data is not correct.',
    };
  }

  try {
    const res = await orderModel.create(transformedOrderData);
    // update customer balance
    for (const order of transformedOrderData) {
      const customerPointsBalance = await getCustomerPointsBalance(shopifySession._id, order.shopify_customer_id);
      const createOrUpdateShopifyCustomerMetafieldResponse = await shopifyApiRest.customer.metafield.create_or_update(shopifySession, order.shopify_customer_id, "loyalty_program", "reward_points", customerPointsBalance, "number_decimal");
      // debugger
      console.log("createOrUpdateShopifyCustomerMetafieldResponse:", createOrUpdateShopifyCustomerMetafieldResponse);
    }

    return res;
  } catch (err) {
    return {
      error: true,
      message: 'Error while creating Order. Original err.message: ' + err.message,
    };
  }
}

const find = async (filter, projection, options) => {
  try {
    const res = await orderModel.find(filter, projection, options);
    return res;
  } catch (err) {
    return {
      error: true,
      message: 'Error while finding Order. Original err.message: ' + err.message,
    };
  }
}

const aggregate = async (pipeline) => {
  try {
    const res = await orderModel.aggregate(pipeline);
    return res;
  } catch (err) {
    return {
      error: true,
      message: 'Error while aggregate Order. Original err.message: ' + err.message,
    };
  }
}

const orderService = {
  create,
  find,
  getCustomerPointsBalance,
}

export { orderService }
