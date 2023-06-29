import { useState, useCallback } from "react";
import {
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  Thumbnail,
  Icon,
  Stack,
  TextStyle,
  Layout,
} from "@shopify/polaris";
import {
  ContextualSaveBar,
  unstable_Picker as ResourcePicker,
  useAppBridge,
  useNavigate,
} from "@shopify/app-bridge-react";
import { AlertMinor } from "@shopify/polaris-icons";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField, notEmptyString, positiveIntegerString } from "@shopify/react-form";

export function CustomerPointsForm({ customerPoints: InitialCustomerPoints }) {
  const [customerPoints, setCustomerPoints] = useState(InitialCustomerPoints);
  const [loading, setLoading] = useState(false);
  const [shopifyCustomers, setShopifyCustomers] = useState([]);
  const [first, setFirst] = useState(10);
  const [query, setQuery] = useState("state:'ENABLED'");
  const [after, setAfter] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customerPoints);

  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();

  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body;
        const customerPointsId = customerPoints && customerPoints.shopify_customer_id.includes("gid://") ? customerPoints.shopify_customer_id.split("/").length && customerPoints.shopify_customer_id.split("/")[customerPoints.shopify_customer_id.split("/").length - 1] : customerPoints?.shopify_customer_id;
        /* construct the appropriate URL to send the API request to based on whether the Customer points multiplier is new or being updated */
        const url = customerPointsId ? `/api/internal/v1/configuration/customer_points/${customerPointsId}` : "/api/internal/v1/configuration/customer_points";
        /* a condition to select the appropriate HTTP method: PATCH to update a Customer points multiplier or POST to create a new Customer points multiplier */
        const method = customerPointsId ? "PATCH" : "POST";
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(url, {
          method,
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          makeClean();
          const getCustomerPoints = await response.json();
          const customerId = getCustomerPoints.customer_points.shopify_customer_id.includes("gid://") ? getCustomerPoints.customer_points.shopify_customer_id.split("/").length && getCustomerPoints.customer_points.shopify_customer_id.split("/")[getCustomerPoints.customer_points.shopify_customer_id.split("/").length - 1] : getCustomerPoints.customer_points.shopify_customer_id;
          /* if this is a new Customer points multiplier, then save the Customer points multiplier and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
          if (!customerPointsId) {
            navigate(`/customers_points/${customerId}`);
            /* if this is a Customer points multiplier update, update the Customer points multiplier state in this component */
          } else {
            setCustomerPoints(getCustomerPoints.customer_points);
          }
        } else if (response.status === 409) {
          makeClean();
          const errResponse = await response.json();
          if (errResponse?.error?.message) {
            alert(errResponse.error.message);
          }
        }
      })();
      return { status: "success" };
    },
    [customerPoints, setCustomerPoints]
  );


  /*
    Sets up the form state with the useForm hook.

    Accepts a "fields" object that sets up each individual field with a default value and validation rules.

    Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.

    Returns helpers to manage form state, as well as component state that is based on form state.
  */
  const {
    fields: {
      shopifyCustomerId,
      points,
      shopifyCustomerFirstName,
      shopifyCustomerLastName,
      shopifyCustomerEmail,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      shopifyCustomerId: useField({
        value: customerPoints?.shopify_customer_id || "",
        validates: [notEmptyString("Please select a customer")],
      }),
      points: useField({
        value: customerPoints?.points || "",
        validates: [notEmptyString("Please give points price multiplier your customer"), positiveIntegerString("The points price multiplier can't accept the negative value")],
      }),
      shopifyCustomerFirstName: useField({
        value: customerPoints?.shopify_customer_first_name || "",
      }),
      shopifyCustomerLastName: useField({
        value: customerPoints?.shopify_customer_last_name || "",
      }),
      shopifyCustomerEmail: useField({
        value: customerPoints?.shopify_customer_email || "",
      }),
    },
    onSubmit,
  });

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
      shopify_customer_first_name: customer.firstName,
      shopify_customer_last_name: customer.lastName,
      shopify_customer_email: customer.email,
    });
    shopifyCustomerId.onChange(customer.id);
    shopifyCustomerFirstName.onChange(customer.firstName);
    shopifyCustomerLastName.onChange(customer.lastName);
    shopifyCustomerEmail.onChange(customer.email);
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

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteCustomerPoints = useCallback(async () => {
    reset();
    /* The isDeleting state disables the delete Customer points multiplier button to show the user that an action is in progress */
    setIsDeleting(true);
    const response = await fetch(`/api/internal/v1/configuration/customer_points/${customerPoints.shopify_customer_id.includes("gid://") ? customerPoints.shopify_customer_id.split("/").length && customerPoints.shopify_customer_id.split("/")[customerPoints.shopify_customer_id.split("/").length - 1] : customerPoints?.shopify_customer_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate(`/customers_points`);
    }
  }, [customerPoints]);

  /* The form layout, created using Polaris and App Bridge components. */
  return (
    <Stack vertical>
      <Layout>
        <Layout.Section>
          <Form>
            <ContextualSaveBar
              saveAction={{
                label: "Save",
                onAction: submit,
                loading: submitting,
                disabled: submitting,
              }}
              discardAction={{
                label: "Discard",
                onAction: reset,
                loading: submitting,
                disabled: submitting,
              }}
              visible={dirty}
              fullWidth
            />
            <FormLayout>
              <Card
                title="Customer"
                actions={
                  customerPoints?.shopify_customer_id ? null :
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
                  {shopifyCustomerId.value ? (
                    <Stack alignment="center">
                      <TextStyle variation="strong">
                        {selectedCustomer?.shopify_customer_email}
                      </TextStyle>
                      <TextStyle variation="strong">
                        {selectedCustomer?.shopify_customer_first_name}
                      </TextStyle>
                      <TextStyle variation="strong">
                        {selectedCustomer?.shopify_customer_last_name}
                      </TextStyle>
                    </Stack>
                  ) : (
                    <Stack vertical spacing="extraTight">
                      <Button onClick={toggleResourcePicker}>
                        Select customer
                      </Button>
                      {shopifyCustomerId.error && (
                        <Stack spacing="tight">
                          <Icon source={AlertMinor} color="critical" />
                          <TextStyle variation="negative">
                            {shopifyCustomerId.error}
                          </TextStyle>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Card.Section>
              </Card>
              <Card sectioned title="Purchased product money price $1 = [multiplier] points for the selected customer.">
                <TextField
                  {...points}
                  type="number"
                  label="Points price multiplier"
                  labelHidden
                  helpText="Give points price multiplier your customer"
                />
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section>
          {customerPoints?.shopify_customer_id && (
            <Button
              outline
              destructive
              onClick={deleteCustomerPoints}
              loading={isDeleting}
            >
              Delete Customer points multiplier
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Stack>
  );
}
