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
  const [shopifyCustomers, setShopifyCustomers] = useState(null);
  const [sinceId, setSinceId] = useState(0);
  const [limit, setLimit] = useState(0);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(customerPoints);
  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();

  const {
    getShopifyCustomers,
    refetch: refetchShopifyCustomers,
    isLoading: isLoadingShopifyCustomers,
    isRefetching: isRefetchingShopifyCustomers,
  } = useAppQuery({
    url: "/api/internal/v1/shopify/customers/" + sinceId + "/" + limit,
    reactQueryOptions: {
      onSuccess: () => {
        // debugger
        console.log("getShopifyCustomers:", getShopifyCustomers);
        setSinceId(getShopifyCustomers[getShopifyCustomers.length - 1]?.id);
        setIsLoading(false);
      },
    },
  });

  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body;
        // debugger
        // console.log("parsedBody: ", parsedBody);
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
  const handleCustomerChange = useCallback(({ selection }) => {
    setSelectedCustomer({
      shopify_customer_first_name: selection[0].first_name,
      shopify_customer_last_name: selection[0].last_name,
      shopify_customer_email: selection[0].email,
    });
    shopifyCustomerId.onChange(selection[0].id);
    shopifyCustomerFirstName.onChange(selection[0].first_name);
    shopifyCustomerLastName.onChange(selection[0].last_name);
    shopifyCustomerEmail.onChange(selection[0].email);
    setShowResourcePicker(false);
  }, []);


  /*
    This function is called when a user clicks "Select customer" or cancels the CustomerPicker.

    It switches between a show and hide state.
  */
  const toggleResourcePicker = useCallback(
    () => {
      if (showResourcePicker) {
        // const getShopifyCustomers = 
        // setShopifyCustomers(Array.isArray(getShopifyCustomers) || null);
      }
      setShowResourcePicker(!showResourcePicker)
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
                      // resourceType="Product"
                      // showVariants={false}
                      // selectMultiple={false}
                      // onCancel={toggleResourcePicker}
                      // onSelection={handleCustomerChange}
                      // open
                      open
                      items={shopifyCustomers || []}
                      // selectedItems={/* selected items */}
                      // title="Resource Picker"
                      // searchQueryPlaceholder="Search Resource"
                      // primaryActionLabel="Select"
                      // secondaryActionLabel="Cancel"
                      emptySearchLabel={
                        {
                          title: 'No resources',
                          description: 'There are no resources to display',
                          withIllustration: true,
                        }
                      }
                      onCancel={toggleResourcePicker}
                      onSelect={handleCustomerChange}
                      // onSearch={/* search even handler */}
                      // onLoadMore={/* load more even handler */}

                      maxSelectable={1}
                    />
                  )}
                  {shopifyCustomerId.value ? (
                    <Stack alignment="center">
                      <TextStyle variation="strong">
                        {selectedCustomer?.shopify_customer_first_name}
                      </TextStyle>
                      <TextStyle variation="strong">
                        {selectedCustomer?.shopify_customer_last_name}
                      </TextStyle>
                      <TextStyle variation="strong">
                        {selectedCustomer?.shopify_customer_email}
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
              <Card sectioned title="Product money price $1 = [x] points price multiplier for selected customer">
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
