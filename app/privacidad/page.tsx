import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Política de Privacidad | tulocal.com.ar",
  description:
    "Política de privacidad y protección de datos personales del directorio comercial tulocal.com.ar. Catamarca, Argentina.",
};

export default function PrivacidadPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-zinc-900">
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <article className="prose prose-zinc mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Política de Privacidad
          </h1>
          <p className="text-sm text-zinc-500">Última actualización: abril de 2026</p>

          <h2>1. Responsable del tratamiento</h2>
          <p>
            El responsable del tratamiento de los datos personales recabados a través de{" "}
            <strong>tulocal.com.ar</strong> (en adelante, "Tu Local" o "la Plataforma") es{" "}
            <strong>Jorge Luis Montivero</strong>, con domicilio en la provincia de Catamarca,
            República Argentina.
          </p>

          <h2>2. Marco legal</h2>
          <p>
            El tratamiento de datos personales en Tu Local se rige por la{" "}
            <strong>Ley N.° 25.326 de Protección de Datos Personales</strong> de la República
            Argentina y su Decreto Reglamentario N.° 1558/2001, así como por las disposiciones
            de la Agencia de Acceso a la Información Pública (AAIP) en su carácter de autoridad
            de aplicación.
          </p>

          <h2>3. Datos que recopilamos</h2>

          <h3>3.1 Usuarios generales</h3>
          <p>
            La navegación por Tu Local no requiere registro. No recopilamos datos personales
            identificables de los visitantes que solo consultan el directorio.
          </p>

          <h3>3.2 Comerciantes registrados</h3>
          <p>
            Al registrarte como comerciante, recopilamos los datos que proporcionás
            voluntariamente:
          </p>
          <ul>
            <li>Nombre y apellido</li>
            <li>Correo electrónico</li>
            <li>Número de teléfono / WhatsApp</li>
            <li>Nombre del comercio, dirección, descripción, logo e imágenes de productos</li>
            <li>Usuario de Instagram (opcional)</li>
          </ul>

          <h3>3.3 Formulario de contacto</h3>
          <p>
            Si nos escribís a través del formulario de contacto, recopilamos tu nombre, correo
            electrónico, teléfono y el contenido del mensaje para poder responderte.
          </p>

          <h2>4. Finalidad del tratamiento</h2>
          <p>Los datos personales se utilizan exclusivamente para:</p>
          <ul>
            <li>Publicar y mostrar la información comercial en el directorio.</li>
            <li>Permitir que los usuarios contacten a los comercios.</li>
            <li>Responder consultas recibidas a través del formulario de contacto.</li>
            <li>Mejorar el funcionamiento y la experiencia de uso de la Plataforma.</li>
            <li>Enviar comunicaciones relacionadas con el servicio (si corresponde).</li>
          </ul>

          <h2>5. Métricas de rendimiento y analítica</h2>
          <p>
            Tu Local utiliza <strong>Vercel Analytics</strong> y{" "}
            <strong>Vercel Speed Insights</strong> para recopilar métricas anónimas de
            rendimiento del sitio web. Estas herramientas registran datos técnicos como tiempos
            de carga, tipo de dispositivo y navegador, sin identificar personalmente a los
            visitantes. No se utilizan cookies de rastreo publicitario.
          </p>
          <p>
            Estos datos nos permiten detectar problemas de rendimiento y mejorar la velocidad y
            estabilidad de la Plataforma para todos los usuarios.
          </p>

          <h2>6. Compartición de datos</h2>
          <p>
            Tu Local no vende, alquila ni comparte datos personales con terceros con fines
            comerciales o publicitarios. Los datos pueden ser compartidos únicamente en los
            siguientes casos:
          </p>
          <ul>
            <li>
              Con proveedores tecnológicos necesarios para el funcionamiento de la Plataforma
              (hosting, almacenamiento, envío de correos), quienes operan bajo obligaciones de
              confidencialidad.
            </li>
            <li>Cuando sea requerido por orden judicial o autoridad competente.</li>
          </ul>

          <h2>7. Almacenamiento y seguridad</h2>
          <p>
            Los datos se almacenan en servidores seguros proporcionados por Supabase y Vercel.
            Implementamos medidas técnicas y organizativas razonables para proteger los datos
            contra acceso no autorizado, pérdida o alteración. No obstante, ningún sistema de
            almacenamiento es completamente infalible.
          </p>

          <h2>8. Derechos del titular</h2>
          <p>
            De acuerdo con la Ley 25.326, como titular de datos personales tenés derecho a:
          </p>
          <ul>
            <li>
              <strong>Acceso:</strong> solicitar información sobre los datos personales que
              tenemos sobre vos.
            </li>
            <li>
              <strong>Rectificación:</strong> solicitar la corrección de datos inexactos o
              incompletos.
            </li>
            <li>
              <strong>Supresión:</strong> solicitar la eliminación de tus datos cuando ya no sean
              necesarios para la finalidad para la que fueron recabados.
            </li>
            <li>
              <strong>Oposición:</strong> oponerte al tratamiento de tus datos en determinadas
              circunstancias.
            </li>
          </ul>
          <p>
            Para ejercer estos derechos, podés comunicarte a través de la página de{" "}
            <Link href="/contacto" className="text-emerald-700 underline hover:text-emerald-900">
              Contacto
            </Link>
            .
          </p>
          <p className="text-sm text-zinc-600">
            La AGENCIA DE ACCESO A LA INFORMACIÓN PÚBLICA, en su carácter de Órgano de Control
            de la Ley N.° 25.326, tiene la atribución de atender las denuncias y reclamos que
            interpongan quienes resulten afectados en sus derechos por incumplimiento de las
            normas vigentes en materia de protección de datos personales.
          </p>

          <h2>9. Conservación de datos</h2>
          <p>
            Los datos personales serán conservados mientras la cuenta del comerciante permanezca
            activa o mientras sean necesarios para cumplir con las finalidades descritas. Podés
            solicitar la eliminación de tu cuenta y datos en cualquier momento.
          </p>

          <h2>10. Modificaciones</h2>
          <p>
            Tu Local se reserva el derecho de modificar esta Política de Privacidad en cualquier
            momento. Los cambios serán publicados en esta misma página con la fecha de
            actualización. El uso continuado de la Plataforma tras las modificaciones implica su
            aceptación.
          </p>

          <h2>11. Contacto</h2>
          <p>
            Para consultas sobre privacidad o protección de datos, podés comunicarte a través de
            la página de{" "}
            <Link href="/contacto" className="text-emerald-700 underline hover:text-emerald-900">
              Contacto
            </Link>{" "}
            o por WhatsApp al número indicado en el sitio.
          </p>

          <div className="mt-12 not-prose">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700"
            >
              <ArrowLeft className="size-4" />
              Volver al inicio
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
