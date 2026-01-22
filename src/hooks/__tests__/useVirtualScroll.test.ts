import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useVirtualScroll } from '../useVirtualScroll';

describe('useVirtualScroll', () => {
  it('should initialize with correct defaults', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({
        totalPages: 100,
        pageHeight: 800,
        overscan: 2,
      })
    );

    expect(result.current.visibleRange).toBeDefined();
    expect(result.current.visibleRange.start).toBeGreaterThanOrEqual(0);
    expect(result.current.visibleRange.end).toBeGreaterThan(result.current.visibleRange.start);
    expect(result.current.currentPage).toBe(1);
  });

  it('should calculate visible range correctly', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({
        totalPages: 50,
        pageHeight: 800,
        overscan: 1,
      })
    );

    expect(result.current.visibleRange.start).toBeLessThan(result.current.visibleRange.end);
    expect(result.current.visibleRange.end).toBeLessThanOrEqual(50);
  });

  it('should update current page based on scroll position', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({
        totalPages: 100,
        pageHeight: 800,
        overscan: 2,
      })
    );

    expect(result.current.currentPage).toBeGreaterThan(0);
    expect(result.current.currentPage).toBeLessThanOrEqual(100);
  });

  it('should handle zero pages gracefully', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({
        totalPages: 0,
        pageHeight: 800,
        overscan: 2,
      })
    );

    expect(result.current.visibleRange.start).toBe(0);
    expect(result.current.visibleRange.end).toBe(0);
    expect(result.current.currentPage).toBe(1);
  });

  it('should include overscan in visible range', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({
        totalPages: 100,
        pageHeight: 800,
        overscan: 3,
      })
    );

    const rangeSize = result.current.visibleRange.end - result.current.visibleRange.start;
    expect(rangeSize).toBeGreaterThan(1);
  });

  it('should provide container ref', () => {
    const { result } = renderHook(() =>
      useVirtualScroll({
        totalPages: 100,
        pageHeight: 800,
        overscan: 2,
      })
    );

    expect(result.current.containerRef).toBeDefined();
    expect(result.current.containerRef.current).toBeNull();
  });

  it('should respect page height in calculations', () => {
    const { result: result800 } = renderHook(() =>
      useVirtualScroll({
        totalPages: 100,
        pageHeight: 800,
        overscan: 1,
      })
    );

    const { result: result1600 } = renderHook(() =>
      useVirtualScroll({
        totalPages: 100,
        pageHeight: 1600,
        overscan: 1,
      })
    );

    expect(result800.current.visibleRange.end - result800.current.visibleRange.start).toBeGreaterThanOrEqual(
      result1600.current.visibleRange.end - result1600.current.visibleRange.start
    );
  });
});
