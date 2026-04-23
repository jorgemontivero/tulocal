import * as React from "react";
import { Button, Heading, Section, Text } from "@react-email/components";
import Layout from "@/emails/Layout";

type VisitorCouponProps = {
  couponCode?: string;
  baseUrl?: string;
};

export function VisitorCoupon({
  couponCode = "BIENVENIDO10",
  baseUrl,
}: VisitorCouponProps) {
  const normalizedBaseUrl = (baseUrl ?? "https://tulocal.com.ar").replace(/\/$/, "");

  return (
    <Layout
      baseUrl={baseUrl}
      previewText="Gracias por sumarte a Tu Local - aqui tenes tu cupon"
    >
      <Section>
        <Heading className="m-0 text-2xl font-bold leading-tight text-white">
          Gracias por sumarte a Tu Local
        </Heading>
        <Text className="mb-0 mt-4 text-base leading-7 text-slate-200">
          Nos alegra tenerte en la comunidad de visitantes de Catamarca.
        </Text>
        <Text className="mb-0 mt-3 text-base leading-7 text-slate-300">
          Como bienvenida, te regalamos este codigo para usar en promociones
          participantes:
        </Text>
      </Section>

      <Section className="mt-6 rounded-xl border border-emerald-700/60 bg-emerald-950/60 px-4 py-4 text-center">
        <Text className="m-0 text-xs uppercase tracking-[0.2em] text-emerald-300">
          Codigo de descuento
        </Text>
        <Text className="m-0 mt-2 text-3xl font-extrabold tracking-[0.08em] text-white">
          {couponCode}
        </Text>
      </Section>

      <Section className="mt-8 text-center">
        <Button
          href={`${normalizedBaseUrl}/mapa`}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white no-underline"
        >
          Ver promociones cerca mio
        </Button>
      </Section>

      <Section className="mt-8">
        <Text className="m-0 text-sm leading-6 text-slate-400">
          Este cupon es de ejemplo y puede estar sujeto a condiciones segun cada
          comercio adherido.
        </Text>
      </Section>
    </Layout>
  );
}

export default VisitorCoupon;
