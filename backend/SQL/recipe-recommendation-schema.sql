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

-- USER INTERACTIONS TABLE (for regression training data)
create table if not exists user_interactions (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  recipe_id uuid references recipes(id) on delete cascade,
  spoonacular_id integer, -- for external recipes
  interaction_type text not null, -- 'view', 'like', 'save', 'complete'
  interaction_value numeric not null, -- 1 for view, 2 for like, 3 for save, 4 for complete
  recipe_features jsonb, -- stored feature vector for this recipe
  created_at timestamp with time zone default now()
);

-- USER FEATURE WEIGHTS TABLE (regression coefficients per user)
create table if not exists user_feature_weights (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  interaction_type text not null, -- 'view', 'like', 'save', 'complete'
  feature_name text not null, -- 'relevance', 'cuisine_type', 'popularity', 'season', 'calories', 'protein', etc.
  weight numeric not null default 0,
  last_updated timestamp with time zone default now(),
  unique(user_id, interaction_type, feature_name)
);

-- RECIPE FEATURE CACHE TABLE (pre-computed feature vectors)
create table if not exists recipe_features (
  id serial primary key,
  recipe_id uuid references recipes(id) on delete cascade,
  spoonacular_id integer, -- for external recipes
  feature_vector jsonb not null, -- normalized feature vector
  popularity_score numeric default 0,
  relevance_score numeric default 0,
  last_updated timestamp with time zone default now(),
  unique(recipe_id),
  unique(spoonacular_id)
);

-- REGRESSION MODEL METRICS TABLE (for A/B testing and model evaluation)
create table if not exists regression_metrics (
  id serial primary key,
  user_id uuid references users(id) on delete cascade,
  model_version text not null, -- 'v1', 'v2', etc.
  interaction_type text not null,
  mse numeric, -- mean squared error
  r_squared numeric, -- R-squared value
  feature_importance jsonb, -- feature importance scores
  training_samples integer,
  last_trained timestamp with time zone default now()
); 