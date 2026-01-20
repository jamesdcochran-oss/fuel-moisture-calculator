/**
 * Comprehensive tests for fuel drying simulation utilities
 * Tests EMC calculations, moisture trends, edge cases, and rainfall scenarios
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator');

describe('computeEMC - Equilibrium Moisture Content', () => {
  test('should calculate EMC for typical fire weather conditions', () => {
    // Hot and dry conditions
    const emc1 = FuelMoistureCalculator.computeEMC(95, 15);
    expect(emc1).toBeGreaterThan(0);
    expect(emc1).toBeLessThan(5); // Very dry
    
    // Moderate conditions
    const emc2 = FuelMoistureCalculator.computeEMC(75, 50);
    expect(emc2).toBeGreaterThan(5);
    expect(emc2).toBeLessThan(15);
    
    // Cool and humid
    const emc3 = FuelMoistureCalculator.computeEMC(55, 80);
    expect(emc3).toBeGreaterThan(12); // Adjusted based on actual EMC formula
  });

  test('should handle low humidity range (< 10%)', () => {
    const emc = FuelMoistureCalculator.computeEMC(90, 5);
    expect(emc).toBeGreaterThan(0);
    expect(emc).toBeLessThan(3);
  });

  test('should handle medium humidity range (10-50%)', () => {
    const emc = FuelMoistureCalculator.computeEMC(80, 30);
    expect(emc).toBeGreaterThan(3);
    expect(emc).toBeLessThan(10);
  });

  test('should handle high humidity range (> 50%)', () => {
    const emc = FuelMoistureCalculator.computeEMC(70, 70);
    expect(emc).toBeGreaterThan(10);
  });

  test('should clamp relative humidity to 0-100 range', () => {
    const emc1 = FuelMoistureCalculator.computeEMC(75, -10);
    const emc2 = FuelMoistureCalculator.computeEMC(75, 0);
    expect(emc1).toBe(emc2);
    
    const emc3 = FuelMoistureCalculator.computeEMC(75, 150);
    const emc4 = FuelMoistureCalculator.computeEMC(75, 100);
    expect(emc3).toBe(emc4);
  });

  test('should throw TypeError for invalid inputs', () => {
    expect(() => FuelMoistureCalculator.computeEMC(NaN, 50)).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.computeEMC(75, Infinity)).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.computeEMC('invalid', 50)).toThrow(TypeError);
  });

  test('should return values with one decimal place', () => {
    const emc = FuelMoistureCalculator.computeEMC(75, 50);
    const decimalPlaces = (emc.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });

  test('should never return negative EMC', () => {
    // Test extreme conditions
    const emc1 = FuelMoistureCalculator.computeEMC(150, 0);
    const emc2 = FuelMoistureCalculator.computeEMC(-50, 100);
    expect(emc1).toBeGreaterThanOrEqual(0);
    expect(emc2).toBeGreaterThanOrEqual(0);
  });
});

describe('stepMoisture - Time-lag Drying Model', () => {
  test('should dry fuel when initial > EMC', () => {
    const initial = 15;
    const emc = 8;
    const final = FuelMoistureCalculator.stepMoisture(initial, emc, 12, 10);
    
    expect(final).toBeLessThan(initial);
    expect(final).toBeGreaterThan(emc);
  });

  test('should wet fuel when initial < EMC', () => {
    const initial = 5;
    const emc = 12;
    const final = FuelMoistureCalculator.stepMoisture(initial, emc, 12, 10);
    
    expect(final).toBeGreaterThan(initial);
    expect(final).toBeLessThan(emc);
  });

  test('should approach EMC asymptotically', () => {
    const initial = 15;
    const emc = 8;
    
    // After increasing time periods
    const m1 = FuelMoistureCalculator.stepMoisture(initial, emc, 10, 10);
    const m2 = FuelMoistureCalculator.stepMoisture(initial, emc, 20, 10);
    const m3 = FuelMoistureCalculator.stepMoisture(initial, emc, 50, 10);
    
    expect(m1).toBeGreaterThan(m2);
    expect(m2).toBeGreaterThan(m3);
    expect(m3).toBeGreaterThanOrEqual(emc); // May equal due to rounding
    expect(m3).toBeCloseTo(emc, 0); // Very close after 5 time constants
  });

  test('should handle different fuel time-lag classes', () => {
    const initial = 12;
    const emc = 6;
    const hours = 12;
    
    // Faster response for smaller time lags
    const moisture1hr = FuelMoistureCalculator.stepMoisture(initial, emc, hours, 1);
    const moisture10hr = FuelMoistureCalculator.stepMoisture(initial, emc, hours, 10);
    const moisture100hr = FuelMoistureCalculator.stepMoisture(initial, emc, hours, 100);
    
    // 1-hr fuels should dry fastest
    expect(moisture1hr).toBeLessThan(moisture10hr);
    expect(moisture10hr).toBeLessThan(moisture100hr);
  });

  test('should return initial value at time=0', () => {
    const initial = 12;
    const emc = 8;
    const moisture = FuelMoistureCalculator.stepMoisture(initial, emc, 0, 10);
    
    expect(moisture).toBe(initial);
  });

  test('should throw TypeError for invalid time-lag', () => {
    expect(() => FuelMoistureCalculator.stepMoisture(12, 8, 12, 0)).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.stepMoisture(12, 8, 12, -5)).toThrow(TypeError);
  });

  test('should throw TypeError for non-finite inputs', () => {
    expect(() => FuelMoistureCalculator.stepMoisture(NaN, 8, 12, 10)).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.stepMoisture(12, Infinity, 12, 10)).toThrow(TypeError);
  });
});

describe('runModel - Multi-day Forecast', () => {
  test('should process multi-day forecast correctly', () => {
    const forecast = [
      { temp: 75, rh: 50, hours: 12 },
      { temp: 80, rh: 40, hours: 12 },
      { temp: 85, rh: 30, hours: 12 }
    ];
    
    const results = FuelMoistureCalculator.runModel(10, 12, forecast);
    
    expect(results.initial1hr).toBe(10);
    expect(results.initial10hr).toBe(12);
    expect(results.dailyResults).toHaveLength(3);
    expect(results.summary).toHaveProperty('final1Hr');
    expect(results.summary).toHaveProperty('final10Hr');
  });

  test('should detect critical drying conditions', () => {
    const forecast = [
      { temp: 85, rh: 30, hours: 12 },
      { temp: 90, rh: 25, hours: 12 },
      { temp: 95, rh: 20, hours: 12 }
    ];
    
    const results = FuelMoistureCalculator.runModel(8, 10, forecast);
    
    // Should detect when 1-hr fuel drops to 6% or below
    if (results.summary.final1Hr <= 6) {
      expect(results.summary.firstCritical1HrDay).toBeTruthy();
    }
  });

  test('should handle custom day labels', () => {
    const forecast = [
      { label: 'Monday', temp: 70, rh: 60, hours: 12 },
      { label: 'Tuesday', temp: 75, rh: 50, hours: 12 }
    ];
    
    const results = FuelMoistureCalculator.runModel(10, 12, forecast);
    
    expect(results.dailyResults[0].day).toBe('Monday');
    expect(results.dailyResults[1].day).toBe('Tuesday');
  });

  test('should preserve optional wind data', () => {
    const forecast = [
      { temp: 75, rh: 50, hours: 12, wind: 15 }
    ];
    
    const results = FuelMoistureCalculator.runModel(10, 12, forecast);
    
    expect(results.dailyResults[0].wind).toBe(15);
  });

  test('should throw TypeError for invalid initial values', () => {
    const forecast = [{ temp: 75, rh: 50, hours: 12 }];
    
    expect(() => FuelMoistureCalculator.runModel(NaN, 12, forecast)).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.runModel(10, Infinity, forecast)).toThrow(TypeError);
  });

  test('should throw TypeError for empty or invalid forecast', () => {
    expect(() => FuelMoistureCalculator.runModel(10, 12, [])).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.runModel(10, 12, null)).toThrow(TypeError);
  });

  test('should throw TypeError for invalid forecast entries', () => {
    const badForecast = [
      { temp: 75, rh: 50, hours: 12 },
      { temp: NaN, rh: 40, hours: 12 }
    ];
    
    expect(() => FuelMoistureCalculator.runModel(10, 12, badForecast)).toThrow(TypeError);
  });
});

describe('simulateDrying - Drying Simulation', () => {
  test('should simulate drying for all fuel classes', () => {
    const params = {
      initial1hr: 15,
      initial10hr: 18,
      initial100hr: 20,
      tempF: 85,
      rh: 30,
      durationHours: 24,
      stepHours: 6
    };
    
    const results = FuelMoistureCalculator.simulateDrying(params);
    
    expect(results.emc).toBeGreaterThan(0);
    expect(results.timeSeries).toBeDefined();
    expect(results.timeSeries.length).toBeGreaterThan(0);
    expect(results.initial).toEqual({
      moisture1hr: 15,
      moisture10hr: 18,
      moisture100hr: 20
    });
    expect(results.final).toHaveProperty('moisture1hr');
    expect(results.final).toHaveProperty('moisture10hr');
    expect(results.final).toHaveProperty('moisture100hr');
  });

  test('should generate hourly time series', () => {
    const params = {
      initial1hr: 12,
      initial10hr: 14,
      initial100hr: 16,
      tempF: 80,
      rh: 40,
      durationHours: 12,
      stepHours: 1
    };
    
    const results = FuelMoistureCalculator.simulateDrying(params);
    
    expect(results.timeSeries.length).toBe(13); // 0 to 12 inclusive
    expect(results.timeSeries[0].hour).toBe(0);
    expect(results.timeSeries[12].hour).toBe(12);
  });

  test('should show progressive drying in hot/dry conditions', () => {
    const params = {
      initial1hr: 15,
      initial10hr: 18,
      initial100hr: 20,
      tempF: 95,
      rh: 15,
      durationHours: 24
    };
    
    const results = FuelMoistureCalculator.simulateDrying(params);
    
    // Final values should be less than initial
    expect(results.final.moisture1hr).toBeLessThan(params.initial1hr);
    expect(results.final.moisture10hr).toBeLessThan(params.initial10hr);
    expect(results.final.moisture100hr).toBeLessThan(params.initial100hr);
    
    // All should approach EMC
    expect(results.final.moisture1hr).toBeGreaterThanOrEqual(results.emc - 1);
  });

  test('should throw TypeError for invalid parameters', () => {
    const invalidParams = {
      initial1hr: NaN,
      initial10hr: 14,
      initial100hr: 16,
      tempF: 80,
      rh: 40,
      durationHours: 24
    };
    
    expect(() => FuelMoistureCalculator.simulateDrying(invalidParams)).toThrow(TypeError);
  });

  test('should throw TypeError for non-positive duration or step', () => {
    const params = {
      initial1hr: 12,
      initial10hr: 14,
      initial100hr: 16,
      tempF: 80,
      rh: 40,
      durationHours: 0
    };
    
    expect(() => FuelMoistureCalculator.simulateDrying(params)).toThrow(TypeError);
    
    params.durationHours = 24;
    params.stepHours = -1;
    expect(() => FuelMoistureCalculator.simulateDrying(params)).toThrow(TypeError);
  });
});

describe('analyzeDryingPattern - Pattern Analysis', () => {
  test('should calculate drying rates correctly', () => {
    const moistureData = [
      { hour: 0, moisture1hr: 15, moisture10hr: 18 },
      { hour: 6, moisture1hr: 12, moisture10hr: 16 },
      { hour: 12, moisture1hr: 9, moisture10hr: 14 }
    ];
    
    const analysis = FuelMoistureCalculator.analyzeDryingPattern(moistureData);
    
    expect(analysis.dryingRates.fuel1hr.avg).toBeLessThan(0); // Drying = negative rate
    expect(analysis.dryingRates.fuel10hr.avg).toBeLessThan(0);
    expect(analysis.dryingRates.fuel1hr.max).toBeDefined();
    expect(analysis.dryingRates.fuel1hr.min).toBeDefined();
  });

  test('should identify threshold crossings', () => {
    const moistureData = [
      { hour: 0, moisture1hr: 10, moisture10hr: 12 },
      { hour: 6, moisture1hr: 7, moisture10hr: 10 },
      { hour: 12, moisture1hr: 5, moisture10hr: 8 },
      { hour: 18, moisture1hr: 4, moisture10hr: 6 }
    ];
    
    const analysis = FuelMoistureCalculator.analyzeDryingPattern(moistureData, 6);
    
    expect(analysis.thresholdCrossings.fuel1hr).toBe(12); // First time ≤ 6%
    expect(analysis.thresholdCrossings.fuel10hr).toBe(18);
  });

  test('should identify critical periods', () => {
    const moistureData = [
      { hour: 0, moisture1hr: 8, moisture10hr: 10 },
      { hour: 6, moisture1hr: 5, moisture10hr: 8 },  // Critical starts
      { hour: 12, moisture1hr: 4, moisture10hr: 6 }, // Still critical
      { hour: 18, moisture1hr: 7, moisture10hr: 8 }  // Recovery
    ];
    
    const analysis = FuelMoistureCalculator.analyzeDryingPattern(moistureData, 6);
    
    expect(analysis.criticalPeriods.length).toBeGreaterThan(0);
    expect(analysis.criticalPeriods[0].start).toBe(6);
    expect(analysis.criticalPeriods[0].end).toBe(12);
    expect(analysis.criticalPeriods[0].duration).toBe(6);
  });

  test('should handle abrupt rainfall scenario (wetting)', () => {
    const moistureData = [
      { hour: 0, moisture1hr: 5, moisture10hr: 8 },  // Dry
      { hour: 6, moisture1hr: 4, moisture10hr: 7 },  // Drier
      { hour: 12, moisture1hr: 12, moisture10hr: 10 }, // Rain!
      { hour: 18, moisture1hr: 15, moisture10hr: 13 }  // Still wet
    ];
    
    const analysis = FuelMoistureCalculator.analyzeDryingPattern(moistureData, 6);
    
    // Should show positive (wetting) rates in some periods
    expect(analysis.dryingRates.fuel1hr.max).toBeGreaterThan(0);
    
    // Critical period should end before rainfall
    if (analysis.criticalPeriods.length > 0) {
      expect(analysis.criticalPeriods[0].end).toBeLessThanOrEqual(6);
    }
  });

  test('should handle continuous critical drying', () => {
    const moistureData = [
      { hour: 0, moisture1hr: 6, moisture10hr: 8 },
      { hour: 6, moisture1hr: 5, moisture10hr: 7 },
      { hour: 12, moisture1hr: 4, moisture10hr: 6 },
      { hour: 18, moisture1hr: 3, moisture10hr: 5 }
    ];
    
    const analysis = FuelMoistureCalculator.analyzeDryingPattern(moistureData, 6);
    
    // Should have one continuous critical period
    expect(analysis.criticalPeriods.length).toBe(1);
    expect(analysis.criticalPeriods[0].start).toBe(0);
    expect(analysis.criticalPeriods[0].end).toBe(18);
  });

  test('should throw TypeError for invalid inputs', () => {
    expect(() => FuelMoistureCalculator.analyzeDryingPattern([])).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.analyzeDryingPattern(null)).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.analyzeDryingPattern([{hour: 0}], NaN)).toThrow(TypeError);
  });
});

describe('Edge Cases and EMC Decay Behavior', () => {
  test('should handle extreme temperature ranges', () => {
    // Very cold
    const emc1 = FuelMoistureCalculator.computeEMC(-20, 80);
    expect(emc1).toBeGreaterThanOrEqual(0);
    
    // Very hot
    const emc2 = FuelMoistureCalculator.computeEMC(120, 15);
    expect(emc2).toBeGreaterThanOrEqual(0);
  });

  test('should handle prolonged drying periods', () => {
    const params = {
      initial1hr: 15,
      initial10hr: 18,
      initial100hr: 20,
      tempF: 95,
      rh: 10,
      durationHours: 168 // 1 week
    };
    
    const results = FuelMoistureCalculator.simulateDrying(params);
    
    // After long time, should be very close to EMC
    expect(Math.abs(results.final.moisture1hr - results.emc)).toBeLessThan(0.5);
  });

  test('should handle rapid oscillations (day/night cycles)', () => {
    const forecast = [
      { temp: 90, rh: 20, hours: 12 },  // Hot day
      { temp: 60, rh: 70, hours: 12 },  // Cool night
      { temp: 92, rh: 18, hours: 12 },  // Hot day
      { temp: 58, rh: 75, hours: 12 }   // Cool night
    ];
    
    const results = FuelMoistureCalculator.runModel(10, 12, forecast);
    
    // Should track both drying and recovery
    expect(results.dailyResults.length).toBe(4);
    
    // 1-hr fuels should respond to each period
    const day1 = results.dailyResults[0].moisture1Hr;
    const night1 = results.dailyResults[1].moisture1Hr;
    
    expect(day1).toBeLessThan(10); // Dried during hot day
    expect(night1).toBeGreaterThan(day1); // Recovered at night
  });

  test('should handle zero EMC edge case', () => {
    // Extreme conditions that might produce very low EMC
    const emc = FuelMoistureCalculator.computeEMC(150, 1);
    expect(emc).toBeGreaterThanOrEqual(0);
  });

  test('should maintain precision across calculations', () => {
    const moisture1 = FuelMoistureCalculator.stepMoisture(12.345, 8.765, 5.5, 10.25);
    
    // Should return value with one decimal place
    const decimalPlaces = (moisture1.toString().split('.')[1] || '').length;
    expect(decimalPlaces).toBeLessThanOrEqual(1);
  });
});

describe('Temperature Conversion Utilities', () => {
  test('should convert Celsius to Fahrenheit correctly', () => {
    expect(FuelMoistureCalculator.celsiusToFahrenheit(0)).toBe(32);
    expect(FuelMoistureCalculator.celsiusToFahrenheit(100)).toBe(212);
    expect(FuelMoistureCalculator.celsiusToFahrenheit(25)).toBeCloseTo(77, 0);
  });

  test('should convert Fahrenheit to Celsius correctly', () => {
    expect(FuelMoistureCalculator.fahrenheitToCelsius(32)).toBe(0);
    expect(FuelMoistureCalculator.fahrenheitToCelsius(212)).toBe(100);
    expect(FuelMoistureCalculator.fahrenheitToCelsius(77)).toBeCloseTo(25, 0);
  });

  test('should handle negative temperatures', () => {
    const f = FuelMoistureCalculator.celsiusToFahrenheit(-40);
    expect(f).toBe(-40); // -40°C = -40°F
    
    const c = FuelMoistureCalculator.fahrenheitToCelsius(-40);
    expect(c).toBe(-40);
  });

  test('should throw TypeError for invalid inputs', () => {
    expect(() => FuelMoistureCalculator.celsiusToFahrenheit(NaN)).toThrow(TypeError);
    expect(() => FuelMoistureCalculator.fahrenheitToCelsius(Infinity)).toThrow(TypeError);
  });
});

describe('Backward Compatibility', () => {
  test('should maintain legacy calculateMoisture function', () => {
    const input = { temperature: 80, humidity: 40 };
    const result = FuelMoistureCalculator.calculateMoisture(input);
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });

  test('should maintain legacy someOtherFunction', () => {
    const result = FuelMoistureCalculator.someOtherFunction();
    expect(result).toBe(true);
  });
});
