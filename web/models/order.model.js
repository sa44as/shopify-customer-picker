import {Schema, model} from "mongoose";

const orderSchema = new Schema(
  {
    shopify_session: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'shopify_sessions',
    },
    shopify_webhook_id: {
      type: String,
      required: true,
      unique: true,
    },
    shopify_order_id: {
      type: String,
      required: true,
      unique: true,
    },
    shopify_customer_id: {
      type: String,
      required: true,
    },
    shopify_line_items: [
      {
        shopify_product_id: {
          type: String,
          required: true,
        },
        shopify_variant_id: {
          type: String,
          required: true,
        },
        shopify_quantity: {
          type: String,
          required: true,
        },
        shopify_price: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          required: true,
        }
      }
    ],
    shopify_total_line_items_price: {
      type: String,
      required: true,
    },
    shopify_order_number: {
      type: String,
      required: true,
    },
    points: {
      type: Number,
      required: true,
    }
  },
  { timestamps: true }
);

const orderModel = model("order", orderSchema);

export { orderModel }
