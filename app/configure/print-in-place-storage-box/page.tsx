import type { Metadata } from "next";

import ProjectHero from "@/components/ProjectHero";
import PrintInPlaceStorageBoxConfigurator from "@/components/configurators/PrintInPlaceStorageBoxConfigurator";
import { PRODUCTS } from "@/lib/products";

const product = PRODUCTS.printInPlaceStorageBox;

export const metadata: Metadata = {
  title: `${product.name} Configurator | Fleetwood Designs`,
  description:
    "Calculate outside or usable dimensions for the Print-in-Place Storage Box.",
};

export default function PrintInPlaceStorageBoxConfiguratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full min-w-0 max-w-5xl bg-white px-4 py-8 text-neutral-900 sm:px-6 sm:py-10">
      <ProjectHero
        title={`${product.name} Configurator`}
        description="Configure the box from its outside dimensions or the usable space your items need."
      />

      <PrintInPlaceStorageBoxConfigurator />
    </main>
  );
}
