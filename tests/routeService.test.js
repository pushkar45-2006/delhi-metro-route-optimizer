// routeService.test.js
//
// Tests for routeService.findRoute(), the function the future Express
// controller will call directly. It should never throw - every problem
// must come back as { success: false, error: "..." }.

const { findRoute } = require('../src/services/routeService');

describe('routeService.findRoute', () => {
  test('returns a successful route between two real stations (distance mode)', () => {
    const result = findRoute('RAJIVCHOWK', 'KASHMEREGATE', 'distance');

    expect(result.success).toBe(true);
    expect(result.mode).toBe('distance');
    expect(result.numberOfStops).toBe(4);
    expect(result.totalDistanceKm).toBeCloseTo(4.3, 5);

    // path should be a list of { id, name } objects, starting and
    // ending at the correct stations.
    expect(result.path[0].id).toBe('RAJIVCHOWK');
    expect(result.path[result.path.length - 1].id).toBe('KASHMEREGATE');
    expect(result.path[0].name).toBe('Rajiv Chowk');
  });

  test('returns a successful route using time mode', () => {
    const result = findRoute('RAJIVCHOWK', 'KASHMEREGATE', 'time');

    expect(result.success).toBe(true);
    expect(result.mode).toBe('time');
    expect(result.totalTravelTimeMin).toBe(9);
  });

  test('defaults to distance mode when mode is not given', () => {
    const result = findRoute('RAJIVCHOWK', 'KASHMEREGATE');
    expect(result.mode).toBe('distance');
  });

  test('handles source equal to destination', () => {
    const result = findRoute('RAJIVCHOWK', 'RAJIVCHOWK', 'distance');

    expect(result.success).toBe(true);
    expect(result.numberOfStops).toBe(0);
    expect(result.totalDistanceKm).toBe(0);
    expect(result.path).toHaveLength(1);
  });

  test('handles an unknown source station without throwing', () => {
    const result = findRoute('NOT_A_REAL_STATION', 'KASHMEREGATE', 'distance');

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });

  test('handles an unknown destination station without throwing', () => {
    const result = findRoute('RAJIVCHOWK', 'NOT_A_REAL_STATION', 'distance');

    expect(result.success).toBe(false);
    expect(typeof result.error).toBe('string');
  });
});