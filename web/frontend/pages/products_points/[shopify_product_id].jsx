import { Card, Page, Layout, SkeletonBodyText } from "@shopify/polaris";
import { Loading, TitleBar } from "@shopify/app-bridge-react";
import { ProductPointsForm } from "../../components";
import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";

export default function ProductPointsEdit() {
  const breadcrumbs = [{ content: "Products points multipliers", url: "/products_points" }];

  const { shopify_product_id } = useParams();

  /*
    Fetch the Reward product.
    useAppQuery uses useAuthenticatedQuery from App Bridge to authenticate the request.
    The backend supplements app data with data queried from the internal database, Shopify REST or GraphQL Admin API.
  */
  const {
    data: getProductPoints,
    isLoading,
    isRefetching,
  } = useAppQuery({
    url: `/api/internal/v1/configuration/product_points/${shopify_product_id}`,
    reactQueryOptions: {
      /* Disable refetching because the ProductPointsForm component ignores changes to its props */
      refetchOnReconnect: false,
    },
  });

  /* Loading action and markup that uses App Bridge and Polaris components */
  if (isLoading || isRefetching) {
    return (
      <Page>
        <TitleBar
          title="Edit Product money price $1 = [x] points price multiplier"
          breadcrumbs={breadcrumbs}
          primaryAction={null}
        />
        <Loading />
        <Layout>
          <Layout.Section>
            <Card title="Product">
              <Card.Section>
                <SkeletonBodyText lines={3} />
              </Card.Section>
            </Card>
          </Layout.Section>
          <Layout.Section>
            <Card sectioned title="Points price multiplier" >
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
        title="Edit Product money price $1 = [x] points price multiplier"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <ProductPointsForm productPoints={getProductPoints.product_points_configuration} />
    </Page>
  );
}
