#!/usr/bin/env bash
# Run E2E integration tests for the Pickleball Platform API
#
# Usage:
#   ./run_tests.sh              # Test against live Railway URL
#   ./run_tests.sh local        # Test against http://localhost:8000

set -euo pipefail
cd "$(dirname "$0")"

if [ "${1:-}" = "local" ]; then
    export TEST_API_URL="http://localhost:8000"
    echo "🏓 Testing against LOCAL: $TEST_API_URL"
else
    echo "🏓 Testing against LIVE: https://pickleball-platform-production.up.railway.app"
fi

# Install deps if needed
pip install -q pytest httpx requests 2>/dev/null || true

exec pytest test_e2e.py -v "$@"
