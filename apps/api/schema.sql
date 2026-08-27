CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  version INTEGER NOT NULL,
  from_label TEXT NOT NULL,
  to_label TEXT NOT NULL,
  move_date TEXT NOT NULL,
  broadband_min_mbps INTEGER NOT NULL,
  broadband_max_monthly_gbp INTEGER NOT NULL,
  approval_policy TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  movers_earliest_time TEXT NOT NULL DEFAULT '10:00',
  movers_max_gbp INTEGER NOT NULL DEFAULT 350,
  energy_prefer_renewable INTEGER NOT NULL DEFAULT 1,
  energy_max_green_premium_gbp INTEGER NOT NULL DEFAULT 100,
  created_at TEXT
);
CREATE TABLE IF NOT EXISTS receipts (
  id TEXT PRIMARY KEY, mission_id TEXT NOT NULL, mission_version INTEGER NOT NULL,
  service TEXT NOT NULL, action TEXT NOT NULL, status TEXT NOT NULL, resource_id TEXT,
  summary TEXT NOT NULL, recurring_cost_pence INTEGER, one_off_cost_pence INTEGER,
  reversible INTEGER NOT NULL DEFAULT 1, data_categories_json TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS broadband_holds (
  id TEXT PRIMARY KEY, mission_id TEXT NOT NULL, mission_version INTEGER NOT NULL,
  plan_id TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mover_holds (
  id TEXT PRIMARY KEY, mission_id TEXT NOT NULL, mission_version INTEGER NOT NULL,
  slot_id TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL, expires_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS scenario_flags (
  mission_id TEXT NOT NULL, flag TEXT NOT NULL, value INTEGER NOT NULL DEFAULT 1,
  updated_at TEXT NOT NULL, PRIMARY KEY(mission_id,flag)
);
CREATE TABLE IF NOT EXISTS energy_preparations (
  id TEXT PRIMARY KEY, mission_id TEXT NOT NULL, mission_version INTEGER NOT NULL,
  tariff_id TEXT NOT NULL, status TEXT NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS mission_approvals (
  mission_id TEXT PRIMARY KEY, mission_version INTEGER NOT NULL, token TEXT NOT NULL,
  broadband_resource_id TEXT NOT NULL, mover_resource_id TEXT NOT NULL, energy_resource_id TEXT NOT NULL,
  approved_at TEXT NOT NULL
);
