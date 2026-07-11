import ProjectHero from "@/components/ProjectHero";
import StorageDesignAssistant from "@/components/StorageDesignAssistant";

export default function ParametricStorageSystemPage() {
  return (
    <main className="mx-auto min-h-screen max-w-5xl bg-white px-6 py-16 text-neutral-900">
      <ProjectHero
        title="Parametric Storage System"
        description="Configure a storage solution that fits your project."
      />

      <StorageDesignAssistant />
    </main>
  );
}
