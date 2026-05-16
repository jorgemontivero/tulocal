-- =============================================================
-- Nuevas categorías y subcategorías sugeridas
-- =============================================================

-- -------------------------------------------------------
-- NUEVAS CATEGORÍAS
-- -------------------------------------------------------

INSERT INTO categories (name, business_type) VALUES ('Artesanías', 'producto') ON CONFLICT DO NOTHING;
INSERT INTO categories (name, business_type) VALUES ('Cotillón', 'producto') ON CONFLICT DO NOTHING;
INSERT INTO categories (name, business_type) VALUES ('Limpieza', 'servicio') ON CONFLICT DO NOTHING;
INSERT INTO categories (name, business_type) VALUES ('Diseño y marketing', 'servicio') ON CONFLICT DO NOTHING;

-- -------------------------------------------------------
-- SUBCATEGORÍAS DE LAS NUEVAS CATEGORÍAS
-- -------------------------------------------------------

INSERT INTO subcategories (category_id, name) SELECT id, 'Tejidos y telares'     FROM categories WHERE name = 'Artesanías'       AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Cerámica y alfarería'  FROM categories WHERE name = 'Artesanías'       AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Platería artesanal'    FROM categories WHERE name = 'Artesanías'       AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Cuero y marroquinería' FROM categories WHERE name = 'Artesanías'       AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Tallas en madera'      FROM categories WHERE name = 'Artesanías'       AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Artesanías en piedra'  FROM categories WHERE name = 'Artesanías'       AND business_type = 'producto' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Artículos para fiestas' FROM categories WHERE name = 'Cotillón'        AND business_type = 'producto' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Limpieza de hogares'              FROM categories WHERE name = 'Limpieza' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Limpieza de oficinas y comercios' FROM categories WHERE name = 'Limpieza' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Fumigación y desinfección'        FROM categories WHERE name = 'Limpieza' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Lavado de alfombras y tapizados'  FROM categories WHERE name = 'Limpieza' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Limpieza de vidrios y fachadas'   FROM categories WHERE name = 'Limpieza' AND business_type = 'servicio' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Diseño gráfico'              FROM categories WHERE name = 'Diseño y marketing' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Gestión de redes sociales'   FROM categories WHERE name = 'Diseño y marketing' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Fotografía comercial'        FROM categories WHERE name = 'Diseño y marketing' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Desarrollo web'              FROM categories WHERE name = 'Diseño y marketing' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Publicidad e impresión'      FROM categories WHERE name = 'Diseño y marketing' AND business_type = 'servicio' ON CONFLICT DO NOTHING;

-- -------------------------------------------------------
-- NUEVAS SUBCATEGORÍAS EN CATEGORÍAS EXISTENTES
-- -------------------------------------------------------

INSERT INTO subcategories (category_id, name) SELECT id, 'Vinotecas y licoreras'    FROM categories WHERE name = 'Alimentos y Bebidas'   AND business_type = 'producto' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Clases de música'         FROM categories WHERE name = 'Clases'                 AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Clases de arte y pintura' FROM categories WHERE name = 'Clases'                 AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Clases de yoga y pilates' FROM categories WHERE name = 'Clases'                 AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Clases de computación'    FROM categories WHERE name = 'Clases'                 AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Tutorías escolares'       FROM categories WHERE name = 'Clases'                 AND business_type = 'servicio' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Cocheras'                 FROM categories WHERE name = 'Inmuebles'              AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Galpones y depósitos'     FROM categories WHERE name = 'Inmuebles'              AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Alquiler temporario'      FROM categories WHERE name = 'Inmuebles'              AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Campos y fincas'          FROM categories WHERE name = 'Inmuebles'              AND business_type = 'producto' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Muebles para oficina'     FROM categories WHERE name = 'Muebles'                AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Colchones y sommiers'     FROM categories WHERE name = 'Muebles'                AND business_type = 'producto' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Lencería'                 FROM categories WHERE name = 'Ropa'                   AND business_type = 'producto' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Pesas y fitness'          FROM categories WHERE name = 'Productos deportivos'   AND business_type = 'producto' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Equipos de camping y outdoor' FROM categories WHERE name = 'Productos deportivos' AND business_type = 'producto' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Gimnasios'                FROM categories WHERE name = 'Servicios Deportivos'   AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Yoga y pilates'           FROM categories WHERE name = 'Servicios Deportivos'   AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Artes marciales'          FROM categories WHERE name = 'Servicios Deportivos'   AND business_type = 'servicio' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'DJ'                            FROM categories WHERE name = 'Servicios para eventos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Decoración de eventos'         FROM categories WHERE name = 'Servicios para eventos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Tortas y repostería'           FROM categories WHERE name = 'Servicios para eventos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Carpas y mobiliario para eventos' FROM categories WHERE name = 'Servicios para eventos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Cerrajeros'                        FROM categories WHERE name = 'Servicios Técnicos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Pintores'                          FROM categories WHERE name = 'Servicios Técnicos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Techistas e impermeabilización'    FROM categories WHERE name = 'Servicios Técnicos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Carpinteros'                       FROM categories WHERE name = 'Servicios Técnicos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Herreros'                          FROM categories WHERE name = 'Servicios Técnicos' AND business_type = 'servicio' ON CONFLICT DO NOTHING;

INSERT INTO subcategories (category_id, name) SELECT id, 'Nutricionistas'            FROM categories WHERE name = 'Profesionales'          AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Escribanos'                FROM categories WHERE name = 'Profesionales'          AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Fonoaudiólogos'            FROM categories WHERE name = 'Profesionales'          AND business_type = 'servicio' ON CONFLICT DO NOTHING;
INSERT INTO subcategories (category_id, name) SELECT id, 'Ingenieros'                FROM categories WHERE name = 'Profesionales'          AND business_type = 'servicio' ON CONFLICT DO NOTHING;
