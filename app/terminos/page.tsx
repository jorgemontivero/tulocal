import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Términos y Condiciones | tulocal.com.ar",
  description:
    "Términos y condiciones de uso del directorio comercial tulocal.com.ar. Catamarca, Argentina.",
};

export default function TerminosPage() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-zinc-900">
      <main className="flex-1 px-4 py-10 sm:px-6 sm:py-16">
        <article className="prose prose-zinc mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm text-zinc-500">Última actualización: abril de 2026</p>

          <h2>1. Identificación del sitio</h2>
          <p>
            El presente sitio web, <strong>tulocal.com.ar</strong> (en adelante, "Tu Local" o "la
            Plataforma"), es un directorio comercial en línea operado por{" "}
            <strong>Jorge Luis Montivero</strong>, con domicilio en la provincia de Catamarca,
            República Argentina.
          </p>

          <h2>2. Objeto</h2>
          <p>
            Tu Local funciona como un directorio que conecta a usuarios con comercios y servicios
            locales de Catamarca. La Plataforma permite a los comerciantes registrados publicar
            información sobre sus negocios, productos y servicios, y a los usuarios consultar
            dicha información de forma gratuita.
          </p>

          <h2>3. Aceptación de los términos</h2>
          <p>
            El acceso y uso de Tu Local implica la aceptación plena e incondicional de los
            presentes Términos y Condiciones. Si no estás de acuerdo con alguna disposición, te
            pedimos que no utilices la Plataforma.
          </p>

          <h2>4. Registro de comercios</h2>
          <ul>
            <li>
              El comerciante es el único responsable de la veracidad, exactitud y vigencia de la
              información publicada sobre su negocio.
            </li>
            <li>
              Tu Local se reserva el derecho de rechazar, editar o eliminar cualquier publicación
              que contenga información falsa, ilegal, ofensiva o que infrinja derechos de
              terceros.
            </li>
            <li>
              El registro implica la autorización para que Tu Local muestre públicamente la
              información comercial proporcionada (nombre, dirección, descripción, imágenes,
              datos de contacto, etc.).
            </li>
          </ul>

          <h2>5. Uso aceptable</h2>
          <p>Los usuarios y comerciantes se comprometen a:</p>
          <ul>
            <li>No utilizar la Plataforma con fines ilícitos o contrarios a la buena fe.</li>
            <li>No publicar contenido difamatorio, discriminatorio u ofensivo.</li>
            <li>No intentar acceder a cuentas de otros usuarios.</li>
            <li>
              No realizar acciones que puedan dañar, sobrecargar o deteriorar el funcionamiento
              de la Plataforma.
            </li>
          </ul>

          <h2>6. Propiedad intelectual</h2>
          <p>
            El diseño, la marca, los logotipos, textos y demás contenidos de Tu Local son
            propiedad de Jorge Luis Montivero o se utilizan con la debida autorización. Queda
            prohibida su reproducción total o parcial sin consentimiento expreso.
          </p>
          <p>
            Los comerciantes conservan la titularidad de sus propios contenidos (logos, imágenes
            de productos, descripciones) y otorgan a Tu Local una licencia no exclusiva para
            mostrarlos en la Plataforma.
          </p>

          <h2>7. Limitación de responsabilidad</h2>
          <ul>
            <li>
              Tu Local actúa exclusivamente como intermediario entre comerciantes y usuarios. No
              garantiza la calidad, seguridad ni legalidad de los productos o servicios
              publicados.
            </li>
            <li>
              Las transacciones comerciales se realizan directamente entre el usuario y el
              comerciante. Tu Local no interviene ni es responsable por disputas derivadas de
              dichas operaciones.
            </li>
            <li>
              Tu Local no será responsable por daños directos o indirectos derivados de la
              interrupción, errores técnicos o indisponibilidad temporal de la Plataforma.
            </li>
          </ul>

          <h2>8. Modificaciones</h2>
          <p>
            Tu Local se reserva el derecho de modificar los presentes Términos y Condiciones en
            cualquier momento. Las modificaciones serán publicadas en esta misma página y
            entrarán en vigencia a partir de su publicación. El uso continuado de la Plataforma
            tras las modificaciones implica su aceptación.
          </p>

          <h2>9. Legislación aplicable y jurisdicción</h2>
          <p>
            Los presentes Términos se rigen por las leyes de la República Argentina. Para
            cualquier controversia derivada del uso de Tu Local, las partes se someten a la
            jurisdicción de los tribunales ordinarios de la provincia de Catamarca.
          </p>

          <h2>10. Contacto</h2>
          <p>
            Para consultas sobre estos términos, podés comunicarte a través de la página de{" "}
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
