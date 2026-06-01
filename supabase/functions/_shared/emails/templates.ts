// Ten VitaSync transactional email templates.
// Each template returns { subject, html, listUnsubscribe? }.
import {
  BRAND, SITE_URL, esc, renderLayout,
  h1, p, sub, button, ghostButton, divider, card, checkmarkSvg, heroBand, iconRow, aiAvatar, unsubscribeUrl,
} from "./design.ts";

export interface RenderedEmail {
  subject: string;
  html: string;
  listUnsubscribe?: string; // populated for marketing emails (#4, #8, #10)
}

export type EmailTemplateName =
  | "welcome"
  | "confirm_account"
  | "password_reset"
  | "quiz_reminder"
  | "stack_ready"
  | "subscription_confirmed"
  | "stack_shipped"
  | "monthly_checkin"
  | "subscription_cancelled"
  | "pro_upsell";

const firstName = (name?: string | null) => esc(name?.trim() || "there");

// 1 — Welcome ---------------------------------------------------------------
export function welcomeEmail(data: { firstName?: string | null; email: string }): RenderedEmail {
  const body = `
    ${heroBand("Welcome to a smarter way to take care of your health")}
    ${h1(`Welcome, ${firstName(data.firstName)}. Let's optimize you.`, 30)}
    ${p("You just joined the future of personalized wellness. VitaSync's AI coach learns your goals, lifestyle, and feedback — then builds your perfect supplement stack every month.")}
    ${iconRow([
      { icon: "🧠", label: "Personalized coaching" },
      { icon: "📦", label: "Monthly stack delivered" },
      { icon: "🔄", label: "Adjusts as you evolve" },
    ])}
    ${button("Start Your Health Quiz →", `${SITE_URL}/onboarding`)}
    ${sub("Takes 3 minutes. No credit card required.")}
    ${divider()}
    ${p(`Questions? Reply to this email or chat with us at <a href="${SITE_URL}" style="color:${BRAND.accent};">vitasync.me</a>`, BRAND.muted, 14)}
  `;
  return {
    subject: "Welcome to VitaSync 🌿 Your AI wellness coach is ready",
    html: renderLayout({ preview: "Let's build your personalized supplement stack.", body, recipientEmail: data.email }),
  };
}

// 2 — Confirm account -------------------------------------------------------
export function confirmAccountEmail(data: { firstName?: string | null; email: string; confirmationUrl: string }): RenderedEmail {
  const body = `
    ${checkmarkSvg(80)}
    ${h1("Confirm your email", 28)}
    ${p(`Hi ${firstName(data.firstName)}, click below to verify your email address and activate your VitaSync account.`)}
    ${button("Confirm Email →", data.confirmationUrl)}
    ${sub("This link expires in 24 hours.<br/>If you didn't create a VitaSync account, you can safely ignore this email.")}
    ${divider()}
    ${p("For your security, we'll never ask for your password by email.", BRAND.footer, 12)}
  `;
  return {
    subject: "Confirm your VitaSync account",
    html: renderLayout({ preview: "One click and you're in.", body, recipientEmail: data.email }),
  };
}

// 3 — Password reset --------------------------------------------------------
export function passwordResetEmail(data: { email: string; resetUrl: string }): RenderedEmail {
  const body = `
    ${h1("Reset your password", 28)}
    ${p("We received a request to reset your VitaSync password. Click the button below to choose a new one.")}
    ${button("Reset Password →", data.resetUrl)}
    ${sub("This link expires in 1 hour.<br/>If you didn't request a reset, your account is safe — just ignore this email.")}
    ${divider()}
    ${p(`Need help? Contact us at <a href="mailto:support@vitasync.me" style="color:${BRAND.accent};">support@vitasync.me</a>`, BRAND.muted, 14)}
  `;
  return {
    subject: "Reset your VitaSync password",
    html: renderLayout({ preview: "Your reset link is valid for 1 hour.", body, recipientEmail: data.email }),
  };
}

// 4 — Quiz reminder (marketing) --------------------------------------------
export function quizReminderEmail(data: { firstName?: string | null; email: string }): RenderedEmail {
  const name = firstName(data.firstName);
  const body = `
    ${heroBand("Your personalized stack is just a quiz away")}
    ${h1("You're one quiz away from your personalized stack.", 28)}
    ${p(`Hi ${name},<br/><br/>You signed up yesterday but haven't completed your health quiz yet. It only takes 3 minutes — and it's how VitaSync builds your AI-personalized supplement stack.`)}
    ${iconRow([
      { icon: "✅", label: "Tailored to your goals" },
      { icon: "✅", label: "Adjusts monthly based on your feedback" },
    ])}
    ${button("Complete My Quiz →", `${SITE_URL}/onboarding`)}
    ${sub("Your quiz answers are private and never shared.")}
  `;
  return {
    subject: `${name}, your personalized stack is waiting 👋`,
    html: renderLayout({ preview: "3 minutes to unlock your AI wellness plan.", body, recipientEmail: data.email, showUnsubscribe: true }),
    listUnsubscribe: `<${unsubscribeUrl(data.email)}>, <mailto:unsubscribe@vitasync.me?subject=unsubscribe>`,
  };
}

// 5 — Stack ready -----------------------------------------------------------
export function stackReadyEmail(data: {
  firstName?: string | null;
  email: string;
  items: { product: string; benefit: string }[];
}): RenderedEmail {
  const lines = data.items.slice(0, 5).map(i => `· <strong style="color:${BRAND.text};">${esc(i.product)}</strong> — <span style="color:${BRAND.muted};">${esc(i.benefit)}</span>`).join("<br/>");
  const body = `
    ${h1("Your stack is ready.", 30)}
    ${p("Based on your health goals and lifestyle, your VitaSync AI coach has built your personalized supplement stack for this month.")}
    ${card(`<div style="color:${BRAND.accent};font-weight:700;margin-bottom:10px;">🧬 Your stack this month</div>${lines || `<span style="color:${BRAND.muted};">Sign in to view your recommendations.</span>`}`, true)}
    ${button("Review & Order My Stack →", `${SITE_URL}/dashboard?tab=stack`)}
    ${sub("Free to review. Subscribe to receive it monthly.")}
    ${divider()}
    ${p("Your AI coach refines your stack every month based on your feedback.", BRAND.muted, 14)}
  `;
  return {
    subject: `Your VitaSync stack is ready, ${firstName(data.firstName)} ✨`,
    html: renderLayout({ preview: "Your personalized supplement plan is here.", body, recipientEmail: data.email }),
  };
}

// 6 — Subscription confirmed ------------------------------------------------
export function subscriptionConfirmedEmail(data: {
  email: string;
  planName: string;
  amount: string;
  nextBillingDate: string;
  shippingAddress?: string;
}): RenderedEmail {
  const body = `
    ${checkmarkSvg(72)}
    ${h1("Subscription confirmed.", 28)}
    ${card(`
      <strong>Plan:</strong> ${esc(data.planName)}<br/>
      <strong>Amount:</strong> ${esc(data.amount)}/month<br/>
      <strong>Next billing date:</strong> ${esc(data.nextBillingDate)}<br/>
      ${data.shippingAddress ? `<strong>Shipping to:</strong> ${esc(data.shippingAddress)}` : ""}
    `)}
    ${p("Your first stack will be prepared and shipped within 3-5 business days. Your AI coach will check in with you every month to adjust your stack.")}
    ${button("Track My Order →", `${SITE_URL}/dashboard`)}
    ${divider()}
    ${p(`Manage your subscription anytime at <a href="${SITE_URL}/account" style="color:${BRAND.accent};">vitasync.me/account</a><br/>Questions? <a href="mailto:support@vitasync.me" style="color:${BRAND.accent};">support@vitasync.me</a>`, BRAND.muted, 14)}
  `;
  return {
    subject: `You're subscribed to VitaSync ${data.planName} 🎉`,
    html: renderLayout({ preview: "Your wellness journey starts now.", body, recipientEmail: data.email }),
  };
}

// 7 — Stack shipped ---------------------------------------------------------
export function stackShippedEmail(data: {
  email: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string;
  estimatedDelivery: string;
}): RenderedEmail {
  const body = `
    ${h1("Your stack is shipped!", 28)}
    ${card(`
      <strong>📦 Order #${esc(data.orderNumber)}</strong><br/>
      <strong>Carrier:</strong> ${esc(data.carrier)}<br/>
      <strong>Tracking:</strong> ${esc(data.trackingNumber)}<br/>
      <strong>Estimated delivery:</strong> ${esc(data.estimatedDelivery)}
    `)}
    ${button("Track My Package →", data.trackingUrl)}
    ${p("While you wait, your AI coach is already preparing next month's adjustments based on your goals.")}
    ${divider()}
    ${p("Not what you expected? Reply to this email and we'll make it right.", BRAND.muted, 14)}
  `;
  return {
    subject: "Your VitaSync stack is on its way 📦",
    html: renderLayout({ preview: `Estimated delivery: ${data.estimatedDelivery}`, body, recipientEmail: data.email }),
  };
}

// 8 — Monthly check-in (marketing) -----------------------------------------
export function monthlyCheckinEmail(data: { firstName?: string | null; email: string }): RenderedEmail {
  const body = `
    ${aiAvatar()}
    ${h1("Time for your monthly check-in.", 28)}
    ${p(`Hi ${firstName(data.firstName)},<br/><br/>Your AI coach is preparing next month's stack. Before I finalize it, I want to know: how did this month's supplements work for you?<br/><br/>Your feedback directly shapes what I recommend next.`)}
    ${button("Give My Feedback →", `${SITE_URL}/dashboard?tab=checkin`)}
    ${sub("Takes 2 minutes. Your answers improve your next stack.")}
  `;
  return {
    subject: "How's your stack working for you? 💬",
    html: renderLayout({ preview: "Your AI coach wants to hear from you.", body, recipientEmail: data.email, showUnsubscribe: true }),
    listUnsubscribe: `<${unsubscribeUrl(data.email)}>, <mailto:unsubscribe@vitasync.me?subject=unsubscribe>`,
  };
}

// 9 — Subscription cancelled ------------------------------------------------
export function subscriptionCancelledEmail(data: {
  firstName?: string | null;
  email: string;
  endDate: string;
}): RenderedEmail {
  const body = `
    ${h1("Subscription cancelled.", 28)}
    ${p(`Hi ${firstName(data.firstName)},<br/><br/>Your VitaSync subscription has been cancelled. You'll still have access to your AI coach until <strong>${esc(data.endDate)}</strong>.<br/><br/>We'd love to know why you left — it helps us improve.`)}
    <div style="text-align:center;margin:8px 0 24px;">
      ${ghostButton("Tell Us Why", `${SITE_URL}/feedback?reason=cancel`)}
      ${ghostButton("Reactivate Subscription", `${SITE_URL}/account`)}
    </div>
    ${p(`Changed your mind? You can reactivate anytime at <a href="${SITE_URL}/account" style="color:${BRAND.accent};">vitasync.me/account</a>`, BRAND.muted, 14)}
  `;
  return {
    subject: "Your VitaSync subscription has been cancelled",
    html: renderLayout({ preview: "We're sorry to see you go.", body, recipientEmail: data.email }),
  };
}

// 10 — Pro upsell (marketing) ----------------------------------------------
export function proUpsellEmail(data: { firstName?: string | null; email: string }): RenderedEmail {
  const row = (feat: string, free: string, pro: string) =>
    `<tr>
      <td style="padding:10px 12px;border-top:1px solid ${BRAND.border};color:${BRAND.text};font-size:14px;">${esc(feat)}</td>
      <td style="padding:10px 12px;border-top:1px solid ${BRAND.border};color:${BRAND.muted};font-size:14px;text-align:center;">${free}</td>
      <td style="padding:10px 12px;border-top:1px solid ${BRAND.border};color:${BRAND.accent};font-size:14px;text-align:center;font-weight:600;">${pro}</td>
    </tr>`;
  const body = `
    ${heroBand("Pro members go 3× deeper")}
    ${h1("You're leaving results on the table.", 28)}
    ${p("Your free plan gives you a taste of VitaSync. Pro members get deeper AI coaching, priority stack adjustments, and exclusive supplement access.")}
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${BRAND.cardAlt};border-radius:12px;margin:0 0 24px;overflow:hidden;">
      <thead><tr>
        <th align="left" style="padding:12px;color:${BRAND.muted};font-size:12px;text-transform:uppercase;font-weight:600;">Feature</th>
        <th style="padding:12px;color:${BRAND.muted};font-size:12px;text-transform:uppercase;font-weight:600;text-align:center;">Free</th>
        <th style="padding:12px;color:${BRAND.accent};font-size:12px;text-transform:uppercase;font-weight:700;text-align:center;">Pro ✅</th>
      </tr></thead>
      <tbody>
        ${row("AI coaching", "Basic", "Advanced")}
        ${row("Monthly stack", "View only", "Delivered")}
        ${row("Coach check-ins", "Monthly", "Weekly")}
        ${row("Exclusive products", "—", "✅")}
      </tbody>
    </table>
    ${button("Upgrade to Pro — $7.99/month →", `${SITE_URL}/account?upgrade=pro`)}
    ${sub("Cancel anytime. No hidden fees.")}
  `;
  return {
    subject: `${firstName(data.firstName)}, unlock your full AI coaching experience`,
    html: renderLayout({ preview: "Pro members get 3x more personalized recommendations.", body, recipientEmail: data.email, showUnsubscribe: true }),
    listUnsubscribe: `<${unsubscribeUrl(data.email)}>, <mailto:unsubscribe@vitasync.me?subject=unsubscribe>`,
  };
}

// Router --------------------------------------------------------------------
export function renderTemplate(name: EmailTemplateName, data: Record<string, any>): RenderedEmail {
  switch (name) {
    case "welcome": return welcomeEmail(data as any);
    case "confirm_account": return confirmAccountEmail(data as any);
    case "password_reset": return passwordResetEmail(data as any);
    case "quiz_reminder": return quizReminderEmail(data as any);
    case "stack_ready": return stackReadyEmail(data as any);
    case "subscription_confirmed": return subscriptionConfirmedEmail(data as any);
    case "stack_shipped": return stackShippedEmail(data as any);
    case "monthly_checkin": return monthlyCheckinEmail(data as any);
    case "subscription_cancelled": return subscriptionCancelledEmail(data as any);
    case "pro_upsell": return proUpsellEmail(data as any);
    default: {
      const _exhaust: never = name;
      throw new Error(`Unknown template: ${_exhaust}`);
    }
  }
}