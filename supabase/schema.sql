-- The kanban board was removed. Supabase Auth is still used for the terminal's
-- `/login` command; no application tables are in use right now.
--
-- Run this in the Supabase SQL editor to drop the abandoned kanban tables.
-- Nothing here is applied automatically.

DROP TABLE IF EXISTS cards;
DROP TABLE IF EXISTS columns;
DROP TABLE IF EXISTS boards;
