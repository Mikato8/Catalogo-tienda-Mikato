-- ============================================================
-- ERP Mikato · Esquema inicial para Supabase PostgreSQL
-- ============================================================

-- ------------------------------------------------------------
-- Tipos de dominio
-- ------------------------------------------------------------

create type public.user_role as enum ('admin', 'cliente');

create type public.order_status as enum (
  'pendiente',
  'confirmado',
  'en_produccion',
  'enviado',
  'entregado',
  'cancelado'
);

-- ------------------------------------------------------------
-- Tablas principales
-- ------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'cliente',
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories(id) on delete set null,
  sku text unique not null,
  name text not null,
  description text,
  stock integer not null default 0 check (stock >= 0),
  production_status text not null default 'disponible',
  production_cost numeric(12, 2) not null default 0,
  price numeric(12, 2) not null check (price >= 0),
  image_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id),
  status public.order_status not null default 'pendiente',
  total numeric(12, 2) not null default 0,
  shipping_address text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null
);

create table public.order_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  notes text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- Índices para las consultas habituales
-- ------------------------------------------------------------

create index products_category_id_idx
  on public.products(category_id);

create index products_active_idx
  on public.products(active);

create index orders_user_id_idx
  on public.orders(user_id);

create index orders_status_idx
  on public.orders(status);

create index order_items_order_id_idx
  on public.order_items(order_id);

create index order_tracking_order_id_idx
  on public.order_tracking(order_id);

-- ------------------------------------------------------------
-- Trigger de perfiles y función de autorización
-- ------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();

create or replace function public.es_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- ------------------------------------------------------------
-- Row Level Security
-- ------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_tracking enable row level security;

create policy "usuarios consultan su perfil"
on public.profiles
for select
using (auth.uid() = id or public.es_admin());

create policy "categorias públicas"
on public.categories
for select
using (active = true or public.es_admin());

create policy "productos públicos"
on public.products
for select
using (active = true or public.es_admin());

create policy "admin categorías"
on public.categories
for all
using (public.es_admin())
with check (public.es_admin());

create policy "admin productos"
on public.products
for all
using (public.es_admin())
with check (public.es_admin());

create policy "usuarios ven sus pedidos"
on public.orders
for select
using (auth.uid() = user_id or public.es_admin());

create policy "usuarios crean pedidos"
on public.orders
for insert
with check (auth.uid() = user_id);

create policy "admin actualiza pedidos"
on public.orders
for update
using (public.es_admin())
with check (public.es_admin());

create policy "usuarios consultan sus items"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id = auth.uid() or public.es_admin())
  )
);

create policy "usuarios crean items propios"
on public.order_items
for insert
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "usuarios consultan su tracking"
on public.order_tracking
for select
using (
  exists (
    select 1
    from public.orders
    where orders.id = order_tracking.order_id
      and (orders.user_id = auth.uid() or public.es_admin())
  )
);

create policy "usuarios y admin registran tracking"
on public.order_tracking
for insert
with check (
  public.es_admin()
  or exists (
    select 1
    from public.orders
    where orders.id = order_tracking.order_id
      and orders.user_id = auth.uid()
  )
);

-- ------------------------------------------------------------
-- Supabase Storage para imágenes de productos
-- ------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "imágenes públicas"
on storage.objects
for select
using (bucket_id = 'product-images');

create policy "admin sube imágenes"
on storage.objects
for insert
with check (
  bucket_id = 'product-images'
  and public.es_admin()
);

create policy "admin actualiza imágenes"
on storage.objects
for update
using (
  bucket_id = 'product-images'
  and public.es_admin()
)
with check (
  bucket_id = 'product-images'
  and public.es_admin()
);

create policy "admin elimina imágenes"
on storage.objects
for delete
using (
  bucket_id = 'product-images'
  and public.es_admin()
);
