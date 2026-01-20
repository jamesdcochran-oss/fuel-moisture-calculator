// Tests for Drying Trend Prediction Feature
const { 
    predictDryingTrend, 
    interpolateWeatherData,
    computeEMC,
    stepMoisture,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    runModel
} = require('../fuel-moisture-calculator');

describe('Core EMC and Time-Lag Functions', () => {
    test('computeEMC should calculate EMC correctly', () => {
        const emc = computeEMC(75, 50);
        expect(emc).toBeGreaterThan(0);
        expect(emc).toBeLessThan(100);
    });

    test('computeEMC should throw error for invalid inputs', () => {
        expect(() => computeEMC(NaN, 50)).toThrow(TypeError);
        expect(() => computeEMC(75, Infinity)).toThrow(TypeError);
    });

    test('stepMoisture should calculate new moisture correctly', () => {
        const newMoisture = stepMoisture(12, 8, 12, 10);
        expect(newMoisture).toBeLessThan(12);
        expect(newMoisture).toBeGreaterThan(8);
    });

    test('stepMoisture should throw error for invalid time lag', () => {
        expect(() => stepMoisture(12, 8, 12, 0)).toThrow(TypeError);
        expect(() => stepMoisture(12, 8, 12, -5)).toThrow(TypeError);
    });

    test('celsiusToFahrenheit should convert correctly', () => {
        expect(celsiusToFahrenheit(0)).toBe(32);
        expect(celsiusToFahrenheit(100)).toBe(212);
        expect(celsiusToFahrenheit(25)).toBeCloseTo(77, 0);
    });

    test('fahrenheitToCelsius should convert correctly', () => {
        expect(fahrenheitToCelsius(32)).toBe(0);
        expect(fahrenheitToCelsius(212)).toBe(100);
        expect(fahrenheitToCelsius(77)).toBeCloseTo(25, 0);
    });
});

describe('runModel Multi-Day Forecast', () => {
    test('runModel should process forecast correctly', () => {
        const forecast = [
            { temp: 75, rh: 50, hours: 12 },
            { temp: 80, rh: 40, hours: 12 }
        ];
        
        const result = runModel(10, 12, forecast);
        
        expect(result.initial1hr).toBe(10);
        expect(result.initial10hr).toBe(12);
        expect(result.dailyResults).toHaveLength(2);
        expect(result.summary).toBeDefined();
    });

    test('runModel should detect critical moisture', () => {
        const forecast = [
            { temp: 90, rh: 25, hours: 24 },
            { temp: 95, rh: 20, hours: 24 },
            { temp: 100, rh: 15, hours: 24 }
        ];
        
        const result = runModel(8, 10, forecast);
        
        expect(result.summary.firstCritical1HrDay).toBeTruthy();
    });

    test('runModel should preserve wind data', () => {
        const forecast = [
            { temp: 75, rh: 50, hours: 12, wind: 10, label: 'Monday' }
        ];
        
        const result = runModel(10, 12, forecast);
        
        expect(result.dailyResults[0].wind).toBe(10);
        expect(result.dailyResults[0].day).toBe('Monday');
    });

    test('runModel should throw error for empty forecast', () => {
        expect(() => runModel(10, 12, [])).toThrow(TypeError);
    });
});

describe('predictDryingTrend Function', () => {
    const validHistorical = [
        { temp: 70, rh: 60 },
        { temp: 75, rh: 55 }
    ];
    
    const validPredicted = [
        { temp: 80, rh: 50 },
        { temp: 85, rh: 45 }
    ];

    test('should predict drying trend with valid inputs', () => {
        const result = predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: validHistorical,
            predictedWeather: validPredicted,
            timeLag: 10
        });

        expect(result).toHaveProperty('metadata');
        expect(result).toHaveProperty('trend');
        expect(result).toHaveProperty('summary');
        expect(result.trend).toHaveLength(4);
    });

    test('should detect critical moisture threshold', () => {
        const forecast = Array.from({ length: 10 }, (_, i) => ({
            temp: 90 + i * 2,
            rh: Math.max(15, 40 - i * 3)
        }));

        const result = predictDryingTrend({
            currentMoisture: 12,
            historicalWeather: [{ temp: 70, rh: 60 }],
            predictedWeather: forecast,
            timeLag: 1
        });

        expect(result.summary.criticalTime).toBeTruthy();
        expect(result.summary.belowCritical).toBe(true);
    });

    test('should handle wind speed data', () => {
        const withWind = [
            { temp: 80, rh: 50, wind: 10 },
            { temp: 85, rh: 45, wind: 15 }
        ];

        const result = predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: validHistorical,
            predictedWeather: withWind,
            timeLag: 10
        });

        const forecastPeriods = result.trend.filter(p => p.type === 'forecast');
        expect(forecastPeriods[0].wind).toBe(10);
        expect(forecastPeriods[1].wind).toBe(15);
    });

    test('should throw error for invalid current moisture', () => {
        expect(() => predictDryingTrend({
            currentMoisture: -5,
            historicalWeather: validHistorical,
            predictedWeather: validPredicted,
            timeLag: 10
        })).toThrow(TypeError);

        expect(() => predictDryingTrend({
            currentMoisture: 150,
            historicalWeather: validHistorical,
            predictedWeather: validPredicted,
            timeLag: 10
        })).toThrow(TypeError);
    });

    test('should throw error for invalid time lag', () => {
        expect(() => predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: validHistorical,
            predictedWeather: validPredicted,
            timeLag: -10
        })).toThrow(TypeError);

        expect(() => predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: validHistorical,
            predictedWeather: validPredicted,
            timeLag: 0
        })).toThrow(TypeError);
    });

    test('should throw error for empty weather arrays', () => {
        expect(() => predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: [],
            predictedWeather: validPredicted,
            timeLag: 10
        })).toThrow(TypeError);

        expect(() => predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: validHistorical,
            predictedWeather: [],
            timeLag: 10
        })).toThrow(TypeError);
    });

    test('should handle custom critical threshold', () => {
        const result = predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: validHistorical,
            predictedWeather: validPredicted,
            timeLag: 10
        }, { criticalThreshold: 10 });

        expect(result.metadata.criticalThreshold).toBe(10);
    });

    test('should calculate moisture change correctly', () => {
        const result = predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: validHistorical,
            predictedWeather: validPredicted,
            timeLag: 10
        });

        const expectedChange = result.summary.endingMoisture - result.summary.startingMoisture;
        expect(result.summary.moistureChange).toBeCloseTo(expectedChange, 1);
    });

    test('should track min and max moisture', () => {
        const result = predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: validHistorical,
            predictedWeather: validPredicted,
            timeLag: 10
        });

        const allMoisture = result.trend.map(t => t.moisture);
        expect(result.summary.minMoisture).toBe(Math.min(...allMoisture));
        expect(result.summary.maxMoisture).toBe(Math.max(...allMoisture));
    });

    test('should handle different time lag classes', () => {
        const timeLags = [1, 10, 100];
        
        timeLags.forEach(timeLag => {
            const result = predictDryingTrend({
                currentMoisture: 15,
                historicalWeather: validHistorical,
                predictedWeather: validPredicted,
                timeLag: timeLag
            });

            expect(result.metadata.timeLag).toBe(timeLag);
            expect(result.trend).toBeTruthy();
        });
    });
});

describe('interpolateWeatherData Function', () => {
    test('should interpolate missing temperature data', () => {
        const data = [
            { temp: 70, rh: 60 },
            { temp: null, rh: 55 },
            { temp: 80, rh: 50 }
        ];

        const result = interpolateWeatherData(data);
        
        expect(result[1].temp).toBe(75);
        expect(result[0].temp).toBe(70);
        expect(result[2].temp).toBe(80);
    });

    test('should interpolate missing humidity data', () => {
        const data = [
            { temp: 70, rh: 60 },
            { temp: 75, rh: null },
            { temp: 80, rh: 40 }
        ];

        const result = interpolateWeatherData(data);
        
        expect(result[1].rh).toBe(50);
    });

    test('should handle multiple consecutive missing values', () => {
        const data = [
            { temp: 70, rh: 60 },
            { temp: null, rh: null },
            { temp: null, rh: null },
            { temp: 80, rh: 40 }
        ];

        const result = interpolateWeatherData(data);
        
        expect(result[1].temp).toBeCloseTo(73.33, 1);
        expect(result[2].temp).toBeCloseTo(76.67, 1);
    });

    test('should handle missing data at boundaries', () => {
        const data = [
            { temp: null, rh: 60 },
            { temp: 75, rh: 50 },
            { temp: 80, rh: null }
        ];

        const result = interpolateWeatherData(data);
        
        expect(result[0].temp).toBe(75);
        expect(result[2].rh).toBe(50);
    });

    test('should preserve original data when no interpolation needed', () => {
        const data = [
            { temp: 70, rh: 60 },
            { temp: 75, rh: 55 },
            { temp: 80, rh: 50 }
        ];

        const result = interpolateWeatherData(data);
        
        expect(result[0].temp).toBe(70);
        expect(result[1].temp).toBe(75);
        expect(result[2].temp).toBe(80);
    });

    test('should return empty array for empty input', () => {
        const result = interpolateWeatherData([]);
        expect(result).toEqual([]);
    });
});

describe('Performance and Large Datasets', () => {
    test('should handle large datasets efficiently', () => {
        const largeHistorical = Array.from({ length: 100 }, (_, i) => ({
            temp: 70 + i * 0.1,
            rh: Math.max(20, 60 - i * 0.2)
        }));

        const largeForecast = Array.from({ length: 100 }, (_, i) => ({
            temp: 80 + i * 0.2,
            rh: Math.max(15, 50 - i * 0.3)
        }));

        const startTime = Date.now();
        
        const result = predictDryingTrend({
            currentMoisture: 15,
            historicalWeather: largeHistorical,
            predictedWeather: largeForecast,
            timeLag: 10
        });

        const duration = Date.now() - startTime;

        expect(result.trend).toHaveLength(200);
        expect(duration).toBeLessThan(1000); // Should complete in less than 1 second
    });
});
