-- ============================================================
-- ERP Mikato · Esquema para Neon (PostgreSQL)
-- ============================================================

-- Tipos / dominios
create type public.order_status as enum (
  'pendiente',
  'confirmado',
  'en_produccion',
  'enviado',
  'entregado',
  'cancelado'
);

-- Usuarios de la aplicación (auth propia con JWT)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  password_hash text not null,
  full_name text,
  role text not null default 'cliente' check (role in ('admin', 'cliente')),
  created_at timestamptz not null default now()
);

create unique index users_email_idx on public.users (lower(email));

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
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

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  status public.order_status not null default 'pendiente',
  total numeric(12, 2) not null default 0,
  shipping_address text not null,
  customer_name text,
  street text,
  street_number text,
  colonia text,
  city text,
  state text,
  postal_code text,
  email text,
  phone text,
  payment_method text,
  payment_status text not null default 'pendiente' check (payment_status in ('pendiente', 'realizado')),
  shipping_method text,
  shipping_status text not null default 'pendiente' check (shipping_status in ('pendiente', 'enviado')),
  shipping_cost numeric(12, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12, 2) not null
);

create table if not exists public.order_tracking (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  status public.order_status not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Índices para las consultas habituales
create index if not exists products_category_id_idx on public.products(category_id);
create index if not exists products_active_idx on public.products(active);
create index if not exists orders_user_id_idx on public.orders(user_id);
create index if not exists orders_status_idx on public.orders(status);
create index if not exists order_items_order_id_idx on public.order_items(order_id);
create index if not exists order_tracking_order_id_idx on public.order_tracking(order_id);

-- Imágenes (se guardan en la base de datos para no depender del disco)
create table if not exists public.images (
  id uuid primary key default gen_random_uuid(),
  data bytea not null,
  mime_type text not null,
  filename text,
  size integer,
  created_at timestamptz not null default now()
);

-- Configuración visual del sitio (paleta y tipografía), editable solo por admin
create table if not exists public.site_settings (
  id integer primary key default 1 check (id = 1),
  primary_color text not null default '#006877',
  font_family text not null default 'Inter',
  shipping_local_cost numeric(12, 2) not null default 0,
  shipping_paqueteria_cost numeric(12, 2) not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.site_settings (id) values (1)
on conflict (id) do nothing;