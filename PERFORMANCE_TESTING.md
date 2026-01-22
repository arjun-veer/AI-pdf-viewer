# Performance Testing Guide

This document provides guidelines for testing the AI PDF Viewer with large PDF files to ensure optimal performance.

## Performance Targets

### Baseline Requirements (v0.0.1)
- **Render Time:** < 50ms per page
- **Memory Usage:** < 150MB for 100-page PDF
- **Scroll Performance:** 60 FPS during scrolling
- **Initial Load:** < 2s for 100-page PDF

### Large PDF Performance (1000+ pages)
- **Render Time:** < 50ms per page (consistent)
- **Memory Usage:** < 300MB for 1000-page PDF
- **Cache Efficiency:** > 80% hit rate
- **Virtual Scrolling:** Smooth at all positions

## Test Scenarios

### 1. Small PDF (< 50 pages)
**Test File Requirements:**
- 10-50 pages
- Mixed content (text, images)
- Standard page sizes (A4/Letter)

**Expected Results:**
- Instant page navigation
- < 1s initial load
- < 50MB memory usage

### 2. Medium PDF (50-200 pages)
**Test File Requirements:**
- 50-200 pages
- Text-heavy content
- Some images and graphics

**Expected Results:**
- < 2s initial load
- Smooth scrolling throughout
- 50-100MB memory usage
- Virtual scrolling working correctly

### 3. Large PDF (200-1000 pages)
**Test File Requirements:**
- 200-1000 pages
- Mixed content types
- Various page sizes

**Expected Results:**
- < 5s initial load
- Consistent render times
- < 200MB memory usage
- No memory leaks during extended use
- Cache working efficiently

### 4. Extra Large PDF (1000+ pages)
**Test File Requirements:**
- 1000+ pages
- Real-world documents (books, manuals)
- High-resolution images optional

**Expected Results:**
- < 10s initial load
- Stable memory usage
- No performance degradation
- Virtual scrolling maintains 60 FPS
- Cache hit rate > 80%

## Performance Testing Procedure

### Manual Testing

1. **Initial Load Test**
   ```
   1. Open PDF file
   2. Measure time to first render
   3. Check memory usage in DevTools
   4. Verify all UI elements responsive
   ```

2. **Scrolling Performance**
   ```
   1. Scroll rapidly through document
   2. Monitor FPS in DevTools Performance tab
   3. Check for frame drops
   4. Verify pages render smoothly
   ```

3. **Memory Leak Test**
   ```
   1. Open large PDF
   2. Scroll through entire document
   3. Navigate to different pages
   4. Monitor memory usage over 5 minutes
   5. Close and reopen document
   6. Verify memory is released
   ```

4. **Cache Efficiency Test**
   ```
   1. Navigate to page 50
   2. Scroll up and down around page 50
   3. Check console for cache stats
   4. Verify cache hit rate > 80%
   ```

### Automated Performance Monitoring

The app includes built-in performance monitoring:

```typescript
import { performanceMonitor } from '@/services/performanceMonitor';

// Check render stats
performanceMonitor.logStats('render-page');

// Check memory usage
performanceMonitor.checkMemoryUsage();

// Get all metrics
const stats = performanceMonitor.getAllStats();
console.log('Performance Metrics:', stats);
```

### Using Browser DevTools

1. **Performance Tab**
   - Record session while scrolling
   - Look for long tasks (> 50ms)
   - Check frame rate consistency

2. **Memory Tab**
   - Take heap snapshot before loading PDF
   - Take heap snapshot after loading PDF
   - Compare memory allocation
   - Look for detached DOM nodes

3. **Network Tab**
   - Monitor worker thread activity
   - Check for unnecessary requests

## Performance Optimization Checklist

- [ ] Virtual scrolling implemented
- [ ] Canvas pooling active
- [ ] Page cache working (LRU eviction)
- [ ] Render time < 50ms per page
- [ ] Memory usage within limits
- [ ] No memory leaks detected
- [ ] Smooth scrolling at 60 FPS
- [ ] Cache hit rate > 80%
- [ ] Initial load time acceptable
- [ ] Performance warnings logged

## Common Performance Issues

### Issue: Slow Page Rendering
**Symptoms:** Pages take > 100ms to render
**Solutions:**
- Check PDF.js worker configuration
- Verify canvas pooling is active
- Reduce render scale temporarily
- Check for overscan value too high

### Issue: High Memory Usage
**Symptoms:** Memory > 300MB for medium PDFs
**Solutions:**
- Reduce cache size (setMaxCacheSize)
- Verify page cleanup in virtual scroll
- Check for canvas leaks
- Monitor canvas pool size

### Issue: Scroll Lag
**Symptoms:** Scroll performance < 60 FPS
**Solutions:**
- Increase overscan value
- Optimize virtual scroll calculation
- Reduce simultaneous renders
- Check for heavy React re-renders

### Issue: Memory Leaks
**Symptoms:** Memory continuously increases
**Solutions:**
- Verify cleanup in useEffect hooks
- Check canvas pool release
- Ensure page cache eviction working
- Monitor event listener cleanup

## Reporting Performance Issues

When reporting performance issues, include:

1. PDF file characteristics (pages, size, content type)
2. Performance metrics from console
3. Browser and OS information
4. DevTools Performance recording
5. Memory snapshots (before/after)
6. Steps to reproduce

## Continuous Performance Monitoring

For development:

```bash
# Run tests with performance monitoring
bun run test

# Build and check bundle size
bun run build

# Check for performance warnings in console
# During normal usage
```

## Performance Benchmarking

### Creating Benchmark Tests

```typescript
// Example: Benchmark render performance
const iterations = 100;
const results: number[] = [];

for (let i = 0; i < iterations; i++) {
  const endTiming = performanceMonitor.start('benchmark-render');
  await pdfService.renderPage(1, canvas, { scale: 1.0 });
  endTiming();
}

const stats = performanceMonitor.getStats('benchmark-render');
console.log(`Average render time: ${stats?.avg.toFixed(2)}ms`);
console.log(`Min: ${stats?.min.toFixed(2)}ms, Max: ${stats?.max.toFixed(2)}ms`);
```

## Success Criteria

For v0.0.1 release, the following must be verified:

- ✅ 100-page PDF loads in < 2s
- ✅ Average render time < 50ms
- ✅ Memory usage < 150MB for 100-page PDF
- ✅ Smooth scrolling (60 FPS) maintained
- ✅ 1000-page PDF navigable without crashes
- ✅ No memory leaks after 10 minutes of use
- ✅ Cache efficiency > 80% hit rate

## Next Steps

After v0.0.1 release:
1. Set up automated performance regression tests
2. Create performance dashboard
3. Implement A/B testing for optimizations
4. Monitor real-world performance metrics
5. Optimize for mobile/low-end devices
