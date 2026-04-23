import * as React from "react";
import { Button, Heading, Section, Text } from "@react-email/components";
import Layout from "@/emails/Layout";

type MerchantWelcomeProps = {
  merchantName: string;
  profileUrl: string;
  baseUrl?: string;
};

export function MerchantWelcome({
  merchantName,
  profileUrl,
  baseUrl,
}: MerchantWelcomeProps) {
  return (
    <Layout
      baseUrl={baseUrl}
      previewText={`Bienvenido a Tu Local, ${merchantName}`}
    >
      <Section>
        <Heading className="m-0 text-2xl font-bold leading-tight text-white">
          Bienvenido a Tu Local
        </Heading>
        <Text className="mb-0 mt-4 text-base leading-7 text-slate-200">
          Hola {merchantName}, gracias por sumarte a la comunidad de comercios
          de Catamarca.
        </Text>
        <Text className="mb-0 mt-3 text-base leading-7 text-slate-300">
          Tu local ya fue recibido y esta en proceso de revision. Apenas quede
          aprobado, estara visible en el directorio para miles de personas.
        </Text>
      </Section>

      <Section className="mt-8 text-center">
        <Button
          href={profileUrl}
          className="rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white no-underline"
        >
          Completar mi Perfil
        </Button>
      </Section>

      <Section className="mt-8">
        <Text className="m-0 text-sm leading-6 text-slate-400">
          Consejo: cuanto mas completo este tu perfil (descripcion, fotos,
          horarios y datos de contacto), mejores resultados vas a tener.
        </Text>
      </Section>
    </Layout>
  );
}

export default MerchantWelcome;
