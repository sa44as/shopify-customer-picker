import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { ProductPointsForm } from "../../components";

export default function ManageProductPoints() {
  const breadcrumbs = [{ content: "Specific product points multipliers", url: "/products_points" }];

  return (
    <Page>
      <TitleBar
        title="Create a new Specific product points multiplier"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <ProductPointsForm />
    </Page>
  );
}
