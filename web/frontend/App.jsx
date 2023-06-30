import { BrowserRouter } from "react-router-dom";
import { NavigationMenu } from "@shopify/app-bridge-react";
import Routes from "./Routes";

import {
  AppBridgeProvider,
  QueryProvider,
  PolarisProvider,
} from "./components";
import { navigationMenuItems } from "./constants/navigationMenuItems";

export default function App() {
  // Any .tsx or .jsx files in /pages will become a route
  // See documentation for <Routes /> for more info
  const pages = import.meta.globEager("./pages/**/!(*.test.[jt]sx)*.([jt]sx)");

  return (
    <PolarisProvider>
      <BrowserRouter>
        <AppBridgeProvider>
          <QueryProvider>
            {<NavigationMenu
              navigationLinks={navigationMenuItems}
              // to do, matcher not working correctly, shopify bug, or not compatiple with Routes component, low priority, selected item not working properly
              // matcher={(link, location) => {
              //   // debugger
              //   console.log("link.destination: ", link.destination, "location.pathname: ", location.pathname);
              //   return link.destination === location.pathname
              // }}
            />}
            <Routes pages={pages} />
          </QueryProvider>
        </AppBridgeProvider>
      </BrowserRouter>
    </PolarisProvider>
  );
}
