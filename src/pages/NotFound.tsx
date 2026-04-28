import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <main id="main" className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-4">
        <h1 className="mb-4 text-5xl font-bold text-foreground">404</h1>
        <p className="mb-2 text-2xl font-semibold text-foreground">{t("notFound.title")}</p>
        <p className="mb-6 text-base text-muted-foreground">{t("notFound.description")}</p>
        <Link to="/" className="inline-block rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          {t("notFound.cta")}
        </Link>
      </div>
    </main>
  );
};

export default NotFound;
