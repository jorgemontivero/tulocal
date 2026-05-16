-- =============================================================
-- Correcciones ortográficas de categorías y subcategorías
-- =============================================================

-- -------------------------------------------------------
-- 1. CATEGORÍAS: tildes y errores tipográficos
-- -------------------------------------------------------
UPDATE categories SET name = 'Accesorios y repuestos de vehículos'  WHERE id = '4c208856-613f-4719-9afa-15c318c92ad5';
UPDATE categories SET name = 'Bebés'                                 WHERE id = 'abe5d1ae-7f7d-4443-b6bd-8de0d835244a';
UPDATE categories SET name = 'Electrodomésticos'                     WHERE id = '85d9a6bd-8574-4523-b199-9525120f9e48';
UPDATE categories SET name = 'Gastronomía'                           WHERE id = 'eb136d8a-3028-41b4-b0cc-4f151286451f';
UPDATE categories SET name = 'Productos para la construcción'        WHERE id = 'a5e19063-4fcb-49b4-b0f6-c9747e41934d';
UPDATE categories SET name = 'Productos tecnológicos'                WHERE id = '7dba058b-ee7c-446c-8e87-3f939cd4cbdf';
UPDATE categories SET name = 'Reparación de vehículos'               WHERE id = 'c14a1f68-8b3a-4356-bcb1-e79738554541';
UPDATE categories SET name = 'Servicios de cuidado personal'         WHERE id = 'cd6cb3d4-dbd9-4874-8fc6-78057f785d0c';
UPDATE categories SET name = 'Servicios Técnicos'                    WHERE id = 'ffedb705-dfe3-4097-a416-c084c20b4a02';
UPDATE categories SET name = 'Vehículos'                             WHERE id = 'ae5fc048-a03e-4b20-a757-4f2ef17ce0dc';

-- -------------------------------------------------------
-- 2. CATEGORÍA DUPLICADA: eliminar "Reparación de vehiculos" sin uso
--    (c14a1f68 tiene 1 shop asignado; 0feab8e0 no tiene ninguno)
-- -------------------------------------------------------
DELETE FROM subcategories WHERE category_id = '0feab8e0-6853-4c39-b983-55809b0489f5';
DELETE FROM categories    WHERE id          = '0feab8e0-6853-4c39-b983-55809b0489f5';

-- -------------------------------------------------------
-- 3. SUBCATEGORÍAS: eliminar entradas con encoding corrupto (mojibake)
--    Se conserva el par con tildes correctas.
-- -------------------------------------------------------
DELETE FROM subcategories WHERE id IN (
  'ed3e2f56-ca7c-46da-835d-c5148c8253ba',  -- Accesorios de construcci?n  (dup de 822841ea)
  '5e462910-c4d4-49a7-a4b6-935c74b4e116',  -- Alba?iles                   (dup de 2541029f)
  '199de050-f0df-4982-bd46-12fd32354bf1',  -- Ba?os                       (dup de d08aca5c)
  '5efa400c-4490-4a79-91c0-75e948bbb41a',  -- Estad?sticos                (dup de c8eed155)
  '7a47564c-7899-481d-9537-f5da55390c4e',  -- Insumos para plomer?a       (dup de b974b91d)
  'faf6b9dd-0584-4ea6-9d3a-58ad5384acac',  -- Maquinaria para construcci?n(dup de 94548a1a)
  '4f4c309f-615f-435b-8c07-5014cb3250c1',  -- Ni?eras                     (dup de ceb3c2f3)
  '43f6c12e-dc1f-4f89-b75e-b86f5aa6d713',  -- Pa?aleras                   (dup de b8cba2d0)
  '66948875-4d0b-4b8d-bbef-6a4ce11f66f9',  -- Recuperaci?n de lesiones    (dup de 89cd58dc)
  'f1b9716d-5f0a-4edf-8f5b-17882e81d19a',  -- Ropa ni?os                  (dup de 22ff812b)
  'd25e3a98-5d53-408e-8575-2f235f685b05',  -- U?as                        (dup de 359e10c5)
  '3c05915d-a72c-4e22-a9f1-6be555fdb908',  -- Pinturer?a (singular+corrup)(dup de 1ea64531)
  'ec72fea1-da8f-4e03-8914-a676b3790169',  -- Reparacion de computadorías (dup de ff6b7a89)
  'bd792c34-ce83-456c-9d96-81c9f4f4ce36'   -- Depilacion sin tilde         (dup de 6d7bff59)
);

-- -------------------------------------------------------
-- 4. SUBCATEGORÍAS: errores tipográficos reales
-- -------------------------------------------------------
UPDATE subcategories SET name = 'Cámaras'               WHERE id = '0c43301b-6f3d-469b-98fd-7110bfa7cfab';  -- Camarías
UPDATE subcategories SET name = 'Computadoras'           WHERE id = '179d0d4d-ce5e-4546-9638-0027fb7aef9f';  -- Computadorías
UPDATE subcategories SET name = 'Cosmetólogas'           WHERE id = '1405c867-fd95-453a-9e08-fd0461000765';  -- Cosmeatras
UPDATE subcategories SET name = 'Cosmetología'           WHERE id = '600f5f2a-1833-4b90-873d-9809fa3aa520';  -- Cosmeatrías
UPDATE subcategories SET name = 'Maestras particulares'  WHERE id = '011176f9-12f2-4306-8f9b-664ee5dea5be';  -- Maestrías particulares
UPDATE subcategories SET name = 'Muebles para cocina'    WHERE id = 'c812664a-45da-42ca-8207-88231ee0bedb';  -- Muebles para cocióna
UPDATE subcategories SET name = 'Notebooks'              WHERE id = 'bffe8439-506c-4dbf-864f-5c91113da1cc';  -- Notbooks
UPDATE subcategories SET name = 'Ropa para bebé'         WHERE id = '339ceadb-5f44-4340-9048-48a0b0eb67b7';  -- Ropa para bebéée
UPDATE subcategories SET name = 'Traslados de animales'  WHERE id = '32a5a6e5-6ce4-454e-b67d-b798ab6cb306';  -- Translados de animales
UPDATE subcategories SET name = 'Electrodomésticos para cocina' WHERE id = 'e113a0aa-4967-40d0-8984-917f315e5699'; -- Electrodomesticos para cocióna

-- -------------------------------------------------------
-- 5. SUBCATEGORÍAS: tildes faltantes (sin duplicado corrupto)
-- -------------------------------------------------------
UPDATE subcategories SET name = 'Accesorios para computación'    WHERE id = '726e303f-18fe-4136-a19e-60617f4b5f1c';
UPDATE subcategories SET name = 'Blanquería'                     WHERE id = '71961365-19a9-4e0d-bae4-6de781f9b562';
UPDATE subcategories SET name = 'Carnicerías'                    WHERE id = '23ae1c34-dfc1-41a8-b077-b9d92214fd0d';
UPDATE subcategories SET name = 'Decoración para el hogar'       WHERE id = '0cb341bd-2bc8-4b5d-8047-ce600c7c913b';
UPDATE subcategories SET name = 'Electrodomésticos de lavadero'  WHERE id = '8eaaa65c-3d48-44f3-87cd-a08611d25215';
UPDATE subcategories SET name = 'Electrodomésticos para cocina'  WHERE id = '6b2f1977-2359-4e68-bfbb-f0ce725532f9';
UPDATE subcategories SET name = 'Fiambrerías'                    WHERE id = 'de1005ec-eab9-4c04-9588-a5096bb6184e';
UPDATE subcategories SET name = 'Fotógrafos'                     WHERE id = '58a2425b-fad0-4f65-b1c2-60770fe4cc08';
UPDATE subcategories SET name = 'Herramientas eléctricas'        WHERE id = '1cd22aab-c1bc-4fe7-b91f-0be83f9e5687';
UPDATE subcategories SET name = 'Instalación de Aires Acondicionados' WHERE id = '25fa85fd-1961-43f5-88eb-655d94156ef8';
UPDATE subcategories SET name = 'Instalación de muebles'         WHERE id = '5d47c2af-8120-44f0-a1c9-3f763d2c389e';
UPDATE subcategories SET name = 'Kinesiólogos'                   WHERE id = '1bc83b28-0da4-4deb-bee2-aa0e867386b1';
UPDATE subcategories SET name = 'Librerías'                      WHERE id = '0a8293c4-b6db-4d7d-9575-f718df18b697';
UPDATE subcategories SET name = 'Mercerías'                      WHERE id = '4005a46e-b91e-4f56-ae18-c94ac566c376';
UPDATE subcategories SET name = 'Ópticas'                        WHERE id = '5d387935-0f8b-4f52-9805-cea7d8cc4039';
UPDATE subcategories SET name = 'Panaderías'                     WHERE id = 'dade71ba-32a6-4147-9362-50e2a711e582';
UPDATE subcategories SET name = 'Peluquerías'                    WHERE id = '60afb7fc-ef05-4662-a5bc-17053d68abb0';
UPDATE subcategories SET name = 'Peluquerías caninas'            WHERE id = 'c23148d3-90a1-430d-b48f-8962e5de4320';
UPDATE subcategories SET name = 'Pileta de natación'             WHERE id = '7098b8d4-9b36-42f5-9c20-476a3b09f9ee';
UPDATE subcategories SET name = 'Pollerías'                      WHERE id = '8033d5bf-2319-47f0-b4b8-e53c2d5c7cb9';
UPDATE subcategories SET name = 'Psicólogos'                     WHERE id = 'f0aba9eb-963f-493d-9f68-44e28f50110a';
UPDATE subcategories SET name = 'Reparación de celulares'        WHERE id = 'b731c7a5-eeb8-40bd-adf4-dbd63f402810';
UPDATE subcategories SET name = 'Reparación de computadoras'     WHERE id = 'ff6b7a89-fc87-48aa-bf51-d488d68aa9e0';
UPDATE subcategories SET name = 'Reparación de electrodomésticos' WHERE id = '6efd5a76-bc05-4da8-89b2-897bea4869e9';
UPDATE subcategories SET name = 'Reparación de televisores'      WHERE id = '0abf8869-bba9-4ca8-acf4-cfcc60effecb';
UPDATE subcategories SET name = 'Rotiserías'                     WHERE id = '81140150-c36e-423a-a108-b7b1b84bc4d2';
UPDATE subcategories SET name = 'Talleres de refrigeración automotor' WHERE id = '0807e862-acd1-4eb0-a969-37eb8f479488';
UPDATE subcategories SET name = 'Verdulerías'                    WHERE id = '798a9ffe-da88-4152-adbe-1ad5454f45ca';
