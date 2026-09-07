export function scrollToWorkflowSection(selector: string) {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      const section = document.querySelector(selector);

      if (!section) {
        return;
      }

      const progressHeight =
        document
          .querySelector('nav[aria-label="Design progress"]')
          ?.getBoundingClientRect().height ?? 0;
      const sectionRect = section.getBoundingClientRect();

      window.scrollTo({
        top: Math.max(0, window.scrollY + sectionRect.top - progressHeight),
        behavior: "smooth",
      });
    });
  });
}
