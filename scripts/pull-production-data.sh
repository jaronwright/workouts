#!/usr/bin/env bash
set -euo pipefail

# =========================================
# Pull Production Data to Local Supabase
# =========================================
# Usage: npm run pull-prod-data
#
# This script:
#   1. Dumps data from the production Supabase database
#   2. Resets the local Supabase database (re-runs all migrations + seed)
#   3. Loads the production data into the local database
#
# Prerequisites:
#   - Supabase CLI installed (brew install supabase/tap/supabase)
#   - Local Supabase running (supabase start)
#   - Supabase CLI linked to production (supabase link --project-ref <ref>)
#
# The production project ref is: cvxzuxbgufpzvbmlxayr

PROD_PROJECT_REF="cvxzuxbgufpzvbmlxayr"
LOCAL_DB_URL="postgresql://postgres:postgres@localhost:54322/postgres"
DUMP_FILE="supabase/production-data.sql"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo ""
echo "=== Pull Production Data to Local Supabase ==="
echo ""

# Check prerequisites
if ! command -v supabase &> /dev/null; then
  echo "Error: Supabase CLI not installed."
  echo "Install with: brew install supabase/tap/supabase"
  exit 1
fi

if ! command -v psql &> /dev/null; then
  echo "Error: psql not found. Install PostgreSQL client tools."
  echo "Install with: brew install libpq && brew link --force libpq"
  exit 1
fi

# Check if local Supabase is running
if ! psql "$LOCAL_DB_URL" -c "SELECT 1" &> /dev/null; then
  echo "Error: Local Supabase is not running."
  echo "Start it with: supabase start"
  exit 1
fi

echo "[1/4] Linking to production project (if not already linked)..."
if ! supabase link --project-ref "$PROD_PROJECT_REF" 2>/dev/null; then
  echo "  Already linked or needs authentication. Run 'supabase login' if needed."
fi

echo "[2/4] Dumping production data..."
echo "  This may take a moment..."
supabase db dump --project-ref "$PROD_PROJECT_REF" --data-only -f "$DUMP_FILE" 2>/dev/null

if [ ! -f "$DUMP_FILE" ]; then
  echo "Error: Failed to create dump file."
  exit 1
fi

DUMP_SIZE=$(wc -c < "$DUMP_FILE" | tr -d ' ')
echo "  Dump created: $DUMP_FILE ($DUMP_SIZE bytes)"

echo "[3/4] Resetting local database (re-running migrations + seed)..."
supabase db reset --no-seed

echo "[4/4] Loading production data into local database..."
psql "$LOCAL_DB_URL" -f "$DUMP_FILE" --quiet 2>/dev/null || {
  echo ""
  echo "Warning: Some data may have failed to load (e.g., RLS policies, user references)."
  echo "This is expected if production has users that don't exist locally."
  echo "The structural data (plans, exercises, etc.) should be loaded correctly."
}

# Clean up dump file
rm -f "$DUMP_FILE"

echo ""
echo "=== Done! ==="
echo ""
echo "Local Supabase now has a copy of production data."
echo "  Studio:  http://localhost:54323"
echo "  API:     http://localhost:54321"
echo "  App:     http://localhost:5173 (npm run dev)"
echo ""
