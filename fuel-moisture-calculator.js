/**
 * Computes moisture content based on temperature and relative humidity.
 * @param {Object} input - The input object containing temperature and humidity.
 * @param {number} input.temperature - The temperature in Fahrenheit.
 * @param {number} input.humidity - The relative humidity in percentage.
 * @returns {number} - The calculated moisture content.
 * @throws {Error} - If input is invalid.
 */
const calculateMoisture = (input) => {
    if (!input || typeof input.temperature !== 'number' || typeof input.humidity !== 'number') {
        throw new Error('Invalid input for calculateMoisture');
    }
    return (input.humidity - input.temperature * 0.1).toFixed(2);
};

module.exports = { calculateMoisture };