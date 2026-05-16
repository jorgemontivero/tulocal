-- =============================================================
-- Segunda pasada: duplicados generados + acentos faltantes
-- =============================================================

-- -------------------------------------------------------
-- 1. Duplicados generados al corregir nombres corruptos
--    (el UPDATE convirtió la entrada corrupta en el mismo
--     nombre que ya tenía la entrada correcta)
-- -------------------------------------------------------
DELETE FROM subcategories WHERE id IN (
  '255bd54e-baec-46a1-b22f-ce990b0747eb',  -- "Camaras" sin tilde (queda 0c43301b → "Cámaras")
  '179d0d4d-ce5e-4546-9638-0027fb7aef9f',  -- "Computadoras" dup    (queda df34af4c)
  '011176f9-12f2-4306-8f9b-664ee5dea5be',  -- "Maestras particulares" dup (queda 651806bf)
  'c812664a-45da-42ca-8207-88231ee0bedb',  -- "Muebles para cocina" dup  (queda e1042755)
  'e113a0aa-4967-40d0-8984-917f315e5699',  -- "Electrodomésticos para cocina" dup (queda 6b2f1977)
  '10462004-2651-4ced-9356-7a003eb9bf00'   -- "Ropa para bebe" sin tilde (queda 339ceadb → "Ropa para bebé")
);

-- -------------------------------------------------------
-- 2. Acentos faltantes que quedaron pendientes
-- -------------------------------------------------------
UPDATE subcategories SET name = 'Artículos para hacer deporte' WHERE id = '12889e7a-bc1a-409f-9d7c-32b02032a6eb';
UPDATE subcategories SET name = 'Barberías'                    WHERE id = '7f1a89e4-da24-471e-839a-f04910b26d05';
UPDATE subcategories SET name = 'Climatización'               WHERE id = 'f0e74685-3d9e-4de8-adf7-b4fd1e158c44';
UPDATE subcategories SET name = 'Empleadas domésticas'        WHERE id = '39092eaa-7029-47e5-a4d3-fc380d888287';
UPDATE subcategories SET name = 'Esotéricos'                  WHERE id = '24856892-8dc4-4a3a-879a-822c0cbcf64d';
UPDATE subcategories SET name = 'Gomerías'                    WHERE id = 'b03c8cdd-5fc5-41f1-b282-f3aa1d1ed659';
UPDATE subcategories SET name = 'Insumos para peluquerías'    WHERE id = '24f0ef83-9316-41aa-855e-581507faf7f6';
UPDATE subcategories SET name = 'Médicos'                     WHERE id = '965adf26-4a35-4f65-b837-7b1bca7b70da';
UPDATE subcategories SET name = 'Muebles para jardín'         WHERE id = '6d804e3b-252c-4b2d-8239-4ffc75293199';
UPDATE subcategories SET name = 'Talleres mecánicos'          WHERE id = '04943c94-8265-4847-913e-bd33ca490b15';
