import { useState, useCallback } from "react";
import {
  Card,
  Stack,
  Layout,
} from "@shopify/polaris";
import {
  unstable_Picker as ResourcePicker,
} from "@shopify/app-bridge-react";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch } from "../hooks";

export function CustomerPicker() {
  const [loading, setLoading] = useState(false);
  const [shopifyCustomers, setShopifyCustomers] = useState([]);
  const [first, setFirst] = useState(50);
  const [query, setQuery] = useState("state:'ENABLED'");
  const [after, setAfter] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetch = useAuthenticatedFetch();

  /*
    This function is called with the selected customer whenever the user clicks "Add" in the ResourcePicker.

    It takes the first item in the selection array and sets the selected customer to an object with the properties from the "selection" argument.

    It updates the form state using the "onChange" methods attached to the form fields.

    Finally, closes the ResourcePicker.
  */
  const handleCustomerChange = useCallback((selection) => {
    const customerId = selection.selectedItems[0].id;
    const customer = shopifyCustomers.filter((customer) => customer.id === customerId)[0];
    setSelectedCustomer({
      shopify_customer_id: customer.id,
      shopify_customer_first_name: customer.firstName,
      shopify_customer_last_name: customer.lastName,
      shopify_customer_email: customer.email,
    });
    setShowResourcePicker(false);
  }, [shopifyCustomers]);

  const handleCustomerSearch = useCallback(async (searchPayload) => {
    if (loading) return;
    setLoading(true);
    const newQuery = "state:'ENABLED'" + (searchPayload.searchQuery ? " AND email:" + searchPayload.searchQuery + "*" : "");
    setQuery(newQuery);
    const response = await fetch("/api/internal/v1/shopify/customers/" + first + "/" + newQuery + "/" + after);
    const getShopifyCustomers = await response.json();

    const customers = Array.isArray(getShopifyCustomers?.customers?.edges) ? getShopifyCustomers.customers.edges.map((customer) => (
      {
        id: customer.node.id,
        name: "Email: " + customer.node.email + " Name: " + (customer.node.firstName || "") + " " + (customer.node.lastName || ""),
        email: customer.node.email,
        firstName: customer.node.firstName,
        lastName: customer.node.lastName,
      }
    )) : [loading];

    setShopifyCustomers(customers);
    setAfter(getShopifyCustomers.customers.pageInfo.endCursor);
    setHasNextPage(getShopifyCustomers.customers.pageInfo.hasNextPage);
    setLoading(false);
  }, []);

  const loadMoreCustomers = useCallback(async () => {
    if (!hasNextPage || loading) return;
    setLoading(true);
    const response = await fetch("/api/internal/v1/shopify/customers/" + first + "/" + query + "/" + after);
    const getShopifyCustomers = await response.json();

    const customers = Array.isArray(getShopifyCustomers?.customers?.edges) ? getShopifyCustomers.customers.edges.map((customer) => (
      {
        id: customer.node.id,
        name: "Email: " + customer.node.email + " Name: " + (customer.node.firstName || "") + " " + (customer.node.lastName || ""),
        email: customer.node.email,
        firstName: customer.node.firstName,
        lastName: customer.node.lastName,
      }
    )) : [];

    setShopifyCustomers([...shopifyCustomers, ...customers]);
    setAfter(getShopifyCustomers.customers.pageInfo.endCursor);
    setHasNextPage(getShopifyCustomers.customers.pageInfo.hasNextPage);
    setLoading(false);
  }, [hasNextPage, loading, after, shopifyCustomers, query]);

  /*
    This function is called when a user clicks "Select customer" or cancels the CustomerPicker.

    It switches between a show and hide state.
  */
  const toggleResourcePicker = useCallback(
    async () => {
      setShowResourcePicker(!showResourcePicker);
      setLoading(true);
      if (!showResourcePicker) {
        setQuery("state:'ENABLED'");
        setAfter(0);
        const response = await fetch("/api/internal/v1/shopify/customers/" + first + "/state:'ENABLED'/0");
        const getShopifyCustomers = await response.json();

        const customers = Array.isArray(getShopifyCustomers?.customers?.edges) ? getShopifyCustomers.customers.edges.map((customer) => (
          {
            id: customer.node.id,
            name: "Email: " + customer.node.email + " Name: " + (customer.node.firstName || "") + " " + (customer.node.lastName || ""),
            email: customer.node.email,
            firstName: customer.node.firstName,
            lastName: customer.node.lastName,
          }
        )) : [];

        setShopifyCustomers(customers);
        setAfter(getShopifyCustomers.customers.pageInfo.endCursor);
        setHasNextPage(getShopifyCustomers.customers.pageInfo.hasNextPage);
        setLoading(false);
      }
    },
    [showResourcePicker]
  );

  /* The form layout, created using Polaris and App Bridge components. */
  return (
    <Stack vertical>
      <Layout>
        <Layout.Section>
          <Card
            title="Customer"
            actions={
              selectedCustomer?.shopify_customer_id ? null :
              [
                {
                  content: shopifyCustomerId.value
                    ? "Change customer"
                    : "Select customer",
                  onAction: toggleResourcePicker,
                },
              ]
            }
          >
            <Card.Section>
              {showResourcePicker && (
                <ResourcePicker
                  open
                  items={shopifyCustomers || []}
                  title="Select Customer"
                  searchQueryPlaceholder="Search Customer by Email address"
                  emptySearchLabel={
                    {
                      title: 'Customer not found',
                      description: 'There are no customer to display',
                      withIllustration: true,
                    }
                  }
                  onCancel={toggleResourcePicker}
                  onSelect={(selectPayload) => handleCustomerChange(selectPayload)}
                  onSearch={(searchPayload) => handleCustomerSearch(searchPayload)}
                  onLoadMore={loadMoreCustomers}
                  maxSelectable={1}
                  canLoadMore={hasNextPage}
                  loading={loading}
                />
              )}
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Stack>
  );
}
