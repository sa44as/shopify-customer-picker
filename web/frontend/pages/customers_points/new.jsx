import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { CustomerPointsForm } from "../../components";

export default function ManageCustomerPoints() {
  const breadcrumbs = [{ content: "Customer points multipliers", url: "/customers_points" }];

  return (
    <Page>
      <TitleBar
        title="Create new Customer points multiplier"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <CustomerPointsForm />
    </Page>
  );
}
