import { LegalPageLayout } from "@/components/layout/LegalPageLayout";
import { useTranslation } from "@/hooks/useTranslation";

export default function PrivacyPolicy() {
  const { t } = useTranslation();

  return (
    <LegalPageLayout
      title={t("privacyPolicy.title")}
      subtitle={t("privacyPolicy.subtitle")}
      date="April 2026"
    >
      <h2>{t("privacyPolicy.s1Title")}</h2>
      <p>{t("privacyPolicy.s1Content")}</p>

      <h2>{t("privacyPolicy.s2Title")}</h2>
      <ul>
        <li>{t("privacyPolicy.s2i1")}</li>
        <li>{t("privacyPolicy.s2i2")}</li>
        <li>{t("privacyPolicy.s2i3")}</li>
        <li>{t("privacyPolicy.s2i4")}</li>
        <li>{t("privacyPolicy.s2i5")}</li>
      </ul>

      <h2>{t("privacyPolicy.s3Title")}</h2>
      <p>{t("privacyPolicy.s3Content")}</p>

      <h2>{t("privacyPolicy.s4Title")}</h2>
      <ul>
        <li>{t("privacyPolicy.s4i1")}</li>
        <li>{t("privacyPolicy.s4i2")}</li>
        <li>{t("privacyPolicy.s4i3")}</li>
        <li>{t("privacyPolicy.s4i4")}</li>
        <li>{t("privacyPolicy.s4i5")}</li>
        <li>{t("privacyPolicy.s4i6")}</li>
      </ul>

      <h2>{t("privacyPolicy.s5Title")}</h2>
      <p>{t("privacyPolicy.s5Content")}</p>
      <ul>
        <li>{t("privacyPolicy.s5i1")}</li>
        <li>{t("privacyPolicy.s5i2")}</li>
        <li>{t("privacyPolicy.s5i3")}</li>
        <li>{t("privacyPolicy.s5i4")}</li>
      </ul>
      <p><strong>{t("privacyPolicy.s5After")}</strong></p>

      <h2>{t("privacyPolicy.s6Title")}</h2>
      <ul>
        <li>{t("privacyPolicy.s6i1")}</li>
        <li>{t("privacyPolicy.s6i2")}</li>
        <li>{t("privacyPolicy.s6i3")}</li>
        <li>{t("privacyPolicy.s6i4")}</li>
        <li>{t("privacyPolicy.s6i5")}</li>
      </ul>

      <h2>{t("privacyPolicy.s7Title")}</h2>
      <p>{t("privacyPolicy.s7Content")}</p>

      <h2>{t("privacyPolicy.s8Title")}</h2>
      <p>{t("privacyPolicy.s8Content")}</p>

      <h2>{t("privacyPolicy.s9Title")}</h2>
      <p>{t("privacyPolicy.s9Content")}</p>

      <h2>{t("privacyPolicy.s10Title")}</h2>
      <p>privacy@vitasync.co</p>
    </LegalPageLayout>
  );
}
