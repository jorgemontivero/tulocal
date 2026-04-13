import Image from "next/image";
import Link from "next/link";
import { Poppins } from "next/font/google";
import type { Metadata } from "next";
import { ContactForm } from "@/app/contacto/contact-form";
import { SiteFooter } from "@/components/site-footer";

const brandSans = Poppins({
  subsets: ["latin"],
  weight: ["800"],
  style: ["italic"],
  display: "swap",
});

const WHATSAPP_HREF =
  "https://wa.me/5493834997929?text=" +
  encodeURIComponent("Hola, escribo desde tulocal.com.ar — ");

export const metadata: Metadata = {
  title: "Contacto | Tu Local",
  description: "Escribinos por consultas o WhatsApp. tulocal.com.ar",
};

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.52 3.48A11.88 11.88 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.11.55 4.1 1.52 5.83L0 24l6.33-1.67A11.94 11.94 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.21-1.25-6.12-3.29-8.28zM12 22a9.88 9.88 0 0 1-5.05-1.38l-.36-.21-3.67.97.98-3.58-.23-.38A9.86 9.86 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.26-7.06c-.29-.15-1.71-.84-1.98-.94-.27-.1-.47-.15-.67.15-.2.3-.77.94-.94 1.12-.17.18-.35.2-.64.07-.29-.13-1.22-.45-2.32-1.43-.86-.77-1.44-1.72-1.61-2.01-.17-.29-.02-.45.13-.59.13-.13.29-.35.44-.52.15-.17.2-.29.3-.48.1-.2.05-.37-.02-.52-.07-.15-.67-1.61-.92-2.21-.24-.59-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.47 0 1.45 1.05 2.86 1.2 3.06.15.2 2.07 3.17 5.02 4.45.7.3 1.25.48 1.68.62.71.23 1.35.19 1.86.12.57-.08 1.71-.7 1.95-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.2-.55-.35z" />
    </svg>
  );
}

export default function ContactoPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-zinc-900">
      <main className="flex-1 px-4 pb-16 pt-6">
      <div className="mx-auto mt-10 max-w-4xl rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <Link
          href="/"
          className="mb-8 flex items-center gap-3 rounded-lg outline-offset-4 hover:opacity-90"
        >
          <Image
            src="/logo-tulocal.png"
            alt="tulocal.com.ar"
            width={200}
            height={48}
            className="h-10 w-auto object-contain"
          />
          <span
            className={`${brandSans.className} text-2xl font-extrabold italic tracking-tight text-slate-900`}
          >
            Tu Local
          </span>
        </Link>

        <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">Contacto</h1>
        <p className="mt-2 text-slate-700">
          ¿Tenés dudas sobre el directorio o querés sumar tu comercio? Estamos para ayudarte.
        </p>

        <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-12">
          <section className="space-y-4" aria-labelledby="contacto-info-heading">
            <h2
              id="contacto-info-heading"
              className="text-lg font-bold text-slate-900"
            >
              Información de contacto
            </h2>
            <p className="text-sm leading-relaxed text-slate-700">
              Podés escribirnos por correo con el formulario o, si preferís una respuesta mas
              rápida, chateanos por WhatsApp. Respondemos en horario hábil lo antes posible.
            </p>

            <a
              href={WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-xl border-2 border-emerald-500/40 bg-emerald-50/80 p-4 text-emerald-900 transition-colors hover:border-emerald-600 hover:bg-emerald-600 hover:text-white"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white transition-colors group-hover:bg-white group-hover:text-emerald-600">
                <WhatsAppIcon className="size-7" />
              </span>
              <span className="min-w-0 text-left">
                <span className="block text-sm font-semibold">WhatsApp</span>
                <span className="mt-0.5 block text-xs text-emerald-800/90 group-hover:text-white/95">
                  +54 9 383 499-7929 — Tocá para abrir el chat
                </span>
              </span>
            </a>
          </section>

          <section aria-labelledby="contacto-form-heading">
            <h2
              id="contacto-form-heading"
              className="mb-4 text-lg font-bold text-slate-900"
            >
              Formulario
            </h2>
            <ContactForm />
          </section>
        </div>
      </div>
      </main>

      <SiteFooter />
    </div>
  );
}
