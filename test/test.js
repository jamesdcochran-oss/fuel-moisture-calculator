/**
 * Test Suite for Fuel Moisture Calculator
 * Validates all functions and edge cases
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

// Updating tests to improve coverage

describe('Fuel Moisture Calculator Expanded Tests', () => {
    test('runModel processes simple multi-day forecasts', () => {
        const results = FuelMoistureCalculator.runModel(10, 12, [
            { temp: 75, rh: 50, hours: 12 },
            { temp: 80, rh: 40, hours: 12 },
        ]);
        expect(results.initial1hr).toBe(10);
        expect(results.dailyResults[0].temp).toBe(75);
        expect(results.dailyResults[1].moisture1Hr).toBeLessThan(results.initial1hr);
        expect(results.summary.firstCritical1HrDay).toBe(null);
    });

    test('computeEMC clamps humidity to [0, 100]', () => {
        expect(FuelMoistureCalculator.computeEMC(85, 150)).toBeCloseTo(4.1, 1); // Clamped RH
        expect(FuelMoistureCalculator.computeEMC(85, -50)).toBeCloseTo(0.1, 1); // Clamped RH
    });

    test('computeEMC returns finite results for valid inputs', () => {
        expect(FuelMoistureCalculator.computeEMC(70, 50)).toBeGreaterThan(0);
        expect(FuelMoistureCalculator.computeEMC(90, 10)).toBeGreaterThanOrEqual(0.1);
    });

    test('stepMoisture handles zero hours and small time-lags', () => {
        expect(FuelMoistureCalculator.stepMoisture(12, 10, 0, 10)).toBe(12);
        expect(FuelMoistureCalculator.stepMoisture(12, 10, 12, 0.1)).toBeGreaterThan(10);
    });

    test('stepMoisture correctly approaches EMC', () => {
        const result = FuelMoistureCalculator.stepMoisture(12, 8, 6, 1);
        expect(result).toBeLessThan(12);
        expect(result).toBeGreaterThan(8);
    });
});
