import { useTranslation } from "@/hooks/useTranslation";

export function SkipToContent() {
  const { t } = useTranslation();
  return (
    <a
      href="#main"
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:bg-primary focus:text-primary-foreground focus:px-4 focus:py-2 focus:rounded-md focus:font-medium focus:shadow-lg"
    >
      {t("a11y.skipToContent")}
    </a>
  );
}
