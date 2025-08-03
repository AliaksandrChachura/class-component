import { describe, it, expect } from 'vitest';
import { useAppDispatch, useAppSelector } from '../hooks';

describe('hooks', () => {
  describe('useAppDispatch', () => {
    it('should be a function', () => {
      expect(typeof useAppDispatch).toBe('function');
    });
  });

  describe('useAppSelector', () => {
    it('should be a function', () => {
      expect(typeof useAppSelector).toBe('function');
    });
  });
});
