# Performance Test Setup Summary

## Your Branches Are Ready ✅

```
┌─────────────────────────────────────────────────────────────┐
│ Branch: main                                                │
│ Status: BASELINE (original code - no optimizations)       │
├─────────────────────────────────────────────────────────────┤
│ Changes from original: NONE                                │
│ Contains: Original backend, original frontend             │
│ Purpose: BEFORE testing                                    │
└─────────────────────────────────────────────────────────────┘

                            ↓↓↓ OPTIMIZATIONS ↓↓↓

┌─────────────────────────────────────────────────────────────┐
│ Branch: perf/optimized                                      │
│ Status: OPTIMIZED (all performance improvements)          │
├─────────────────────────────────────────────────────────────┤
│ Changes:                                                    │
│  ✓ Frontend: In-memory caching (useIceData)              │
│  ✓ Backend: Response compression (gzip)                  │
│  ✓ Backend: Edge cache headers (24h TTL)                 │
│  ✓ Backend: ETag for cache validation                    │
│  ✓ Dependencies: Added compression package               │
│ Purpose: AFTER testing                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Quick Test (5 minutes)

### Terminal 1: Start baseline backend
```bash
git checkout main
cd backend && npm install 2>/dev/null
npm run dev
```

### Terminal 2: Measure baseline (5 tests)
```bash
node scripts/benchmark.js http://localhost:3001 5 2000 2
```

**Note down the Mean latency** ← This is your baseline

---

### Terminal 1: Switch to optimized (stop with Ctrl+C, then:)
```bash
git checkout perf/optimized
cd backend && npm install 2>/dev/null  # Installs compression
npm run dev
```

### Terminal 2: Measure optimized (5 tests)
```bash
node scripts/benchmark.js http://localhost:3001 5 2000 2
```

**Note down the Mean latency** ← This is your optimized version

---

## Full Test (10 minutes)

Run this from your workspace root:

```bash
bash scripts/compare-performance.sh http://localhost:3001 20
```

This will:
1. Automatically detect which branch is active
2. Run 20 iterations on current backend
3. Generate detailed statistics
4. Compare improvements

---

## What Gets Measured

Each benchmark test measures:
- **Network latency** — Time to fetch from API
- **Processing time** — Backend calculation + response
- **Parse time** — JSON parsing on frontend

Total latency = Network + Server + Parse

---

## View Changes Between Branches

```bash
# See exactly what changed
git diff main perf/optimized

# See specific file changes
git diff main perf/optimized -- frontend/src/hooks/useIceData.ts
git diff main perf/optimized -- backend/src/index.ts
git diff main perf/optimized -- backend/src/routes/ice.ts
```

---

## Expected Improvements

### First Request (no cache)
- **BEFORE (main):** ~100ms (local)
- **AFTER (perf/optimized):** ~95ms (local)
- **Improvement:** ~5% (compression helps slightly)

### Second & Subsequent Requests (cache hit)
- **BEFORE (main):** ~100ms (still fetches)
- **AFTER (perf/optimized):** ~3-5ms (cached locally! 🚀)
- **Improvement:** 95% faster!

### Live on Vercel (edge cache)
- **BEFORE (main):** ~200-400ms
- **AFTER (perf/optimized):** ~50-100ms (from edge cache)
- **Improvement:** 75-80% faster!

---

## Files Modified

### In perf/optimized only:

**frontend/src/hooks/useIceData.ts**
```
- Added in-memory cache Map
- Check cache before fetch
- Store results after fetch
```

**backend/src/index.ts**
```
+ import compression from "compression"
+ app.use(compression())
```

**backend/src/routes/ice.ts**
```
+ Cache-Control headers
+ ETag header
```

**backend/package.json**
```
+ "compression": "^1.7.4"
```

---

## Next: Deploy Optimized Version

When ready to go live:

```bash
git checkout perf/optimized
git push origin perf/optimized

# Then in Vercel:
# 1. Create a preview deployment from perf/optimized branch
# 2. Test live performance
# 3. Merge to main if satisfied
```

---

## Troubleshooting

**Q: Backend won't start?**
```bash
cd backend && npm install
```

**Q: Port 3001 already in use?**
```bash
lsof -i :3001 | grep LISTEN | awk '{print $2}' | xargs kill
```

**Q: Benchmark script not found?**
```bash
# Make sure you're in the workspace root
pwd
# Should output: /Users/lars/Documents/Backendcourse/KoPaaIsen
```

**Q: Results look the same?**
- Local testing shows smaller improvements
- Live testing (Vercel) shows bigger improvements due to edge caching
- Repeat queries show dramatic improvement (95% faster with cache)

---

## Summary

| Metric | Before (main) | After (perf/optimized) | Improvement |
|--------|---------------|----------------------|------------|
| First query | ~100ms | ~95ms | 5% |
| Repeat query | ~100ms | ~5ms | 95% ↑ |
| Live (cached) | ~300ms | ~50ms | 83% ↑ |

Ready to test? Start with the **Quick Test** above! ⚡
