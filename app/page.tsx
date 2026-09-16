import Image, { type StaticImageData } from "next/image";
import Link from "next/link";

import printInPlaceStorageBoxImage from "@/public/images/products/print-in-place-storage-box.png";
import printInPlaceStorageBoxCompartmentsImage from "@/public/images/products/print-in-place-storage-box-compartments.png";
import storageBoxLidBaseImage from "@/public/images/products/storage-box-lid-base.png";
import trayStorageSystemImage from "@/public/images/products/tray-storage-system.png";
import { PRODUCTS } from "@/lib/products";
import { SITE } from "@/lib/site";

type ProductCardProps = {
  product: (typeof PRODUCTS)[keyof typeof PRODUCTS];
  image: StaticImageData;
  description: string;
  bestFor: string;
  features: readonly string[];
};

const productFamilies = [
  {
    name: "Print-in-Place",
    description: "Single-print designs with integrated hinges and no assembly.",
    products: [
      {
        product: PRODUCTS.printInPlaceStorageBox,
        image: printInPlaceStorageBoxImage,
        description:
          "A simple storage box that prints as a single part, with an integrated double hinge and snap-fit latch. The lid and base have equal heights, making this the most straightforward option when you simply need an enclosed box in the right size.",
        bestFor:
          "Simple storage when you don’t need compartments or separate lid and base heights.",
        features: [
          "Print in place",
          "No assembly",
          "Equal lid & base",
          "Snap-fit latch",
        ],
      },
      {
        product: PRODUCTS.printInPlaceStorageBoxCompartments,
        image: printInPlaceStorageBoxCompartmentsImage,
        description:
          "A print-in-place storage box with configurable fixed compartments in both the base and lid. Separate sliding inner lids keep small parts contained, allowing both halves of the box to be used for organized storage.",
        bestFor:
          "Organizing small parts in fixed compartments while making full use of both halves of the box.",
        features: [
          "Print in place",
          "Custom compartments",
          "Sliding inner lids",
          "Base & lid storage",
        ],
      },
    ],
  },
  {
    name: "Separate Lid & Base",
    description:
      "Separately printed parts for more flexibility in size and organization.",
    products: [
      {
        product: PRODUCTS.storageBoxLidBase,
        image: storageBoxLidBaseImage,
        description:
          "A storage box with separately printed lid and base, allowing their heights to be set independently. The two parts are connected with a simple filament hinge, and printing them separately also makes larger boxes possible on smaller build plates.",
        bestFor:
          "Storage where you need independent control over lid and base height, or want to create a larger box.",
        features: [
          "Independent heights",
          "Separate parts",
          "Filament hinge",
          "Larger box sizes",
        ],
      },
      {
        product: PRODUCTS.trayStorageSystem,
        image: trayStorageSystemImage,
        description:
          "A storage box built around removable, stackable trays instead of fixed compartments. Mix open trays, covered trays and compartment trays within the same box, so individual groups of items can be removed and used separately.",
        bestFor:
          "Modular organization when you want removable trays rather than fixed storage compartments.",
        features: [
          "Removable trays",
          "Stackable",
          "Mix tray types",
          "Custom compartments",
        ],
      },
    ],
  },
] as const;

const workflowSteps = [
  "Choose a design",
  "Enter what you need",
  "Get the parameters",
  "Open in MakerWorld",
] as const;

function ProductCard({
  product,
  image,
  description,
  bestFor,
  features,
}: ProductCardProps) {
  return (
    <article className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white">
      <div className="border-b border-neutral-200 bg-white md:h-[255px] lg:h-72">
        <Image
          src={image}
          alt={`${product.name} storage design`}
          sizes="(max-width: 767px) calc(100vw - 48px), (max-width: 1279px) calc(50vw - 56px), 568px"
          className="aspect-4/3 h-auto w-full object-contain md:h-full md:aspect-auto"
        />
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7 lg:p-5">
        <h3 className="text-xl font-semibold leading-snug tracking-tight text-[#1A1A1A] sm:text-2xl">
          {product.name}
        </h3>
        <p className="mt-4 text-[15px] leading-7 text-neutral-600">
          {description}
        </p>

        <div className="mt-6 border-l-2 border-[#1A1A1A] pl-4 lg:mt-4">
          <p className="text-sm leading-6 text-neutral-700">
            <span className="font-semibold text-[#1A1A1A]">Best for:</span>{" "}
            {bestFor}
          </p>
        </div>

        <ul
          className="mt-6 flex flex-wrap gap-2 lg:mt-4"
          aria-label="Features"
        >
          {features.map((feature) => (
            <li
              key={feature}
              className="rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700"
            >
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-auto pt-8 lg:pt-5">
          <Link
            href={product.configuratorPath}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#1A1A1A] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
          >
            Configure
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-[#1A1A1A]">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 sm:px-8 sm:py-4 lg:px-10">
          <a
            href="#top"
            className="shrink-0 py-2 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A1A1A] lg:py-1.5"
          >
            <Image
              src="/images/brand/Fleetwood_Designs_Black_Master.svg"
              width={199}
              height={41}
              alt="Fleetwood Designs"
              className="h-auto w-[136px] sm:w-[180px] lg:w-[260px]"
            />
          </a>
          <nav aria-label="Primary navigation">
            <ul className="flex items-center gap-5 text-sm font-medium text-neutral-600 sm:gap-8">
              <li>
                <a
                  href="#storage-solutions"
                  className="py-2 transition-colors hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A1A1A]"
                >
                  Storage Solutions
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  className="py-2 transition-colors hover:text-[#1A1A1A] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1A1A1A]"
                >
                  About
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main id="top">
        <section className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-28 lg:px-10 lg:py-36">
          <div className="max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Parametric storage designs
            </p>
            <h1 className="mt-6 max-w-[720px] text-5xl font-semibold leading-[1.03] tracking-[-0.045em] sm:text-6xl lg:text-[64px]">
              Storage solutions, made to fit.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-600 sm:text-xl sm:leading-9">
              Parametric storage designs with simple customization tools that
              help you create the right size and layout for what you want to
              store.
            </p>
            <a
              href="#storage-solutions"
              className="mt-10 inline-flex min-h-12 items-center justify-center rounded-lg bg-[#1A1A1A] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
            >
              Explore storage solutions
            </a>
          </div>
        </section>

        <section
          id="storage-solutions"
          aria-labelledby="storage-solutions-heading"
          className="scroll-mt-6 border-y border-neutral-200 bg-neutral-50/70"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                Storage solutions
              </p>
              <h2
                id="storage-solutions-heading"
                className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Find the right storage solution
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-600">
                Choose between print-in-place designs, separate lid and base
                designs, fixed compartments or removable trays.
              </p>
            </div>

            <div className="mt-16 space-y-20 sm:mt-20 sm:space-y-24">
              {productFamilies.map((family, familyIndex) => (
                <section
                  key={family.name}
                  aria-labelledby={`family-${familyIndex}`}
                >
                  <div className="grid gap-3 border-t border-neutral-300 pt-6 md:grid-cols-[1fr_2fr] md:gap-8">
                    <h3
                      id={`family-${familyIndex}`}
                      className="text-2xl font-semibold tracking-tight"
                    >
                      {family.name}
                    </h3>
                    <p className="max-w-xl text-base leading-7 text-neutral-600">
                      {family.description}
                    </p>
                  </div>

                  <div className="mt-8 grid items-stretch gap-6 md:grid-cols-2 lg:gap-8">
                    {family.products.map((product) => (
                      <ProductCard key={product.product.name} {...product} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </section>

        <section
          aria-labelledby="workflow-heading"
          className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10 lg:py-28"
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.4fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-500">
                How it works
              </p>
              <h2
                id="workflow-heading"
                className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl"
              >
                Customize before you print
              </h2>
              <p className="mt-5 text-lg leading-8 text-neutral-600">
                The Fleetwood Designs configurators translate what you need
                into the parameters required by the MakerWorld models.
              </p>
              <p className="mt-5 text-base leading-7 text-neutral-600">
                Enter either the desired outside dimensions or the usable space
                you need. The configurator handles the underlying dimensions
                and, where applicable, compartment or tray layouts.
              </p>
            </div>

            <ol className="grid self-start gap-px overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-200 sm:grid-cols-2">
              {workflowSteps.map((step, index) => (
                <li key={step} className="bg-white p-5 sm:min-h-[120px]">
                  <span className="font-mono text-sm text-neutral-400">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p className="mt-5 text-lg font-semibold tracking-tight">
                    {step}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="about"
          aria-labelledby="about-heading"
          className="scroll-mt-6 border-y border-neutral-200 bg-[#1A1A1A] text-white"
        >
          <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 sm:py-24 lg:px-10">
            <div className="grid gap-8 md:grid-cols-[0.8fr_1.4fr] md:gap-16 lg:gap-24">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                About Fleetwood Designs
              </p>
              <div className="max-w-3xl">
                <h2
                  id="about-heading"
                  className="text-3xl font-semibold tracking-tight sm:text-4xl"
                >
                  Practical solutions through thoughtful design.
                </h2>
                <p className="mt-6 text-lg leading-8 text-neutral-300">
                  Fleetwood Designs is a personal design project focused on
                  solving practical problems through thoughtful design. The
                  physical designs and digital tools are developed together:
                  the model provides the flexibility, while the configurator
                  makes that flexibility easier to use.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section
          aria-labelledby="dedicated-solutions-heading"
          className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20 lg:px-10"
        >
          <div className="grid gap-5 border-b border-neutral-200 pb-16 sm:pb-20 md:grid-cols-[0.8fr_1.4fr] md:gap-16 lg:gap-24">
            <h2
              id="dedicated-solutions-heading"
              className="text-2xl font-semibold tracking-tight"
            >
              Dedicated solutions
            </h2>
            <div className="max-w-2xl">
              <p className="text-base leading-7 text-neutral-600">
                Not every storage problem needs a configurable system. Fleetwood
                Designs also includes purpose-built designs created around
                specific tools, components or use cases.
              </p>
              <a
                href={SITE.makerWorldOverviewUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg border border-neutral-300 px-5 py-2.5 text-sm font-semibold text-[#1A1A1A] transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1A1A1A]"
              >
                View all designs on MakerWorld
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer>
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 pb-12 pt-10 text-center text-sm sm:px-8 lg:px-10">
          <Image
            src="/images/brand/Fleetwood_Designs_Black_Master.svg"
            width={199}
            height={41}
            alt="Fleetwood Designs"
            className="h-auto w-[132px] sm:w-[160px] lg:w-[208px]"
          />
          <p className="text-neutral-500">
            Practical solutions through thoughtful design.
          </p>
        </div>
      </footer>
    </div>
  );
}
