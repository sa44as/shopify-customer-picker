import { Page } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { CustomerPicker } from "../../components";

export default function ManageCustomers() {
  const breadcrumbs = [{ content: "Customer picker", url: "/customers" }];

  return (
    <Page>
      <TitleBar
        title="Customer picker"
        breadcrumbs={breadcrumbs}
        primaryAction={null}
      />
      <CustomerPicker />
    </Page>
  );
}
