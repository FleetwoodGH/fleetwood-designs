import type { Metadata } from "next";

import ProjectHero from "@/components/ProjectHero";
import StorageBoxLidBaseConfigurator from "@/components/configurators/StorageBoxLidBaseConfigurator";
import { PRODUCTS } from "@/lib/products";

const product = PRODUCTS.storageBoxLidBase;

export const metadata: Metadata = {
  title: `${product.name} Configurator | Fleetwood Designs`,
  description:
    "Calculate outside or usable dimensions for the Parametric Storage Box with a custom lid and base.",
};

export default function StorageBoxLidBaseConfiguratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full min-w-0 max-w-5xl bg-white px-4 py-8 text-neutral-900 sm:px-6 sm:py-10">
      <ProjectHero
        title={`${product.name} Configurator`}
        description="Configure the box from its outside dimensions or the usable space your items need."
      />

      <StorageBoxLidBaseConfigurator />
    </main>
  );
}
