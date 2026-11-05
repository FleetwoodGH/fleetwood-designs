import type { Metadata } from "next";
import ProjectHero from "@/components/ProjectHero";
import StackableSmallPartsBoxConfigurator from "@/components/configurators/StackableSmallPartsBoxConfigurator";
import { PRODUCTS } from "@/lib/products";

const product = PRODUCTS.stackableSmallPartsBox;
export const metadata: Metadata = {
  title: `${product.name} Configurator | Fleetwood Designs`,
  description: "Calculate shell and drawer dimensions using standard grid units or a custom total size.",
};
export default function StackableSmallPartsBoxPage() {
  return <main className="mx-auto min-h-screen w-full min-w-0 max-w-5xl bg-white px-4 py-8 text-neutral-900 sm:px-6 sm:py-10">
    <ProjectHero title={`${product.name} Configurator`} description="Configure one shell and one sliding drawer using a standard grid or your required dimensions." />
    <StackableSmallPartsBoxConfigurator />
  </main>;
}
