import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ProductPointsForm } from "../../components";

export default function ManageProductPoints() {
  const breadcrumbs = [{ content: "Product points multipliers", url: "/products_points" }];

  return (
    <Page>
      <TitleBar
        title="Create new Product points multiplier"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <ProductPointsForm />
    </Page>
  );
}
