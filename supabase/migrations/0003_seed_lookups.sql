-- CvSUFound: starter filter lists (categories and campus locations)
-- Run this THIRD. These are only the dropdown choices, NOT lost/found items.
-- Edit the locations to match your own campus before running, or change them
-- later in Table Editor -> locations.

insert into public.categories (name, slug, sort_order) values
  ('IDs & Cards',   'ids-cards',   1),
  ('Electronics',   'electronics', 2),
  ('Bags',          'bags',        3),
  ('Keys',          'keys',        4),
  ('Wallets',       'wallets',     5),
  ('Books & Notes', 'books-notes', 6),
  ('Clothing',      'clothing',    7),
  ('Others',        'others',      99)
on conflict (slug) do nothing;

insert into public.locations (name, slug, sort_order) values
  ('Library',        'library',        1),
  ('Canteen',        'canteen',        2),
  ('Main Gate',      'main-gate',      3),
  ('Covered Court',  'covered-court',  4),
  ('Admin Building', 'admin-building', 5),
  ('Classrooms',     'classrooms',     6),
  ('Other',          'other',          99)
on conflict (slug) do nothing;
