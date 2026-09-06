import { permanentRedirect } from "next/navigation";

import { PRODUCTS } from "@/lib/products";

export default function ParametricStorageSystemPage() {
  permanentRedirect(PRODUCTS.trayStorageSystem.configuratorPath);
}
