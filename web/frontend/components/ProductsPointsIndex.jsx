import { useNavigate } from "@shopify/app-bridge-react";
import {
  Card,
  IndexTable,
  Thumbnail,
  UnstyledLink,
} from "@shopify/polaris";
import { ImageMajor } from "@shopify/polaris-icons";

export function ProductsPointsIndex({ productsPoints, loading }) {
  const navigate = useNavigate();

  const resourceName = {
    singular: "Specific product points multiplier",
    plural: "Specific product points multipliers",
  };

  const rowMarkup = productsPoints.map(
    ({ shopify_product_id, shopify_product_title, shopify_product_image_url, points }, index) => {
      /* The form layout, created using Polaris components. Includes the Specific product points multiplier data set above. */
      return (
        <IndexTable.Row
          id={shopify_product_id}
          key={shopify_product_id}
          position={index}
          onClick={() => {
            navigate(`/products_points/${shopify_product_id.includes("gid://") ? shopify_product_id.split("/").length && shopify_product_id.split("/")[shopify_product_id.split("/").length - 1] : shopify_product_id}`);
          }}
        >
          <IndexTable.Cell>
            <Thumbnail
              source={shopify_product_image_url || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/products_points/${shopify_product_id.includes("gid://") ? shopify_product_id.split("/").length && shopify_product_id.split("/")[shopify_product_id.split("/").length - 1] : shopify_product_id}`}>
              {truncate(shopify_product_title, 45)}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>{points}</IndexTable.Cell>
        </IndexTable.Row>
      );
    }
  );

  /* A layout for small screens, built using Polaris components */
  return (
    <Card>      
      <IndexTable
        resourceName={resourceName}
        itemCount={productsPoints.length}
        headings={[
          { title: "Thumbnail", hidden: true },
          { title: "Title" },
          { title: "Multiplier - Product money price $1 = [Multiplier] points" },
        ]}
        selectable={false}
        loading={loading}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}
