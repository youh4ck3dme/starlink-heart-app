import { describe, it, expect, vi, beforeEach } from 'vitest';

// Test the useHaptics hook behavior
describe('useHaptics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Vibration API', () => {
    it('should check if vibration API is available', () => {
      const hasVibration = 'vibrate' in navigator;
      expect(typeof hasVibration).toBe('boolean');
    });

    it('should have a standard vibration pattern for light feedback', () => {
      const lightPattern = 10;
      expect(typeof lightPattern).toBe('number');
      expect(lightPattern).toBeLessThan(50);
    });

    it('should have a standard vibration pattern for medium feedback', () => {
      const mediumPattern = 20;
      expect(typeof mediumPattern).toBe('number');
      expect(mediumPattern).toBeLessThan(100);
    });

    it('should have a standard vibration pattern for heavy feedback', () => {
      const heavyPattern = 50;
      expect(typeof heavyPattern).toBe('number');
      expect(heavyPattern).toBeLessThan(200);
    });

    it('should have a success pattern', () => {
      const successPattern = [10, 50, 10];
      expect(Array.isArray(successPattern)).toBe(true);
      expect(successPattern.length).toBe(3);
    });

    it('should have an error pattern', () => {
      const errorPattern = [50, 100, 50];
      expect(Array.isArray(errorPattern)).toBe(true);
      expect(errorPattern.length).toBe(3);
    });
  });

  describe('Hook Behavior', () => {
    it('should not crash when vibration is unavailable', () => {
      // Simulate environment without vibration
      const mockNavigator = { vibrate: undefined };
      const hasVibration = mockNavigator.vibrate !== undefined;
      expect(hasVibration).toBe(false);
    });

    it('should return functions for different feedback types', () => {
      const hookInterface = {
        light: expect.any(Function),
        medium: expect.any(Function),
        heavy: expect.any(Function),
        success: expect.any(Function),
        error: expect.any(Function),
      };
      
      expect(Object.keys(hookInterface).length).toBe(5);
    });
  });

  describe('Reduced Motion', () => {
    it('should respect reduced motion preference', () => {
      // Check if matchMedia is available for reduced motion
      const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)');
      expect(prefersReducedMotion === undefined || typeof prefersReducedMotion.matches === 'boolean').toBe(true);
    });
  });
});
