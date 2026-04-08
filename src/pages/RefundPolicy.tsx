import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/hooks/useTranslation";

export default function RefundPolicy() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      title={t("refundPolicy.title")}
      subtitle={t("refundPolicy.subtitle")}
      date="April 2026"
    >
      <h2>{t("refundPolicy.guaranteeTitle")}</h2>
      <p>{t("refundPolicy.guaranteeContent")}</p>

      <h2>{t("refundPolicy.conditionsTitle")}</h2>
      <ul>
        <li>{t("refundPolicy.c1")}</li>
        <li>{t("refundPolicy.c2")}</li>
        <li>{t("refundPolicy.c3")}</li>
        <li>{t("refundPolicy.c4")}</li>
      </ul>

      <h2>{t("refundPolicy.howTitle")}</h2>
      <p>{t("refundPolicy.howContent")}</p>

      <h2>{t("refundPolicy.processingTitle")}</h2>
      <p>{t("refundPolicy.processingContent")}</p>
    </LegalPageLayout>
  );
}
