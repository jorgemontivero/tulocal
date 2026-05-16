-- Agrega subcategoría "Otro..." a todas las categorías excepto "Servicios para eventos"
INSERT INTO subcategories (category_id, name)
SELECT id, 'Otro...'
FROM categories
WHERE name <> 'Servicios para eventos'
ON CONFLICT DO NOTHING;

-- Campo de texto libre para que el usuario especifique a qué se refiere con "Otro..."
ALTER TABLE shops    ADD COLUMN IF NOT EXISTS subcategory_note text;
ALTER TABLE listings ADD COLUMN IF NOT EXISTS subcategory_note text;
