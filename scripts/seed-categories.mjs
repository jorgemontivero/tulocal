/**
 * Población one-off de categories + subcategories desde los CSV en /data.
 *
 * Requiere en el entorno (p. ej. .env.local cargado con --env-file):
 *   NEXT_PUBLIC_SUPABASE_URL  o SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (recomendado; bypass RLS en inserts)
 *
 * Ejecutar desde la raíz del repo:
 *   node --env-file=.env.local scripts/seed-categories.mjs
 *
 * O en Windows PowerShell:
 *   node --env-file=.env.local ./scripts/seed-categories.mjs
 */

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error(
    "Faltan SUPABASE_URL (o NEXT_PUBLIC_SUPABASE_URL) y SUPABASE_SERVICE_ROLE_KEY en el entorno.",
  );
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

function parseCsvRows(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  const lines = raw.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(";");
    const cat = (parts[0] ?? "").trim();
    const sub = (parts[1] ?? "").trim();
    if (cat && sub) rows.push({ categoryName: cat, subcategoryName: sub });
  }
  return rows;
}

async function getOrCreateCategory(name, businessType) {
  const { data: found, error: findErr } = await supabase
    .from("categories")
    .select("id")
    .eq("name", name)
    .eq("business_type", businessType)
    .maybeSingle();

  if (findErr) throw findErr;
  if (found) return found.id;

  const { data: inserted, error: insErr } = await supabase
    .from("categories")
    .insert({ name, business_type: businessType })
    .select("id")
    .single();

  if (insErr) throw insErr;
  return inserted.id;
}

async function insertSubcategoryIfNeeded(categoryId, name) {
  const { data: found } = await supabase
    .from("subcategories")
    .select("id")
    .eq("category_id", categoryId)
    .eq("name", name)
    .maybeSingle();

  if (found) return { skipped: true };

  const { error } = await supabase.from("subcategories").insert({ category_id: categoryId, name });

  if (error) throw error;
  return { skipped: false };
}

async function seedFile(relativePath, businessType) {
  const fullPath = path.join(__dirname, "..", relativePath);
  if (!fs.existsSync(fullPath)) {
    console.warn("Archivo no encontrado, se omite:", fullPath);
    return { file: relativePath, categories: 0, subcategories: 0, subSkipped: 0 };
  }

  const rows = parseCsvRows(fullPath);
  let categoriesTouched = 0;
  let subsInserted = 0;
  let subsSkipped = 0;
  const seenCats = new Set();

  for (const row of rows) {
    const catId = await getOrCreateCategory(row.categoryName, businessType);
    if (!seenCats.has(catId)) {
      seenCats.add(catId);
      categoriesTouched++;
    }
    const r = await insertSubcategoryIfNeeded(catId, row.subcategoryName);
    if (r.skipped) subsSkipped++;
    else subsInserted++;
  }

  return {
    file: relativePath,
    businessType,
    rows: rows.length,
    uniqueCategories: seenCats.size,
    subcategoriesInserted: subsInserted,
    subcategoriesSkipped: subsSkipped,
  };
}

async function main() {
  console.log("Iniciando seed de categorías…");
  const productos = await seedFile("data/Categoria de Productos para tulocal.csv", "producto");
  const servicios = await seedFile("data/Categoria de  Servicios para tulocal.csv", "servicio");
  console.log(JSON.stringify({ productos, servicios }, null, 2));
  console.log("Listo.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
