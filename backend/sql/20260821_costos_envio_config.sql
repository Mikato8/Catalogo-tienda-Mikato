-- ============================================================
-- ERP Mikato · Migración: costos de envío configurables
-- Agrega shipping_local_cost y shipping_paqueteria_cost.
-- Ejecutar sobre una base de datos existente (es idempotente).
-- ============================================================

alter table public.site_settings
  add column if not exists shipping_local_cost numeric(12, 2) not null default 0;

alter table public.site_settings
  add column if not exists shipping_paqueteria_cost numeric(12, 2) not null default 0;
