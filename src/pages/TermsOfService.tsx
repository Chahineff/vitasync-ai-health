import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/hooks/useTranslation";

export default function TermsOfService() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      title={t("termsOfService.title")}
      subtitle={t("termsOfService.subtitle")}
      date="April 2026"
    >
      <h2>{t("termsOfService.s1Title")}</h2>
      <p>{t("termsOfService.s1Content")}</p>

      <h2>{t("termsOfService.s2Title")}</h2>
      <p>{t("termsOfService.s2Content")}</p>

      <h2>{t("termsOfService.s3Title")}</h2>
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 my-4">
        <p className="text-foreground font-medium">{t("termsOfService.s3Content")}</p>
      </div>

      <h2>{t("termsOfService.s4Title")}</h2>
      <ul>
        <li>{t("termsOfService.s4i1")}</li>
        <li>{t("termsOfService.s4i2")}</li>
        <li>{t("termsOfService.s4i3")}</li>
        <li>{t("termsOfService.s4i4")}</li>
        <li>{t("termsOfService.s4i5")}</li>
      </ul>

      <h2>{t("termsOfService.s5Title")}</h2>
      <p>{t("termsOfService.s5Content")}</p>

      <h2>{t("termsOfService.s6Title")}</h2>
      <p>{t("termsOfService.s6Content")}</p>

      <h2>{t("termsOfService.s7Title")}</h2>
      <p>{t("termsOfService.s7Content")}</p>

      <h2>{t("termsOfService.s8Title")}</h2>
      <p>{t("termsOfService.s8Content")}</p>

      <h2>{t("termsOfService.s9Title")}</h2>
      <p>{t("termsOfService.s9Content")}</p>

      <h2>{t("termsOfService.s10Title")}</h2>
      <p>legal@vitasync.co</p>
    </LegalPageLayout>
  );
}
