# Before/After Test — Quick Reference

## 🎯 Your Setup is Ready!

**Branch Status:**

```
main                    ← Original code (BEFORE)
├── No optimizations
├── Baseline for comparison
└── Starting point

perf/optimized          ← Optimized code (AFTER)
├── Frontend caching
├── Response compression
├── Edge cache headers
└── Ready to benchmark
```

---

## ⚡ 60-Second Quick Test

### Step 1: Start backend on main (Terminal 1)

```bash
git checkout main
cd backend && npm run dev
```

Wait for "Ko på Isen backend running"

### Step 2: Benchmark main (Terminal 2)

```bash
node scripts/benchmark.js http://localhost:3001 10 2000 2
```

**Write down the "Mean" value** → This is your BEFORE baseline

### Step 3: Switch to optimized (back to Terminal 1: Ctrl+C, then:)

```bash
git checkout perf/optimized
cd backend && npm install
npm run dev
```

### Step 4: Benchmark optimized (Terminal 2)

```bash
node scripts/benchmark.js http://localhost:3001 10 2000 2
```

**Write down the "Mean" value** → This is your AFTER result

### Step 5: Calculate improvement

```
Improvement = ((Before - After) / Before) × 100%
```

---

## 📊 Expected Results

For **first request** (both versions):

- Before: ~100ms
- After: ~95ms
- Improvement: ~5%

For **repeat requests** (cache hits):

- Before: ~100ms (always fetches)
- After: ~5ms (from cache!)
- Improvement: ~95% 🚀

For **live on Vercel** (edge caching):

- Before: ~250-350ms
- After: ~50-100ms (from edge)
- Improvement: ~70-80% 🚀🚀

---

## 🔄 Swap Between Branches

```bash
# See which branch you're on
git branch

# Switch to baseline
git checkout main

# Switch to optimized
git checkout perf/optimized

# See the differences
git diff main perf/optimized
```

---

## 📋 What Changed

| File                               | Change                      | Impact                  |
| ---------------------------------- | --------------------------- | ----------------------- |
| `frontend/src/hooks/useIceData.ts` | Added Map caching           | Repeats: 95% faster     |
| `backend/src/index.ts`             | Added compression           | Network: 10-20% smaller |
| `backend/src/routes/ice.ts`        | Added Cache-Control headers | Edge: 75% faster        |
| `backend/package.json`             | Added compression pkg       | Enables gzip            |

---

## 🚀 Next: Deploy

When you're happy with results:

```bash
# Make sure optimized is pushed
git push origin perf/optimized

# In Vercel dashboard:
# 1. Deploy from perf/optimized branch
# 2. Test live performance
# 3. Merge to main if satisfied
```

---

## ✅ Checklists

### Before Testing

- [ ] Backend has Turso credentials (TURSO_URL, TURSO_TOKEN)
- [ ] Frontend is running (or ready to test via API)
- [ ] Port 3001 is free
- [ ] Node.js and npm are installed

### During Testing

- [ ] Noted BEFORE mean latency
- [ ] Restarted backend for AFTER test
- [ ] Noted AFTER mean latency
- [ ] Calculated percentage improvement

### After Testing

- [ ] Results recorded
- [ ] Ready to deploy optimized version
- [ ] Understand what each optimization does

---

## 🆘 Troubleshooting

| Problem                      | Solution                                                                 |
| ---------------------------- | ------------------------------------------------------------------------ |
| "Port 3001 in use"           | `lsof -i :3001 \| grep LISTEN \| awk '{print $2}' \| xargs kill`         |
| "Module not found"           | `cd backend && npm install`                                              |
| "Backend won't start"        | Check .env has TURSO_URL and TURSO_TOKEN                                 |
| "Benchmark file not found"   | Make sure pwd is `/Users/lars/Documents/Backendcourse/KoPaaIsen`         |
| "Same results both versions" | Normal for local testing with low latency. Bigger gains on live/repeats. |

---

## 📚 Full Documentation

- **PERFORMANCE.md** — Detailed optimization strategies and Phase 2 ideas
- **TESTING.md** — Complete testing guide with all options
- **TEST_SETUP.md** — Visual branch summary and detailed walkthrough

---

**Ready? Start with Step 1 above!** ⚡
