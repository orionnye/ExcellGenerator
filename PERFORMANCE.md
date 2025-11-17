# Performance Benchmarks

This document tracks performance metrics and targets for the ExcelGenerator application.

## Performance Targets

### Structure Detection
- **100 items**: < 50ms
- **500 items**: < 200ms
- **1000 items**: < 500ms
- **5000 items**: < 2000ms

### Data Extraction
- **1000 items**: < 100ms
- **5000 items**: < 500ms

### Excel Generation
- **1000 items**: < 200ms
- **5000 items**: < 1000ms

### Full Pipeline (Detection → Extraction → Excel Generation)
- **1000 items**: < 1000ms
- **5000 items**: < 3000ms

## Optimization Strategies

### Memoization
Structure signatures are memoized using WeakMap for objects and Map for primitives. This provides:
- Automatic garbage collection for cached object signatures
- Significant performance improvement for repeated structure computations
- No memory leaks (WeakMap entries are GC'd when objects are no longer referenced)

### Performance Test Results

Run performance tests with:
```bash
npm test -- --testNamePattern="Performance"
```

Example output:
```
[Performance] 100 items - Structure detection: X.XXms
[Performance] 500 items - Structure detection: X.XXms
[Performance] 1000 items - Structure detection: X.XXms
[Performance] 5000 items - Structure detection: X.XXms
[Performance] 1000 items - Data extraction: X.XXms
[Performance] 5000 items - Data extraction: X.XXms
[Performance] 1000 items - Excel generation: X.XXms
[Performance] 5000 items - Excel generation: X.XXms
[Performance] 1000 items - Full pipeline: X.XXms
[Performance] 5000 items - Full pipeline: X.XXms
[Performance] Memoization impact - Without cache: X.XXms, With cache: X.XXms
```

## Monitoring

### Memory Usage
- WeakMap-based caching prevents memory leaks
- Cache is automatically cleared when objects are garbage collected
- Manual cache clearing available via `clearStructureSignatureCache()` for testing

### Performance Monitoring
- Use Chrome DevTools Performance tab for detailed profiling
- Monitor heap size during large dataset processing
- Watch for UI freezing indicators (long tasks > 50ms)

## Notes

- Performance targets are based on typical hardware (modern desktop/laptop)
- Actual performance may vary based on:
  - Hardware specifications
  - Browser implementation
  - Dataset complexity
  - System load
- For production deployments, consider:
  - Web Workers for very large datasets (10,000+ items)
  - Virtual scrolling for UI rendering
  - Progressive loading for large files

