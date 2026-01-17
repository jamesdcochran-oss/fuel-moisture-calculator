/**
 * Bun Example for Fuel Moisture Calculator
 * Run with: bun run examples/bun-example.js
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

console.log('=== Fuel Moisture Calculator - Bun Example ===\n');

// Example 1: Calculate fine fuel moisture
console.log('Example 1: Fine Fuel Moisture');
const fineMoisture = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
console.log(`  Temperature: 75°F, Humidity: 50%`);
console.log(`  Fine Fuel Moisture: ${fineMoisture.toFixed(2)}%\n`);

// Example 2: Calculate all fuel moisture classes
console.log('Example 2: All Fuel Moisture Classes');
const allMoistures = FuelMoistureCalculator.calculateAllFuelMoistures({
    temperature: 85,
    relativeHumidity: 30,
    shading: 0.5
});

console.log(`  Temperature: 85°F, Humidity: 30%, Shading: 0.5`);
console.log(`  1-Hour:    ${allMoistures.oneHour.toFixed(2)}%`);
console.log(`  10-Hour:   ${allMoistures.tenHour.toFixed(2)}%`);
console.log(`  100-Hour:  ${allMoistures.hundredHour.toFixed(2)}%`);
console.log(`  1000-Hour: ${allMoistures.thousandHour.toFixed(2)}%\n`);

// Example 3: Batch processing
console.log('Example 3: Batch Processing Multiple Readings');
const readings = [
    { hour: '06:00', temp: 65, humidity: 75 },
    { hour: '12:00', temp: 85, humidity: 35 },
    { hour: '18:00', temp: 75, humidity: 50 }
];

console.log('  Time    Temp    RH    1-Hour  10-Hour');
console.log('  ----------------------------------------');
readings.forEach(reading => {
    const moisture = FuelMoistureCalculator.calculateAllFuelMoistures({
        temperature: reading.temp,
        relativeHumidity: reading.humidity
    });
    console.log(`  ${reading.hour}   ${reading.temp}°F    ${reading.humidity}%   ${moisture.oneHour.toFixed(1)}%   ${moisture.tenHour.toFixed(1)}%`);
});

console.log('\n=== Examples Complete ===');
