describe('computeEMC and stepMoisture Validations', () => {
    // Benchmarking outputs and edge cases for computeEMC
    test('computeEMC should return expected output for valid inputs', () => {
        expect(computeEMC(20, 60)).toBeCloseTo(expectedOutputFor20C60RH, 2);
    });

    test('computeEMC should handle edge cases with temperature', () => {
        expect(computeEMC(0, 50)).toBeCloseTo(expectedOutputFor0C50RH, 2);
        expect(computeEMC(50, 50)).toBeCloseTo(expectedOutputFor50C50RH, 2);
    });

    test('computeEMC should handle edge cases with relative humidity', () => {
        expect(computeEMC(20, 0)).toBeCloseTo(expectedOutputFor20C0RH, 2);
        expect(computeEMC(20, 100)).toBeCloseTo(expectedOutputFor20C100RH, 2);
    });

    // Validating formulas and outputs for stepMoisture
    test('stepMoisture should return correct value for increment', () => {
        expect(stepMoisture(currentMoisture, increment)).toEqual(expectedMoisture);
    });

    test('stepMoisture should handle negative increments', () => {
        expect(stepMoisture(currentMoisture, -increment)).toEqual(expectedMoistureAfterDecrement);
    });

    // Additional validations for various temperature and humidity inputs
    test('computeEMC for various inputs', () => {
        const testCases = [
            { temp: 25, rh: 30, expected: expectedOutput1 },
            { temp: 30, rh: 90, expected: expectedOutput2 },
            // Add further test cases as necessary
        ];
        testCases.forEach(({ temp, rh, expected }) => {
            expect(computeEMC(temp, rh)).toBeCloseTo(expected, 2);
        });
    });
});