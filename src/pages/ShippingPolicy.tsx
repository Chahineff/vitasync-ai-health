import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/hooks/useTranslation";

export default function ShippingPolicy() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      title={t("shippingPolicy.title")}
      subtitle={t("shippingPolicy.subtitle")}
      date="April 2026"
    >
      <h2>{t("shippingPolicy.zoneTitle")}</h2>
      <p>{t("shippingPolicy.zoneContent")}</p>

      <h2>{t("shippingPolicy.partnerTitle")}</h2>
      <p>{t("shippingPolicy.partnerContent")}</p>

      <h2>{t("shippingPolicy.ratesTitle")}</h2>
      <ul>
        <li>{t("shippingPolicy.r1")}</li>
        <li>{t("shippingPolicy.r2")}</li>
        <li>{t("shippingPolicy.r3")}</li>
        <li>{t("shippingPolicy.r4")}</li>
      </ul>
      <p>{t("shippingPolicy.ratesNote")}</p>

      <h2>{t("shippingPolicy.deliveryTitle")}</h2>
      <p>{t("shippingPolicy.deliveryContent")}</p>

      <h2>{t("shippingPolicy.trackingTitle")}</h2>
      <p>{t("shippingPolicy.trackingContent")}</p>

      <h2>{t("shippingPolicy.lostTitle")}</h2>
      <p>{t("shippingPolicy.lostContent")}</p>
    </LegalPageLayout>
  );
}
