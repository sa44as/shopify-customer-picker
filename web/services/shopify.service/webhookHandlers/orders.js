import { DeliveryMethod } from "@shopify/shopify-api";
import { orderService } from "../../map.js";

const OrdersWebhookHandlers = {
  /**
   * Occurs whenever an order is paid.
   *
   * https://shopify.dev/docs/api/admin-rest/2023-01/resources/webhook#event-topics-orders-paid
   */
  ORDERS_PAID: {
    deliveryMethod: DeliveryMethod.Http,
    callbackUrl: "/api/webhooks",
    callback: async (topic, shop, body, webhookId) => {
      const payload = JSON.parse(body);

      const createOrder = async (shop, payload) => {
        const documents = [
          {
            shopify_webhook_id: webhookId,
            shopify_order_id: payload.id,
            shopify_customer_id: payload.customer.id,
            shopify_line_items: payload.line_items.map((line_item) => (
              {
                shopify_product_id: line_item.product_id,
                shopify_variant_id: line_item.variant_id,
                shopify_price: line_item.price,
              }
            )),
            shopify_total_line_items_price: payload.total_line_items_price,
            shopify_order_number: payload.order_number,
          },
        ];
  
        shop = "stax-app-development.myshopify.com"; // for test only, delete for production
        const response = await orderService.create(shop, documents);
        console.log('response: ', response);
      }
      createOrder(shop, payload);
    },
  },
}

export { OrdersWebhookHandlers }
