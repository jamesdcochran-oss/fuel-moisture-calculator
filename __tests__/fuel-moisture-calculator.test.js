// Sample test for fuel-moisture-calculator.js
const { calculateMoisture } = require('../fuel-moisture-calculator');

describe('Fuel Moisture Calculator Tests', () => {
    
test('Should calculate moisture correctly for given inputs', () => {
        const input = { temperature: 80, humidity: 40 };
        const output = calculateMoisture(input);
        expect(output).toBeGreaterThan(0);
    });

    test('Should throw an error for invalid inputs', () => {
        expect(() => calculateMoisture(null)).toThrow();
    });
});
