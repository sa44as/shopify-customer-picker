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
  ResourcePicker,
  useAppBridge,
  useNavigate,
} from "@shopify/app-bridge-react";
import { ImageMajor, AlertMinor } from "@shopify/polaris-icons";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField, notEmptyString, positiveIntegerString } from "@shopify/react-form";

export function ProductPointsForm({ productPoints: InitialProductPoints }) {
  const [productPoints, setProductPoints] = useState(InitialProductPoints);
  const [showResourcePicker, setShowResourcePicker] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(productPoints);
  const navigate = useNavigate();
  const appBridge = useAppBridge();
  const fetch = useAuthenticatedFetch();

  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body;
        // debugger
        // console.log("parsedBody: ", parsedBody);
        const productPointsId = productPoints && productPoints.shopify_product_id.includes("gid://") ? productPoints.shopify_product_id.split("/").length && productPoints.shopify_product_id.split("/")[productPoints.shopify_product_id.split("/").length - 1] : productPoints?.shopify_product_id;
        /* construct the appropriate URL to send the API request to based on whether the Product points multiplier is new or being updated */
        const url = productPointsId ? `/api/internal/v1/configuration/product_points/${productPointsId}` : "/api/internal/v1/configuration/product_points";
        /* a condition to select the appropriate HTTP method: PATCH to update a Product points multiplier or POST to create a new Product points multiplier */
        const method = productPointsId ? "PATCH" : "POST";
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(url, {
          method,
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          makeClean();
          const getProductPoints = await response.json();
          const productId = getProductPoints.product_points.shopify_product_id.includes("gid://") ? getProductPoints.product_points.shopify_product_id.split("/").length && getProductPoints.product_points.shopify_product_id.split("/")[getProductPoints.product_points.shopify_product_id.split("/").length - 1] : getProductPoints.product_points.shopify_product_id;
          /* if this is a new Product points multiplier, then save the Product points multiplier and navigate to the edit page; this behavior is the standard when saving resources in the Shopify admin */
          if (!productPointsId) {
            navigate(`/products_points/${productId}`);
            /* if this is a Product points multiplier update, update the Product points multiplier state in this component */
          } else {
            setProductPoints(getProductPoints.product_points);
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
    [productPoints, setProductPoints]
  );


  /*
    Sets up the form state with the useForm hook.

    Accepts a "fields" object that sets up each individual field with a default value and validation rules.

    Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.

    Returns helpers to manage form state, as well as component state that is based on form state.
  */
  const {
    fields: {
      shopifyProductId,
      points,
      shopifyProductTitle,
      shopifyProductImageUrl,
    },
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      shopifyProductId: useField({
        value: productPoints?.shopify_product_id || "",
        validates: [notEmptyString("Please select a product")],
      }),
      points: useField({
        value: productPoints?.points || "",
        validates: [notEmptyString("Please give points price multiplier your product"), positiveIntegerString("The points price multiplier can't accept the negative value")],
      }),
      shopifyProductTitle: useField({
        value: productPoints?.shopify_product_title || "",
      }),
      shopifyProductImageUrl: useField({
        value: productPoints?.shopify_product_image_url || "",
      }),
    },
    onSubmit,
  });

  /*
    This function is called with the selected product whenever the user clicks "Add" in the ResourcePicker.

    It takes the first item in the selection array and sets the selected product to an object with the properties from the "selection" argument.

    It updates the form state using the "onChange" methods attached to the form fields.

    Finally, closes the ResourcePicker.
  */
  const handleProductChange = useCallback(({ selection }) => {
    const imageSrc = selection[0]?.images?.edges?.[0]?.node?.url;
    const originalImageSrc = selection[0]?.images?.[0]?.originalSrc;
    setSelectedProduct({
      shopify_product_title: selection[0].title,
      shopify_product_image_url: imageSrc || originalImageSrc,
      // handle: selection[0].handle, // still do not necessary
    });
    shopifyProductId.onChange(selection[0].id);
    shopifyProductTitle.onChange(selection[0].title);
    shopifyProductImageUrl.onChange(imageSrc || originalImageSrc);
    setShowResourcePicker(false);
  }, []);


  /*
    This function is called when a user clicks "Select product" or cancels the ProductPicker.

    It switches between a show and hide state.
  */
  const toggleResourcePicker = useCallback(
    () => setShowResourcePicker(!showResourcePicker),
    [showResourcePicker]
  );

  const [isDeleting, setIsDeleting] = useState(false);
  const deleteProductPoints = useCallback(async () => {
    reset();
    /* The isDeleting state disables the delete Product points multiplier button to show the user that an action is in progress */
    setIsDeleting(true);
    const response = await fetch(`/api/internal/v1/configuration/product_points/${productPoints.shopify_product_id.includes("gid://") ? productPoints.shopify_product_id.split("/").length && productPoints.shopify_product_id.split("/")[productPoints.shopify_product_id.split("/").length - 1] : productPoints?.shopify_product_id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (response.ok) {
      navigate(`/products_points`);
    }
  }, [productPoints]);


  /*
    These variables are used to display product images, and will be populated when image URLs can be retrieved from the Admin.
  */
  const imageSrc = selectedProduct?.shopify_product_image_url;
  const altText = selectedProduct?.shopify_product_title;

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
                title="Product"
                actions={
                  productPoints?.shopify_product_id ? null :
                  [
                    {
                      content: shopifyProductId.value
                        ? "Change product"
                        : "Select product",
                      onAction: toggleResourcePicker,
                    },
                  ]
                }
              >
                <Card.Section>
                  {showResourcePicker && (
                    <ResourcePicker
                      resourceType="Product"
                      showVariants={false}
                      selectMultiple={false}
                      onCancel={toggleResourcePicker}
                      onSelection={handleProductChange}
                      open
                    />
                  )}
                  {shopifyProductId.value ? (
                    <Stack alignment="center">
                      {imageSrc ? (
                        <Thumbnail
                          source={imageSrc}
                          alt={altText}
                        />
                      ) : (
                        <Thumbnail
                          source={ImageMajor}
                          color="base"
                          size="small"
                        />
                      )}
                      <TextStyle variation="strong">
                        {selectedProduct?.shopify_product_title}
                      </TextStyle>
                    </Stack>
                  ) : (
                    <Stack vertical spacing="extraTight">
                      <Button onClick={toggleResourcePicker}>
                        Select product
                      </Button>
                      {shopifyProductId.error && (
                        <Stack spacing="tight">
                          <Icon source={AlertMinor} color="critical" />
                          <TextStyle variation="negative">
                            {shopifyProductId.error}
                          </TextStyle>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Card.Section>
              </Card>
              <Card sectioned title="Product money price $1 = [x] points price multiplier">
                <TextField
                  {...points}
                  type="number"
                  label="Points price multiplier"
                  labelHidden
                  helpText="Give points price multiplier your product"
                />
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
        <Layout.Section>
          {productPoints?.shopify_product_id && (
            <Button
              outline
              destructive
              onClick={deleteProductPoints}
              loading={isDeleting}
            >
              Delete Product points multiplier
            </Button>
          )}
        </Layout.Section>
      </Layout>
    </Stack>
  );
}
