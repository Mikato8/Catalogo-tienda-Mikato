-- ============================================================
-- ERP Mikato · Migración: simplificar estados de pago/envío
-- payment_status: pendiente / realizado
-- shipping_status: pendiente / enviado (nuevo)
-- shipping_cost: costo del envío (nuevo)
-- Ejecutar sobre una base de datos existente (es idempotente).
-- ============================================================

update public.orders set payment_status = 'realizado' where payment_status = 'recibido';
update public.orders set payment_status = 'pendiente' where payment_status = 'rechazado';

alter table public.orders drop constraint if exists orders_payment_status_check;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_payment_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders add constraint orders_payment_status_check
      check (payment_status in ('pendiente', 'realizado'));
  end if;
end $$;

alter table public.orders add column if not exists shipping_status text;
alter table public.orders add column if not exists shipping_cost numeric(12, 2);

update public.orders set shipping_status = 'pendiente' where shipping_status is null;
update public.orders set shipping_cost = 0 where shipping_cost is null;

alter table public.orders alter column shipping_status set default 'pendiente';
alter table public.orders alter column shipping_status set not null;
alter table public.orders alter column shipping_cost set default 0;
alter table public.orders alter column shipping_cost set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'orders_shipping_status_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders add constraint orders_shipping_status_check
      check (shipping_status in ('pendiente', 'enviado'));
  end if;
end $$;
