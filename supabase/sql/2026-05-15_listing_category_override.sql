alter table listings
  add column category_id uuid references categories(id),
  add column subcategory_id uuid references subcategories(id);
