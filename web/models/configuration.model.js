import {Schema, model} from "mongoose";

const configurationValidation = {
  reward_products: {
    points_price: {
      min: [
        1,
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
          unique: true,
        },
        shopify_product_title: {
          type: String,
          required: true,
        },
        shopify_product_image_url: {
          type: String,
        },
        points_price: {
          type: Number,
          required: true,
          min: configurationValidation.reward_products.points_price.min,
        },
        // sell_with_money currently is not using, but can be necessary in the future
        sell_with_money: {
          type: Boolean,
          required: true,
          default: false,
        },
        shopify_metafield: {
          type: Object,
          required: true,
        },
      }
    ],
    default_points: {
      type: Number,
      required: true,
      min: configurationValidation.reward_products.points_price.min,
      default: 1,
    },
    products_points: [
      {
        shopify_product_id: {
          type: String,
          required: true,
          // unique: true,
        },
        shopify_product_title: {
          type: String,
          required: true,
        },
        shopify_product_image_url: {
          type: String,
        },
        points: {
          type: Number,
          required: true,
          min: configurationValidation.reward_products.points_price.min,
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
          min: configurationValidation.reward_products.points_price.min,
        },
        shopify_customer_email: {
          type: String,
        },
        shopify_customer_first_name: {
          type: String,
        },
        shopify_customer_last_name: {
          type: String,
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
          min: configurationValidation.reward_products.points_price.min,
        },
      }
    ],
    pre_sale_products_points: {
      type: Number,
      required: true,
      min: configurationValidation.reward_products.points_price.min,
      default: 1,
    },
    gift_card_products_points: {
      type: Number,
      required: true,
      min: configurationValidation.reward_products.points_price.min,
      default: 1,
    },
  },
  { timestamps: true }
);

const configurationModel = model("configuration", configurationSchema);

export { configurationModel }
