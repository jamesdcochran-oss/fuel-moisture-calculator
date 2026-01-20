// Sample test for fuel-moisture-calculator.js
const { 
    calculateMoisture, 
    computeEMC,
    stepMoisture,
    simulateDrying,
    runModel,
    celsiusToFahrenheit,
    fahrenheitToCelsius
} = require('../fuel-moisture-calculator');

describe('Fuel Moisture Calculator Tests', () => {
    
    test('Should calculate moisture correctly for given inputs', () => {
        const input = { temperature: 80, humidity: 40 };
        const output = calculateMoisture(input);
        expect(output).toBe(32);
        expect(parseFloat(output)).toBeGreaterThan(0);
    });

    test('Should throw an error for invalid inputs', () => {
        expect(() => calculateMoisture(null)).toThrow();
    });
});

describe('computeEMC Tests', () => {
    
    test('Should compute EMC correctly for typical conditions', () => {
        const emc = computeEMC(75, 50);
        expect(emc).toBeGreaterThan(0);
        expect(emc).toBeLessThan(30);
    });
    
    test('Should handle low humidity correctly', () => {
        const emc = computeEMC(80, 5);
        expect(emc).toBeGreaterThan(0);
    });
    
    test('Should handle high humidity correctly', () => {
        const emc = computeEMC(60, 90);
        expect(emc).toBeGreaterThan(10);
    });
    
    test('Should handle medium humidity correctly', () => {
        const emc = computeEMC(70, 40);
        expect(emc).toBeCloseTo(7.6, 1);
    });
    
    test('Should throw error for invalid temperature', () => {
        expect(() => computeEMC('invalid', 50)).toThrow();
    });
    
    test('Should throw error for invalid humidity', () => {
        expect(() => computeEMC(75, 'invalid')).toThrow();
    });
});

describe('stepMoisture Tests', () => {
    
    test('Should decrease moisture when current > EMC', () => {
        const result = stepMoisture(12, 8, 12, 10);
        expect(result).toBeLessThan(12);
        expect(result).toBeGreaterThan(8);
    });
    
    test('Should increase moisture when current < EMC', () => {
        const result = stepMoisture(5, 10, 12, 10);
        expect(result).toBeGreaterThan(5);
        expect(result).toBeLessThan(10);
    });
    
    test('Should approach EMC over time', () => {
        let moisture = 20;
        const emc = 10;
        
        for (let i = 0; i < 10; i++) {
            moisture = stepMoisture(moisture, emc, 10, 10);
        }
        
        expect(moisture).toBeCloseTo(emc, 0);
    });
    
    test('Should handle 1-hour time lag', () => {
        const result = stepMoisture(15, 10, 1, 1);
        expect(result).toBeLessThan(15);
        expect(result).toBeGreaterThan(10);
    });
    
    test('Should handle 100-hour time lag', () => {
        const result = stepMoisture(15, 10, 1, 100);
        expect(result).toBeLessThan(15);
        expect(result).toBeCloseTo(15, 0); // Should change very little in 1 hour
    });
    
    test('Should throw error for invalid inputs', () => {
        expect(() => stepMoisture('invalid', 10, 12, 10)).toThrow();
        expect(() => stepMoisture(12, 'invalid', 12, 10)).toThrow();
        expect(() => stepMoisture(12, 10, 'invalid', 10)).toThrow();
        expect(() => stepMoisture(12, 10, 12, 'invalid')).toThrow();
    });
    
    test('Should throw error for zero or negative time lag', () => {
        expect(() => stepMoisture(12, 10, 12, 0)).toThrow();
        expect(() => stepMoisture(12, 10, 12, -1)).toThrow();
    });
});

describe('simulateDrying Tests', () => {
    
    test('Should simulate drying over multiple time steps', () => {
        const dryingInputs = {
            tempSeries: [60, 65, 70],
            rhSeries: [40, 35, 30],
            initialState: { m1: 30.0, m10: 20, m100: 15 },
            timeStep: 1.0
        };
        
        const results = simulateDrying(dryingInputs);
        
        expect(results).toHaveLength(3);
        expect(results[0]).toHaveProperty('m1');
        expect(results[0]).toHaveProperty('m10');
        expect(results[0]).toHaveProperty('m100');
        expect(results[0]).toHaveProperty('emc');
    });
    
    test('Should show decreasing moisture with decreasing humidity', () => {
        const dryingInputs = {
            tempSeries: [70, 70, 70],
            rhSeries: [60, 40, 20],
            initialState: { m1: 20, m10: 20, m100: 20 },
            timeStep: 1.0
        };
        
        const results = simulateDrying(dryingInputs);
        
        expect(results[2].m1).toBeLessThan(results[0].m1);
        expect(results[2].m10).toBeLessThan(results[0].m10);
        expect(results[2].m100).toBeLessThan(results[0].m100);
    });
    
    test('Should handle default timeStep', () => {
        const dryingInputs = {
            tempSeries: [70],
            rhSeries: [50],
            initialState: { m1: 15, m10: 15, m100: 15 }
        };
        
        const results = simulateDrying(dryingInputs);
        
        expect(results).toHaveLength(1);
    });
    
    test('Should throw error for missing inputs', () => {
        expect(() => simulateDrying(null)).toThrow();
        expect(() => simulateDrying({})).toThrow();
        expect(() => simulateDrying({ tempSeries: [70] })).toThrow();
    });
    
    test('Should throw error for mismatched array lengths', () => {
        const dryingInputs = {
            tempSeries: [70, 75],
            rhSeries: [50],
            initialState: { m1: 15, m10: 15, m100: 15 }
        };
        
        expect(() => simulateDrying(dryingInputs)).toThrow();
    });
    
    test('Should track all three fuel classes independently', () => {
        const dryingInputs = {
            tempSeries: [80, 85],
            rhSeries: [30, 25],
            initialState: { m1: 20, m10: 18, m100: 16 },
            timeStep: 6.0
        };
        
        const results = simulateDrying(dryingInputs);
        
        // 1-hour fuel should change most
        const m1Change = Math.abs(results[1].m1 - dryingInputs.initialState.m1);
        const m10Change = Math.abs(results[1].m10 - dryingInputs.initialState.m10);
        const m100Change = Math.abs(results[1].m100 - dryingInputs.initialState.m100);
        
        expect(m1Change).toBeGreaterThan(m10Change);
        expect(m10Change).toBeGreaterThan(m100Change);
    });
});

describe('runModel Tests', () => {
    
    test('Should run multi-day forecast correctly', () => {
        const forecast = [
            { temp: 75, rh: 50, hours: 12 },
            { temp: 80, rh: 40, hours: 12 }
        ];
        
        const results = runModel(10, 12, forecast);
        
        expect(results).toHaveProperty('initial1hr', 10);
        expect(results).toHaveProperty('initial10hr', 12);
        expect(results).toHaveProperty('dailyResults');
        expect(results).toHaveProperty('summary');
        expect(results.dailyResults).toHaveLength(2);
    });
    
    test('Should detect critical drying conditions', () => {
        const forecast = [
            { temp: 85, rh: 30, hours: 12 },
            { temp: 90, rh: 25, hours: 12 },
            { temp: 95, rh: 20, hours: 12 }
        ];
        
        const results = runModel(10, 12, forecast);
        
        // Should eventually reach critical drying
        expect(results.summary.finalMoisture1Hr).toBeLessThan(10);
    });
    
    test('Should handle custom labels', () => {
        const forecast = [
            { label: 'Monday', temp: 70, rh: 60, hours: 12 },
            { label: 'Tuesday', temp: 75, rh: 50, hours: 12 }
        ];
        
        const results = runModel(10, 12, forecast);
        
        expect(results.dailyResults[0].day).toBe('Monday');
        expect(results.dailyResults[1].day).toBe('Tuesday');
    });
    
    test('Should handle wind data when provided', () => {
        const forecast = [
            { temp: 70, rh: 60, hours: 12, wind: 10 }
        ];
        
        const results = runModel(10, 12, forecast);
        
        expect(results.dailyResults[0]).toHaveProperty('wind', 10);
    });
    
    test('Should throw error for invalid initial values', () => {
        const forecast = [{ temp: 70, rh: 50, hours: 12 }];
        
        expect(() => runModel('invalid', 12, forecast)).toThrow();
        expect(() => runModel(10, 'invalid', forecast)).toThrow();
    });
    
    test('Should throw error for invalid forecast', () => {
        expect(() => runModel(10, 12, null)).toThrow();
        expect(() => runModel(10, 12, [])).toThrow();
    });
    
    test('Should throw error for invalid forecast data', () => {
        const forecast = [
            { temp: 'invalid', rh: 50, hours: 12 }
        ];
        
        expect(() => runModel(10, 12, forecast)).toThrow();
    });
    
    test('Should identify first critical day', () => {
        const forecast = [
            { label: 'Day 1', temp: 70, rh: 50, hours: 12 },
            { label: 'Day 2', temp: 85, rh: 25, hours: 24 },
            { label: 'Day 3', temp: 90, rh: 20, hours: 24 }
        ];
        
        const results = runModel(8, 10, forecast);
        
        if (results.summary.firstCritical1HrDay) {
            expect(['Day 2', 'Day 3']).toContain(results.summary.firstCritical1HrDay);
        }
    });
});

describe('Temperature Conversion Tests', () => {
    
    test('Should convert Celsius to Fahrenheit correctly', () => {
        expect(celsiusToFahrenheit(0)).toBe(32);
        expect(celsiusToFahrenheit(100)).toBe(212);
        expect(celsiusToFahrenheit(25)).toBeCloseTo(77, 0);
        expect(celsiusToFahrenheit(-40)).toBe(-40);
    });
    
    test('Should convert Fahrenheit to Celsius correctly', () => {
        expect(fahrenheitToCelsius(32)).toBe(0);
        expect(fahrenheitToCelsius(212)).toBe(100);
        expect(fahrenheitToCelsius(77)).toBeCloseTo(25, 0);
        expect(fahrenheitToCelsius(-40)).toBe(-40);
    });
    
    test('Should throw error for invalid temperature input', () => {
        expect(() => celsiusToFahrenheit('invalid')).toThrow();
        expect(() => fahrenheitToCelsius('invalid')).toThrow();
    });
    
    test('Should handle round-trip conversions', () => {
        const celsius = 20;
        const fahrenheit = celsiusToFahrenheit(celsius);
        const backToCelsius = fahrenheitToCelsius(fahrenheit);
        
        expect(backToCelsius).toBeCloseTo(celsius, 5);
    });
});

describe('Integration Tests', () => {
    
    test('Should work with complete workflow', () => {
        // Start with initial conditions
        let moisture1hr = 15;
        let moisture10hr = 18;
        
        // Simulate several weather periods
        const weatherPeriods = [
            { temp: 75, rh: 50 },
            { temp: 80, rh: 40 },
            { temp: 85, rh: 30 }
        ];
        
        for (const period of weatherPeriods) {
            const emc = computeEMC(period.temp, period.rh);
            moisture1hr = stepMoisture(moisture1hr, emc, 12, 1);
            moisture10hr = stepMoisture(moisture10hr, emc, 12, 10);
        }
        
        // Moisture should have decreased
        expect(moisture1hr).toBeLessThan(15);
        expect(moisture10hr).toBeLessThan(18);
    });
    
    test('Should match runModel with manual simulation', () => {
        const forecast = [
            { temp: 75, rh: 50, hours: 12 }
        ];
        
        const modelResults = runModel(10, 12, forecast);
        
        // Manual calculation
        const emc = computeEMC(75, 50);
        const manual1hr = stepMoisture(10, emc, 12, 1);
        const manual10hr = stepMoisture(12, emc, 12, 10);
        
        expect(modelResults.dailyResults[0].moisture1Hr).toBeCloseTo(manual1hr, 1);
        expect(modelResults.dailyResults[0].moisture10Hr).toBeCloseTo(manual10hr, 1);
    });
});
