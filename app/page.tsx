import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-16">
      <section className="mx-auto max-w-3xl">
        <p className="mb-4 text-sm uppercase tracking-wide text-neutral-500">
          Fleetwood Designs
        </p>

        <h1 className="mb-6 text-4xl font-semibold tracking-tight text-neutral-900">
          Thoughtful solutions for makers.
        </h1>

        <p className="mb-10 text-lg leading-8 text-neutral-700">
          Practical project pages, tools and design assistants that help makers
          configure, understand and use Fleetwood Designs projects.
        </p>

        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          Projects
        </h2>

        <Link
          href="/configure/tray-storage-system"
          className="inline-flex rounded-lg border border-neutral-300 px-5 py-3 text-sm font-medium text-neutral-900 transition hover:bg-neutral-100"
        >
          Configure the Tray Storage System →
        </Link>
      </section>
    </main>
  );
}
