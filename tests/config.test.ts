import { describe, it, expect } from 'vitest';
import * as path from 'path';
import config from "../config.json" assert { type: "json" };

describe('Configuration Loading', () => {
  it('should load configuration successfully', () => {
    expect(config).toBeDefined();
    expect(config).toHaveProperty('backgroundKey');
    expect(config).toHaveProperty('font');
    expect(config).toHaveProperty('fontSize');
    expect(config).toHaveProperty('textColor');
    expect(config).toHaveProperty('placement');
  });

  it('should have valid configuration values', () => {
    expect(config.backgroundKey).toMatch(/\.png$/);
    expect(config.font).toBeTruthy();
    expect(config.fontSize).toBeGreaterThan(0);
    expect(config.textColor).toMatch(/^#[0-9A-Fa-f]{6}$/);
    
    expect(config.placement).toHaveProperty('header');
    expect(config.placement).toHaveProperty('checklist');
    
    expect(config.placement.header).toHaveProperty('x');
    expect(config.placement.header).toHaveProperty('y');
    expect(config.placement.checklist).toHaveProperty('x');
    expect(config.placement.checklist).toHaveProperty('y');
  });

  it('should throw error for non-existent config file', async () => {
    const invalidPath = path.join(__dirname, 'non_existent_config.json');
    
    await expect(() => import(invalidPath)).rejects.toThrow();
  });
}); 