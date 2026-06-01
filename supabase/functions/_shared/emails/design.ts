// VitaSync email design system — shared across all transactional templates.
// Brand: dark background #0A0A0A, green accent #00F5A0, Inter font.
export const BRAND = {
  bg: "#0A0A0A",
  card: "#1A1A1A",
  cardAlt: "#242424",
  border: "#2A2A2A",
  text: "#FFFFFF",
  muted: "#888888",
  footer: "#555555",
  accent: "#00F5A0",
  accentText: "#0A0A0A",
} as const;

export const SITE_URL = "https://vitasync.me";
export const LOGO_URL = `${SITE_URL}/logo-vitasync-white.svg`;
export const FROM_ADDRESS = "VitaSync <noreply@vitasync.me>";
export const SUPPORT_EMAIL = "support@vitasync.me";

export function unsubscribeUrl(email: string): string {
  return `${SITE_URL}/unsubscribe?email=${encodeURIComponent(email)}`;
}

// Escape user-controlled values before injecting into HTML.
export function esc(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface LayoutOptions {
  preview: string;
  body: string;
  recipientEmail: string;
  showUnsubscribe?: boolean; // marketing emails only
}

export function renderLayout({ preview, body, recipientEmail, showUnsubscribe }: LayoutOptions): string {
  const unsubLink = showUnsubscribe
    ? `<a href="${unsubscribeUrl(recipientEmail)}" style="color:${BRAND.footer};text-decoration:underline;">Unsubscribe</a>`
    : `<a href="${SITE_URL}/account" style="color:${BRAND.footer};text-decoration:underline;">Manage preferences</a>`;
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>VitaSync</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
  <style>
    body{margin:0;padding:0;background:${BRAND.bg};font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${BRAND.text};-webkit-font-smoothing:antialiased;}
    a{color:${BRAND.accent};}
    @media (max-width:620px){.vs-card{padding:28px 22px !important;}.vs-h1{font-size:26px !important;}}
  </style>
</head>
<body style="margin:0;padding:0;background:${BRAND.bg};">
  <div style="display:none;font-size:1px;color:${BRAND.bg};line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${esc(preview)}</div>
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.bg};padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width:600px;width:100%;">
        <tr><td align="center" style="padding-bottom:24px;">
          <a href="${SITE_URL}" style="text-decoration:none;">
            <img src="${LOGO_URL}" alt="VitaSync" width="140" style="max-width:140px;height:auto;display:block;" />
          </a>
        </td></tr>
        <tr><td class="vs-card" style="background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;padding:40px;color:${BRAND.text};font-size:16px;line-height:1.6;">
          ${body}
        </td></tr>
        <tr><td style="padding:24px 8px 0;text-align:center;color:${BRAND.footer};font-size:12px;line-height:1.6;">
          © 2026 VitaSync · AI-powered wellness coaching<br/>
          <a href="${SITE_URL}" style="color:${BRAND.footer};text-decoration:underline;">vitasync.me</a> · ${unsubLink}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// Reusable building blocks --------------------------------------------------
export const h1 = (text: string, size = 32) =>
  `<h1 class="vs-h1" style="margin:0 0 20px;font-family:'Inter',sans-serif;font-size:${size}px;line-height:1.2;font-weight:700;color:${BRAND.text};">${text}</h1>`;

export const p = (text: string, color = BRAND.text, size = 16) =>
  `<p style="margin:0 0 20px;font-size:${size}px;line-height:1.6;color:${color};">${text}</p>`;

export const sub = (text: string) => p(text, BRAND.muted, 14);

export const button = (label: string, href: string) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 24px;"><tr><td align="center" style="border-radius:50px;background:${BRAND.accent};">
    <a href="${href}" style="display:inline-block;padding:14px 36px;font-family:'Inter',sans-serif;font-size:16px;font-weight:700;color:${BRAND.accentText};text-decoration:none;border-radius:50px;">${label}</a>
  </td></tr></table>`;

export const ghostButton = (label: string, href: string) =>
  `<a href="${href}" style="display:inline-block;padding:12px 28px;margin:4px 6px;border:1px solid ${BRAND.border};border-radius:50px;color:${BRAND.text};font-weight:600;font-size:14px;text-decoration:none;">${label}</a>`;

export const divider = () =>
  `<hr style="border:none;border-top:1px solid ${BRAND.border};margin:28px 0;" />`;

export const card = (inner: string, accent = false) =>
  `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.cardAlt};border-radius:12px;${accent ? `border-left:3px solid ${BRAND.accent};` : ""}margin:0 0 24px;"><tr><td style="padding:20px 24px;font-size:15px;line-height:1.7;color:${BRAND.text};">${inner}</td></tr></table>`;

export const checkmarkSvg = (size = 80) => `
<div style="text-align:center;margin:0 0 28px;">
  <svg width="${size}" height="${size}" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Confirmed">
    <circle cx="40" cy="40" r="38" fill="${BRAND.accent}" />
    <path d="M24 41 L36 53 L57 30" stroke="${BRAND.accentText}" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" fill="none" />
  </svg>
</div>`;

export const heroBand = (label = "Personalized wellness, powered by AI") => `
<div style="background:linear-gradient(135deg,#0A0A0A 0%,#0F2C20 50%,${BRAND.accent} 200%);border-radius:12px;padding:42px 24px;margin:0 0 28px;text-align:center;">
  <div style="font-family:'Inter',sans-serif;color:${BRAND.accent};font-weight:700;letter-spacing:1px;font-size:12px;text-transform:uppercase;">VitaSync · AI Coach</div>
  <div style="color:${BRAND.text};font-size:18px;font-weight:600;margin-top:8px;">${label}</div>
</div>`;

export const iconRow = (items: { icon: string; label: string }[]) => {
  const cells = items.map(i => `
    <td align="center" valign="top" style="padding:8px;width:33%;">
      <div style="font-size:28px;line-height:1;margin-bottom:8px;">${i.icon}</div>
      <div style="font-size:13px;color:${BRAND.muted};line-height:1.4;">${esc(i.label)}</div>
    </td>`).join("");
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:8px 0 28px;"><tr>${cells}</tr></table>`;
};

export const aiAvatar = () => `
<div style="text-align:center;margin:0 0 24px;">
  <div style="display:inline-block;width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,${BRAND.accent} 0%,#0B7A57 100%);line-height:64px;color:${BRAND.accentText};font-weight:700;font-size:22px;font-family:'Inter',sans-serif;">✦</div>
</div>`;