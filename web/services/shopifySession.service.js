import { shopifySessionModel } from "../models/map.js";

const find = async (filter, projection, options) => {
  try {
    const res = await shopifySessionModel.find(filter, projection, options);
    return res;
  } catch (err) {
    return {
      error: true,
      message: 'Error while finding Shopify session. Original err.message: ' + err.message,
    };
  }
}

const shopifySessionService = {
  find,
}

export { shopifySessionService }
