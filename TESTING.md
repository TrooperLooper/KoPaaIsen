# Before/After Performance Testing Guide

## Quick Start

You now have two branches:
- **main** — Original code (baseline)
- **perf/optimized** — With caching, compression, and edge cache headers

## Testing Strategy

### Option A: Local Testing (Recommended for Development)

This tests your backend running locally against both versions.

#### Step 1: Test BEFORE (main branch)

```bash
# Ensure you're on main
git checkout main

# Install dependencies
cd backend && npm install && cd ..

# Start backend in terminal 1
cd backend && npm run dev

# In terminal 2, run benchmark
node scripts/benchmark.js http://localhost:3001 15 2000 2
```

**Record these metrics:**
- Mean latency (ms)
- P95 latency (ms)
- Min/Max range

#### Step 2: Test AFTER (perf/optimized branch)

```bash
# Switch to optimized branch
git checkout perf/optimized

# Install new dependency (compression middleware)
cd backend && npm install && cd ..

# Restart backend (Ctrl+C on terminal 1, then run again)
cd backend && npm run dev

# In terminal 2, run same benchmark
node scripts/benchmark.js http://localhost:3001 15 2000 2
```

#### Step 3: Compare Results

Run the automated comparison script:

```bash
bash scripts/compare-performance.sh http://localhost:3001 20
```

This generates a detailed report showing before/after metrics.

---

### Option B: Live Testing (Production)

Test against your Vercel deployment:

```bash
# Test main branch (current live version)
node scripts/benchmark.js https://ko-paa-isen.vercel.app 20 2000 2

# Then deploy perf/optimized and test again:
# (Instructions depend on your deployment setup)
node scripts/benchmark.js https://ko-paa-isen.vercel.app 20 2000 2
```

---

## What Each Optimization Does

| Optimization | Impact | Mechanism |
|---|---|---|
| **Frontend Caching** | 🟢 High on repeats | In-memory `Map<cacheKey, result>` |
| **Response Compression** | 🟡 Medium | gzip compression on responses |
| **Edge Cache Headers** | 🟢 High on live | `Cache-Control: s-maxage=86400` |
| **ETag + Browser Cache** | 🟡 Medium | HTTP conditional caching |

---

## Expected Results

### Local Testing (best case scenario)
- **BEFORE:** 80-150ms average
- **AFTER:** 50-100ms average (repeat queries: 5-10ms)
- **Improvement:** ~40% on first load, 80% on repeats

### Live Testing (real-world)
- **BEFORE:** 200-400ms average
- **AFTER:** 150-300ms average
- **With edge cache:** 50-100ms (cached at Vercel edge)

---

## Test Script Output

The benchmark script reports:
```
📈 Statistics (ms):
  Min:      125.45ms
  Max:      189.32ms
  Mean:     152.67ms
  Median:   148.92ms
  Std Dev:  18.34ms
  P95:      178.12ms
  P99:      187.45ms
```

Focus on **Mean** and **P95** (95th percentile = worst case)

---

## Branches Summary

```bash
# View all branches
git branch -a

# Switch between them
git checkout main           # Original
git checkout perf/optimized # Optimized

# View what changed
git diff main perf/optimized
```

### Changes in perf/optimized:

1. **frontend/src/hooks/useIceData.ts**
   - Added `cacheRef` for in-memory caching
   - Check cache before fetching
   - Store result in cache after fetch

2. **backend/src/index.ts**
   - Added `compression` middleware
   - All responses > 1KB are gzip compressed

3. **backend/src/routes/ice.ts**
   - Added `Cache-Control` headers (24h public cache)
   - Added `ETag` header for cache validation
   - Stale-while-revalidate for even better performance

4. **backend/package.json**
   - Added `compression` dependency

5. **New files (for testing/monitoring)**
   - `scripts/benchmark.js` - Latency measurement tool
   - `scripts/compare-performance.sh` - Comparison script
   - `PERFORMANCE.md` - Full optimization guide
   - `frontend/src/hooks/usePerformanceMetrics.ts` - Performance hook (optional)

---

## Troubleshooting

### "Port 3001 already in use"
```bash
# Kill process on port 3001
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill -9
```

### "Module not found: compression"
Make sure you ran:
```bash
cd backend && npm install
```

### Test results show no difference
- Local testing may show minimal improvement if latency is already low
- The bigger gains appear in:
  - Repeat queries (frontend cache)
  - Live deployment (edge cache)
  - High-traffic scenarios

### Connection refused to API
Make sure backend is running:
```bash
cd backend && npm run dev
```

---

## Next Steps

1. **Run local tests** to verify code works
2. **Check metrics** - does mean latency improve?
3. **Deploy perf/optimized** when satisfied
4. **Monitor in production** using browser DevTools or analytics
5. **Consider Phase 2 optimizations** (Redis caching, lazy calculation)

---

## Monitoring in Production

After deploying `perf/optimized`, monitor real user metrics:

```typescript
// Add to frontend/src/services/api.ts
export async function fetchIceData(year: number, month: number) {
  const start = performance.now();
  const response = await fetch(`${API_URL}/api/ice?year=${year}&month=${month}`);
  const data = await response.json();
  const latency = performance.now() - start;
  
  // Send to your analytics (e.g., Google Analytics)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'ice_calculation', {
      latency_ms: Math.round(latency),
      year,
      month,
    });
  }
  
  return data;
}
```

Then view metrics in Google Analytics → Engagement → Events → ice_calculation

---

## Questions?

See [PERFORMANCE.md](./PERFORMANCE.md) for detailed optimization strategies and Phase 2 improvements.
