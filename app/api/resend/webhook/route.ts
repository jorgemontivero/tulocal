import { NextRequest, NextResponse } from "next/server";
import { Resend, type WebhookEventPayload } from "resend";

/** Webhooks usan APIs de Node (crypto); evita edge por compatibilidad con Svix. */
export const runtime = "nodejs";

function handleWebhookEvent(event: WebhookEventPayload): void {
  switch (event.type) {
    case "email.received":
      // Correo entrante (inbound). Amplía aquí: guardar en BD, reenviar, etc.
      break;
    case "email.delivered":
    case "email.bounced":
    case "email.complained":
    case "email.delivery_delayed":
    case "email.failed":
    case "email.opened":
    case "email.clicked":
    case "email.sent":
    case "email.scheduled":
    case "email.suppressed":
      break;
    default:
      break;
  }

  if (process.env.NODE_ENV === "development") {
    console.info("[resend webhook]", event.type);
  }
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET?.trim();
  if (!webhookSecret) {
    return new NextResponse("Webhook not configured", { status: 500 });
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return new NextResponse("Resend API key not configured", { status: 500 });
  }

  const id = req.headers.get("svix-id");
  const timestamp = req.headers.get("svix-timestamp");
  const signature = req.headers.get("svix-signature");

  if (!id || !timestamp || !signature) {
    return new NextResponse("Missing webhook signature headers", { status: 400 });
  }

  const payload = await req.text();

  const resend = new Resend(apiKey);

  let event: WebhookEventPayload;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id, timestamp, signature },
      webhookSecret,
    });
  } catch {
    return new NextResponse("Invalid webhook signature", { status: 400 });
  }

  handleWebhookEvent(event);

  return new NextResponse(null, { status: 204 });
}
