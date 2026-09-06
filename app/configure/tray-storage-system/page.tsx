import type { Metadata } from "next";

import ProjectHero from "@/components/ProjectHero";
import TrayStorageSystemConfigurator from "@/components/configurators/TrayStorageSystemConfigurator";
import { PRODUCTS } from "@/lib/products";

const product = PRODUCTS.trayStorageSystem;

export const metadata: Metadata = {
  title: `${product.name} Configurator | Fleetwood Designs`,
  description: `Configure a ${product.name} with removable trays and optional tray dividers.`,
};

export default function TrayStorageSystemConfiguratorPage() {
  return (
    <main className="mx-auto min-h-screen w-full min-w-0 max-w-5xl bg-white px-4 py-8 text-neutral-900 sm:px-6 sm:py-10">
      <ProjectHero
        title={`${product.name} Configurator`}
        description={`Configure a ${product.name} with one or more removable trays and optional tray dividers.`}
      />

      <TrayStorageSystemConfigurator />
    </main>
  );
}
