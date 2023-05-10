import { orderModel, configurationModel } from "../models/map.js";
import { shopifySessionService } from "./map.js";

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

const getCalculatedLineItemPoints = async (configuration, shopifyCustomerId, shopifyProductId, shopifyQuantity, shopifyPrice) => {
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

  const allLevelsPoints = [defaultPoints, shopifyCustomerPoints, shopifyProductPoints, datePoints];
  const multiplier = Math.max(...allLevelsPoints);

  const calculatedPoints = getCalculatedPoints(multiplier, shopifyQuantity, shopifyPrice);
  return calculatedPoints;
}

const getTransformedShopifyLineItemsData = async (configuration, shopifyCustomerId, shopifyLineItems) => {
  const isShopifyLineItemsDataValid = Array.isArray(shopifyLineItems) && shopifyLineItems.length;
  if (!isShopifyLineItemsDataValid) return null;

  let transformedShopifyLineItems = [];

  let isShopifyLineItemDataValid, transformedShopifyLineItem, calculatedLineItemPoints;
  for (const shopifyLineItem of shopifyLineItems) {
    isShopifyLineItemDataValid = shopifyLineItem.shopify_product_id &&
      shopifyLineItem.shopify_variant_id &&
      shopifyLineItem.shopify_quantity &&
      shopifyLineItem.shopify_price;

    if (!isShopifyLineItemDataValid) continue;

    isShopifyLineItemDataValid = false;
    transformedShopifyLineItem = {};

    calculatedLineItemPoints = await getCalculatedLineItemPoints(configuration, shopifyCustomerId, shopifyLineItem.shopify_product_id, shopifyLineItem.shopify_quantity, shopifyLineItem.shopify_price);

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

    transformedShopifyLineItemsData = await getTransformedShopifyLineItemsData(configuration, item.shopify_customer_id, item.shopify_line_items);
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
  console.log('transformedOrderData: ', transformedOrderData);
  if (!transformedOrderData) {
    return {
      error: true,
      message: 'Error while creating Order, the provided data is not correct.',
    };
  }

  try {
    const res = await orderModel.create(transformedOrderData);
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

const orderService = {
  create,
  find,
}

export { orderService }
