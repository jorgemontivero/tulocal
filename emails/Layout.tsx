import * as React from "react";
import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

type EmailLayoutProps = {
  children: React.ReactNode;
  previewText?: string;
  baseUrl?: string;
};

const DEFAULT_BASE_URL = "https://tulocal.com.ar";

export function EmailLayout({
  children,
  previewText = "Tu Local - Notificacion",
  baseUrl = DEFAULT_BASE_URL,
}: EmailLayoutProps) {
  const normalizedBaseUrl = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const logoUrl = `${normalizedBaseUrl}/logo-tulocal.png`;

  return (
    <Html lang="es">
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind
        config={{
          theme: {
            extend: {
              colors: {
                brand: {
                  600: "#059669",
                  700: "#047857",
                  800: "#065f46",
                  950: "#042f2e",
                },
                dark: {
                  900: "#0f172a",
                  950: "#020617",
                },
              },
            },
          },
        }}
      >
        <Body className="m-0 bg-dark-950 px-0 py-8 font-sans text-slate-100">
          <Container className="mx-auto w-full max-w-[620px] overflow-hidden rounded-xl border border-brand-800/70 bg-dark-900 shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
            <Section className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 px-6 py-6">
              <Link href={normalizedBaseUrl}>
                <Img
                  src={logoUrl}
                  alt="tulocal.com.ar"
                  width="180"
                  height="44"
                  className="h-auto w-auto"
                />
              </Link>
              <Text className="m-0 mt-3 text-sm text-emerald-100">
                Potenciando el comercio local de Catamarca
              </Text>
            </Section>

            <Section className="px-6 py-6 text-slate-200">{children}</Section>

            <Hr className="m-0 border-slate-700" />

            <Section className="px-6 py-5 text-center">
              <Text className="m-0 text-xs text-slate-400">
                © {new Date().getFullYear()} tulocal.com.ar
              </Text>
              <Text className="m-0 mt-2 text-xs text-slate-400">
                <Link href={`${normalizedBaseUrl}/terminos`} className="text-emerald-300">
                  Terminos y condiciones
                </Link>{" "}
                ·{" "}
                <Link href={`${normalizedBaseUrl}/privacidad`} className="text-emerald-300">
                  Politica de privacidad
                </Link>{" "}
                ·{" "}
                <Link href={`${normalizedBaseUrl}/contacto`} className="text-emerald-300">
                  Contacto
                </Link>
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default EmailLayout;
