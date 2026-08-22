-- ============================================================
-- ERP Mikato · Migración: datos de pago y envío en pedidos
-- Ejecutar sobre una base de datos existente (es idempotente).
-- ============================================================

alter table public.orders add column if not exists payment_method text;
alter table public.orders add column if not exists payment_status text;
alter table public.orders add column if not exists shipping_method text;

update public.orders set payment_status = 'pendiente' where payment_status is null;

alter table public.orders alter column payment_status set default 'pendiente';
alter table public.orders alter column payment_status set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders add constraint orders_payment_status_check
      check (payment_status in ('pendiente', 'recibido', 'rechazado'));
  end if;
end $$;
