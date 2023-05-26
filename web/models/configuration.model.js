import {Schema, model} from "mongoose";

const configurationValidation = {
  reward_products: {
    points_price: {
      min: [
        10,
        'The value of path `{PATH}` ({VALUE}) is beneath the limit ({MIN}).'
      ],
    },
  },
}

const configurationSchema = new Schema(
  {
    shopify_session: {
      type: Schema.Types.ObjectId,
      required: true,
      unique: true,
      ref: 'shopify_sessions',
    },
    shop: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    reward_products: [
      {
        shopify_product_id: {
          type: String,
          required: true,
        },
        points_price: {
          type: Number,
          required: true,
          min: configurationValidation.reward_products.points_price.min,
        },
        sell_with_money: {
          type: Boolean,
          required: true,
          default: false,
        },
        shopify_metafield_id: {
          type: String,
          required: true,
        },
      }
    ],
    default_points: {
      type: Number,
      required: true,
      default: 1,
    },
    products_points: [
      {
        shopify_product_id: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          required: true,
          default: 1,
        },
      }
    ],
    customers_points: [
      {
        shopify_customer_id: {
          type: String,
          required: true,
        },
        points: {
          type: Number,
          required: true,
          default: 1,
        },
      }
    ],
    dates_points: [
      {
        from: {
          type: Date,
          required: true,
        },
        to: {
          type: Date,
          required: true,
        },
        points: {
          type: Number,
          required: true,
          default: 1,
        },
      }
    ],
    pre_sale_products_points: {
      type: Number,
      required: true,
      default: 1,
    },
    gift_card_products_points: {
      type: Number,
      required: true,
      default: 1,
    },
  },
  { timestamps: true }
);

const configurationModel = model("configuration", configurationSchema);

export { configurationModel }
