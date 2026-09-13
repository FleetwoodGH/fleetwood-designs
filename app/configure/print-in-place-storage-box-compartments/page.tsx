import type { Metadata } from "next";

import ProjectHero from "@/components/ProjectHero";
import PrintInPlaceCompartmentBoxConfigurator from "@/components/configurators/PrintInPlaceCompartmentBoxConfigurator";
import { PRODUCTS } from "@/lib/products";

const product = PRODUCTS.printInPlaceStorageBoxCompartments;

export const metadata: Metadata = {
  title: `${product.name} Configurator | Fleetwood Designs`,
  description:
    "Configure outside or usable dimensions and independent base and lid compartment layouts.",
};

export default function PrintInPlaceCompartmentBoxConfiguratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full min-w-0 max-w-5xl bg-white px-4 py-8 text-neutral-900 sm:px-6 sm:py-10">
      <ProjectHero
        title={`${product.name} Configurator`}
        description="Configure the box dimensions and compartment layouts for both halves."
      />

      <PrintInPlaceCompartmentBoxConfigurator />
    </main>
  );
}
