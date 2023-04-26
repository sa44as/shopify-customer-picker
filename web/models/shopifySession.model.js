import {Schema, model} from "mongoose";

const shopifySesssionsSchema = new Schema(
  {
    name: {
      type: String,
      required: true
    },  
    id: {
      type: String,
      required: true,
    },
    shop: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    isOnline: {
      type: Boolean,
      required: true,
    },
    scope: {
      type: String,
      required: true,
    },
    accessToken: {
      type: String,
      required: true,
    }
  },
  { timestamps: true }
);

const shopifySessionModel = model("shopify_session", shopifySesssionsSchema);

export { shopifySessionModel }
