-- USERS TABLE
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  preferences jsonb, -- for storing arbitrary user preferences
  diet text,         -- e.g. 'vegan', 'vegetarian', etc.
  cuisine text,      -- e.g. 'italian', 'mexican', etc.
  created_at timestamp with time zone default now()
);

-- RECIPES TABLE
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  tags text[],         -- array of tags
  cuisine text,
  season text,         -- e.g. 'spring', 'summer', etc.
  dairy_free boolean,
  created_at timestamp with time zone default now()
);

-- VIEWS TABLE
create table if not exists views (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  viewed_at timestamp with time zone default now()
);

-- LIKES TABLE
create table if not exists likes (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  liked_at timestamp with time zone default now(),
  unique(user_id, recipe_id)
);

-- SAVED TABLE
create table if not exists saved (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  saved_at timestamp with time zone default now(),
  unique(user_id, recipe_id)
);

-- SPOONACULAR CACHE TABLE
create table if not exists spoonacular_cache (
  id serial primary key,
  spoonacular_id integer unique not null,
  title text,
  data jsonb, -- full metadata from Spoonacular
  cached_at timestamp with time zone default now()
); 