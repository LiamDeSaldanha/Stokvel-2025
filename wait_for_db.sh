#!/bin/sh
set -e

# --- Configuration ---
DB_HOST=db
DB_PORT=5432
DB_USER=admin
DB_NAME=mydb
SEED_FOLDER=/db_seed  # mount this in docker-compose

# --- Wait for Postgres to be ready ---
echo "Waiting for Postgres at $DB_HOST:$DB_PORT..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER"; do
  sleep 1
done

echo "Postgres is ready! Running SQL seed scripts..."

# --- Run all SQL files ---
for sql_file in "$SEED_FOLDER"/*.sql; do
  echo "Running $sql_file ..."
  psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f "$sql_file"
done

echo "All seed scripts executed!"
