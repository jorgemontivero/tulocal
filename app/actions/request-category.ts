"use server";

import { Resend } from "resend";
import { createClient } from "@/utils/supabase/server";

export type RequestCategoryResult = { ok: boolean; error?: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function requestCategory(input: {
  requestedName: string;
  kind: "category" | "subcategory";
  businessType: string;
  parentCategoryName?: string;
}): Promise<RequestCategoryResult> {
  const { requestedName, kind, businessType, parentCategoryName } = input;

  const safeName = requestedName.trim();
  if (!safeName || safeName.length < 2) {
    return { ok: false, error: "Ingresá el nombre del rubro." };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();

  if (!apiKey || !fromEmail || !toEmail) {
    console.error("[request-category] Missing Resend env vars");
    return { ok: false, error: "No se pudo enviar la solicitud. Intenta más tarde." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const userEmail = user?.email ?? "No indicado";

  const isSubcat = kind === "subcategory";
  const subjectLabel = isSubcat ? "subcategoría" : "rubro";
  const subject = `[Solicitud de ${subjectLabel}] ${safeName}`;
  const businessTypeLabel = businessType === "servicio" ? "Servicios" : "Productos";

  const parentRow =
    isSubcat && parentCategoryName
      ? `<p style="margin:0 0 16px;"><strong style="color:#0f172a;">Categoría padre</strong><br />${escapeHtml(parentCategoryName)}</p>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr>
            <td style="background:#059669;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:700;">
              Solicitud de ${escapeHtml(subjectLabel)} — tulocal.com.ar
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:#1e293b;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px;"><strong style="color:#0f172a;">${isSubcat ? "Subcategoría" : "Rubro"} solicitado</strong><br />${escapeHtml(safeName)}</p>
              ${parentRow}
              <p style="margin:0 0 16px;"><strong style="color:#0f172a;">Tipo de negocio</strong><br />${escapeHtml(businessTypeLabel)}</p>
              <p style="margin:0 0 16px;"><strong style="color:#0f172a;">Email del vendedor</strong><br />${escapeHtml(userEmail)}</p>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#64748b;">Enviado desde el formulario de nuevo local en tulocal.com.ar.</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: fromEmail, to: toEmail, subject, html });

  if (error) {
    console.error("[request-category] Resend:", error.message);
    return { ok: false, error: "No pudimos enviar la solicitud. Intentá más tarde." };
  }

  return { ok: true };
}
