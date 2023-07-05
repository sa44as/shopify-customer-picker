import { Card, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { CustomerPointsForm } from "../../components";
import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";

export default function CustomerPointsEdit() {
  const breadcrumbs = [{ content: "Individual customer points multipliers", url: "/customers_points" }];

  const { shopify_customer_id } = useParams();

  /*
    Fetch the Individual customer points.
    useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
    The backend supplements app data with data queried from the internal database, Shopify REST or GraphQL Admin API.
  */
  const {
    data: getCustomerPoints,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: `/api/internal/v1/configuration/customer_points/${shopify_customer_id}`,
    reactQueryOptions: {
      /* Disable refetching because the CustomerPointsForm component ignores changes to its props */
      refetchOnReconnect: false,
    },
  });

  /* Loading action and markup that uses App Bridge and Polaris components */
  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title="Edit Individual customer points multiplier"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <Card title="Customer">
              <Card.Section>
                <SkeletonBodyText lines={3} />
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card sectioned title="Purchased product money price $1 = [multiplier] points for the selected customer." >
              <SkeletonBodyText lines={3} />
            </Card>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }

  return (
    <Page>
      <TitleBar
        title="Edit Individual customer points multiplier"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <CustomerPointsForm customerPoints={getCustomerPoints.customer_points_configuration} />
    </Page>
  );
}
