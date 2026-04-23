"use server";

import { Resend } from "resend";
import { contactFormSchema } from "@/lib/contact-schemas";

export type ContactActionResult =
  | { ok: true }
  | { ok: false; error: string };

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeHtmlAttr(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

export async function sendContactMessage(
  input: unknown,
): Promise<ContactActionResult> {
  const parsed = contactFormSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Datos invalidos.",
    };
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.error(
      "[contacto] Falta RESEND_API_KEY en el servidor. En Vercel: Settings → Environment Variables → Production, añadí RESEND_API_KEY y redeploy.",
    );
    return {
      ok: false,
      error:
        "El envio de correo no esta configurado. Intenta mas tarde o escribinos por WhatsApp.",
    };
  }
  const fromEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!fromEmail) {
    console.error(
      "[contacto] Falta RESEND_FROM_EMAIL en el servidor. Debe ser un correo verificado en Resend (ej: Tu Local <consultas@tulocal.com.ar>).",
    );
    return {
      ok: false,
      error:
        "El envio de correo no esta configurado correctamente. Intenta mas tarde o escribinos por WhatsApp.",
    };
  }
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();
  if (!toEmail) {
    console.error(
      "[contacto] Falta CONTACT_TO_EMAIL en el servidor. Debe ser la bandeja de destino (ej: info@tulocal.com.ar).",
    );
    return {
      ok: false,
      error:
        "El envio de correo no esta configurado correctamente. Intenta mas tarde o escribinos por WhatsApp.",
    };
  }

  const { name, email, phone, subject, message } = parsed.data;
  const subjectName = name.replace(/[\r\n]+/g, " ").trim();
  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const mailHref = `mailto:${encodeURIComponent(email)}`;
  const phoneTrimmed = phone.trim();
  const safePhone = phoneTrimmed ? escapeHtml(phoneTrimmed) : "";
  const digits = phoneTrimmed.replace(/\D/g, "");
  const telHref =
    digits.length >= 6 ? `tel:${phoneTrimmed.replace(/\s/g, "")}` : "";
  const phoneRowHtml = phoneTrimmed
    ? `<p style="margin:0 0 16px;"><strong style="color:#0f172a;">Teléfono</strong><br />${
        telHref
          ? `<a href="${escapeHtmlAttr(telHref)}" style="color:#059669;">${safePhone}</a>`
          : safePhone
      }</p>`
    : `<p style="margin:0 0 16px;"><strong style="color:#0f172a;">Teléfono</strong><br /><span style="color:#64748b;">No indicado</span></p>`;
  const safeSubject = escapeHtml(subject);
  const safeMessage = escapeHtml(message).replace(/\n/g, "<br />");

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: toEmail,
    replyTo: email,
    subject: `Nueva consulta en tu local - ${subjectName}`,
    html: `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:system-ui,-apple-system,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f8fafc;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,.08);">
          <tr>
            <td style="background:#059669;padding:20px 24px;color:#ffffff;font-size:18px;font-weight:700;">
              Nueva consulta — tulocal.com.ar
            </td>
          </tr>
          <tr>
            <td style="padding:24px;color:#1e293b;font-size:15px;line-height:1.6;">
              <p style="margin:0 0 16px;"><strong style="color:#0f172a;">Nombre</strong><br />${safeName}</p>
              <p style="margin:0 0 16px;"><strong style="color:#0f172a;">Email</strong><br /><a href="${mailHref}" style="color:#059669;">${safeEmail}</a></p>
              ${phoneRowHtml}
              <p style="margin:0 0 16px;"><strong style="color:#0f172a;">Asunto de la consulta</strong><br />${safeSubject}</p>
              <p style="margin:0 0 8px;"><strong style="color:#0f172a;">Mensaje</strong></p>
              <div style="border:1px solid #e2e8f0;border-radius:8px;padding:16px;background:#f8fafc;color:#334155;">
                ${safeMessage}
              </div>
            </td>
          </tr>
        </table>
        <p style="margin:16px 0 0;font-size:12px;color:#64748b;">Este mensaje fue enviado desde el formulario de contacto del sitio.</p>
      </td>
    </tr>
  </table>
</body>
</html>`,
  });

  if (error) {
    console.error("[contacto] Resend API:", error.message);
    return {
      ok: false,
      error:
        "No pudimos enviar el mensaje en este momento. Intenta de nuevo o escribinos por WhatsApp.",
    };
  }

  return { ok: true };
}
