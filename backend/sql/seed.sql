-- ============================================================
-- ERP Mikato · Datos de ejemplo para Neon
-- Ejecutar tras schema.sql
-- ============================================================

insert into public.categories (name, slug, description) values
  ('Hogar', 'hogar', 'Piezas para espacios con personalidad.'),
  ('Bienestar', 'bienestar', 'Rituales cotidianos para bajar el ritmo.'),
  ('Regalos', 'regalos', 'Detalles para celebrar momentos especiales.')
on conflict (slug) do nothing;

insert into public.products (
  category_id, sku, name, description, stock, production_status, production_cost, price, image_url
)
select
  c.id, s.sku, s.name, s.description, s.stock, s.production_status, s.production_cost, s.price, s.image_url
from (
  values
    ('hogar', 'TAZA-001', 'Taza Mikato', 'Taza de cerámica artesanal con acabado mate.', 20, 'disponible', 6.00, 18.00, 'https://images.unsplash.com/photo-1514228742587-6b1558fcf93a?w=700'),
    ('hogar', 'BANDEJA-001', 'Bandeja calma', 'Bandeja de madera para organizar tus pequeños rituales.', 12, 'disponible', 14.00, 34.00, 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=700'),
    ('hogar', 'JARRON-001', 'Jarrón orgánico', 'Jarrón decorativo de líneas suaves para flores secas.', 8, 'en_produccion', 19.00, 48.00, 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=700'),
    ('bienestar', 'VELA-001', 'Vela calma', 'Vela vegetal con aroma de cedro y lavanda.', 30, 'disponible', 3.00, 12.00, 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=700'),
    ('bienestar', 'VELA-002', 'Vela amanecer', 'Vela vegetal con notas cítricas y florales.', 24, 'disponible', 3.50, 14.00, 'https://images.unsplash.com/photo-1608181831718-c9c9f8d5b7f5?w=700'),
    ('bienestar', 'DIFUSOR-001', 'Difusor bosque', 'Difusor de aroma para crear una atmósfera serena.', 15, 'disponible', 7.00, 26.00, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=700'),
    ('bienestar', 'JABON-001', 'Jabón botánico', 'Jabón artesanal de avena, miel y aceite de oliva.', 40, 'disponible', 2.00, 9.00, 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=700'),
    ('regalos', 'SET-001', 'Set ritual de pausa', 'Combinación de vela, taza y tarjeta para regalar calma.', 10, 'en_produccion', 18.00, 45.00, 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=700'),
    ('regalos', 'CUADERNO-001', 'Cuaderno intención', 'Cuaderno de papel reciclado para ideas y propósitos.', 25, 'disponible', 4.00, 16.00, 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=700'),
    ('regalos', 'TARJETA-001', 'Tarjeta celebra', 'Tarjeta ilustrada para acompañar un regalo especial.', 60, 'disponible', 0.80, 5.00, 'https://images.unsplash.com/photo-1513883049090-d0b7439799bf?w=700')
) as s (category_slug, sku, name, description, stock, production_status, production_cost, price, image_url)
join public.categories c on c.slug = s.category_slug
on conflict (sku) do nothing;