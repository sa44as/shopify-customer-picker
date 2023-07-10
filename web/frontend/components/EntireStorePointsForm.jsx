import { useState, useCallback } from "react";
import {
  Card,
  Form,
  FormLayout,
  TextField,
  Stack,
  Layout,
} from "@shopify/polaris";
import {
  ContextualSaveBar,
} from "@shopify/app-bridge-react";

/* Import the useAuthenticatedFetch hook included in the Node app template */
import { useAuthenticatedFetch, useAppQuery } from "../hooks";

/* Import custom hooks for forms */
import { useForm, useField, notEmptyString, positiveIntegerString } from "@shopify/react-form";

export function EntireStorePointsForm({ entireStorePoints: InitialEntireStorePoints }) {
  const [entireStorePoints, setEntireStorePoints] = useState(InitialEntireStorePoints);

  const fetch = useAuthenticatedFetch();

  const onSubmit = useCallback(
    (body) => {
      (async () => {
        const parsedBody = body;
        const url = `/api/internal/v1/configuration/entire_store_points`;
        const method = "PATCH";
        /* use (authenticated) fetch from App Bridge to send the request to the API and, if successful, clear the form to reset the ContextualSaveBar and parse the response JSON */
        const response = await fetch(url, {
          method,
          body: JSON.stringify(parsedBody),
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          makeClean();
          const getEntireStorePoints = await response.json();
          setEntireStorePoints(getEntireStorePoints);
        } else if (response.status === 400) {
          makeClean();
          const errResponse = await response.json();
          if (errResponse?.original_message || errResponse?.message) {
            alert(errResponse?.original_message || errResponse?.message);
          }
        }
      })();
      return { status: "success" };
    },
    [entireStorePoints, setEntireStorePoints]
  );


  /*
    Sets up the form state with the useForm hook.

    Accepts a "fields" object that sets up each individual field with a default value and validation rules.

    Returns a "fields" object that is destructured to access each of the fields individually, so they can be used in other parts of the component.

    Returns helpers to manage form state, as well as component state that is based on form state.
  */
  const {
    fields,
    dirty,
    reset,
    submitting,
    submit,
    makeClean,
  } = useForm({
    fields: {
      defaultPoints: useField(entireStorePoints.default_points/*{
        value: entireStorePoints.default_points,
        // validates: [notEmptyString("Give a Multiplier to the Entire store."), positiveIntegerString("The Multiplier can't accept the negative value.")],
      }*/),
      preSaleProductsPoints: useField(entireStorePoints.pre_sale_products_points/*{
        value: entireStorePoints.pre_sale_products_points,
        // validates: [notEmptyString("Give a Multiplier to the Pre sale products."), positiveIntegerString("The Multiplier can't accept the negative value.")],
      }*/),
      giftCardProductsPoints: useField(entireStorePoints.gift_card_products_points/*{
        value: entireStorePoints.gift_card_products_points,
        // validates: [notEmptyString("Give a Multiplier to the Gift card products."), positiveIntegerString("The Multiplier can't accept the negative value.")],
      }*/),
    },
    onSubmit,
  });

  /* The form layout, created using Polaris and App Bridge components. */
  return (
    <Stack vertical>
      <Layout>
        <Layout.Section>
          <Form onSubmit={submit}>
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
              <Card sectioned title="Multiplier - Purchased product money price $1 = [multiplier] points for the Entire store.">
                <TextField
                  {...fields.defaultPoints}
                  type="number"
                  label="Entire store points multiplier"
                  labelHidden
                  helpText="Give a multiplier to the Entire store"
                />
              </Card>
              <Card sectioned title="Multiplier - Purchased Pre-sale products money price $1 = [multiplier] points for the Entire store.">
                <TextField
                  {...fields.preSaleProductsPoints}
                  type="number"
                  label="Pre-sale products points multiplier"
                  labelHidden
                  helpText="Give a multiplier to the Pre-sale products"
                />
              </Card>
              <Card sectioned title="Multiplier - Purchased Gift card products money price $1 = [multiplier] points for the Entire store.">
                <TextField
                  {...fields.giftCardProductsPoints}
                  type="number"
                  label="Gift card products points multiplier"
                  labelHidden
                  helpText="Give a multiplier to the Gift card products"
                />
              </Card>
            </FormLayout>
          </Form>
        </Layout.Section>
      </Layout>
    </Stack>
  );
}
