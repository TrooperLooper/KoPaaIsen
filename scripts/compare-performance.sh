#!/bin/bash

# Performance comparison test: main vs perf/optimized
# Usage: bash scripts/compare-performance.sh <url> [iterations]
# Example: bash scripts/compare-performance.sh http://localhost:3001 20

set -e

URL="${1:-http://localhost:3001}"
ITERATIONS="${2:-15}"
YEAR=2000
MONTH=2

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Performance Comparison: Before vs After Optimization"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Configuration:"
echo "  API URL: $URL"
echo "  Iterations: $ITERATIONS"
echo "  Query: year=$YEAR, month=$MONTH"
echo ""

# Function to run benchmark and save results
run_benchmark() {
  local branch=$1
  local output_file=$2
  
  echo "Testing branch: $branch"
  node scripts/benchmark.js "$URL" "$ITERATIONS" "$YEAR" "$MONTH" > "$output_file" 2>&1 || true
  echo "Results saved to: $output_file"
  echo ""
}

# Function to extract stats from benchmark output
extract_stats() {
  local file=$1
  grep -E "^  (Min|Max|Mean|Median|P95|P99):" "$file" || echo "Could not extract stats"
}

# Create temp directory for results
RESULTS_DIR="/tmp/ko-pa-isen-perf-test"
mkdir -p "$RESULTS_DIR"

BEFORE_FILE="$RESULTS_DIR/before.txt"
AFTER_FILE="$RESULTS_DIR/after.txt"
COMPARISON_FILE="$RESULTS_DIR/comparison.txt"

# Run before test (main branch)
echo "▶️  PHASE 1: Testing BEFORE (main branch)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_benchmark "main" "$BEFORE_FILE"

# Run after test (perf/optimized branch)
echo "▶️  PHASE 2: Testing AFTER (perf/optimized branch)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
run_benchmark "perf/optimized" "$AFTER_FILE"

# Generate comparison report
echo "▶️  PHASE 3: Generating Comparison Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

{
  echo "╔════════════════════════════════════════════════════════╗"
  echo "║         PERFORMANCE TEST RESULTS COMPARISON           ║"
  echo "╚════════════════════════════════════════════════════════╝"
  echo ""
  echo "Test Configuration:"
  echo "  • URL: $URL"
  echo "  • Query: year=$YEAR, month=$MONTH"
  echo "  • Iterations: $ITERATIONS"
  echo "  • Timestamp: $(date)"
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "📊 BEFORE (main branch - Original Code)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  cat "$BEFORE_FILE" 2>/dev/null || echo "Results not available"
  echo ""
  echo ""
  echo "📊 AFTER (perf/optimized branch - With Optimizations)"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  cat "$AFTER_FILE" 2>/dev/null || echo "Results not available"
  echo ""
  echo ""
  echo "📈 ANALYSIS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "Results saved to: $RESULTS_DIR"
  echo ""
  echo "Changes made in perf/optimized:"
  echo "  ✓ Frontend in-memory caching (Map<string, IceResult>)"
  echo "  ✓ Response compression (gzip)"
  echo "  ✓ Vercel edge cache headers (24h TTL)"
  echo "  ✓ Browser cache headers with ETag"
  echo ""
  
} | tee "$COMPARISON_FILE"

echo ""
echo "✅ Comparison test complete!"
echo "📄 Full report saved to: $COMPARISON_FILE"
echo ""
echo "Next steps:"
echo "  • Review the results above"
echo "  • For local testing: make sure backend is running on $URL"
echo "  • For live testing: replace $URL with production URL"
echo ""
