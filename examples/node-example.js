/**
 * Node.js Example for Fuel Moisture Calculator
 * Run with: node examples/node-example.js
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

console.log('=== Fuel Moisture Calculator - Node.js Example ===\n');

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

// Example 3: Temperature conversion
console.log('Example 3: Temperature Conversion');
const celsius = 25;
const fahrenheit = FuelMoistureCalculator.celsiusToFahrenheit(celsius);
console.log(`  ${celsius}°C = ${fahrenheit.toFixed(1)}°F`);

const f = 77;
const c = FuelMoistureCalculator.fahrenheitToCelsius(f);
console.log(`  ${f}°F = ${c.toFixed(1)}°C\n`);

// Example 4: With previous moisture values for lag calculation
console.log('Example 4: Moisture with Lag Calculation');
const currentConditions = { temperature: 70, relativeHumidity: 60 };
const previousMoisture = { hundredHour: 12, thousandHour: 15 };

const lagged = FuelMoistureCalculator.calculateAllFuelMoistures(
    currentConditions,
    previousMoisture
);

console.log(`  Current: 70°F, 60% RH`);
console.log(`  Previous 100-hour: 12%, Current: ${lagged.hundredHour.toFixed(2)}%`);
console.log(`  Previous 1000-hour: 15%, Current: ${lagged.thousandHour.toFixed(2)}%`);
console.log(`  (Notice how values lag toward previous readings)\n`);

// Example 5: Error handling
console.log('Example 5: Error Handling');
try {
    FuelMoistureCalculator.calculateFineFuelMoisture(75, 150);
} catch (error) {
    console.log(`  Caught error: ${error.message}`);
}

try {
    FuelMoistureCalculator.calculateFineFuelMoisture('invalid', 50);
} catch (error) {
    console.log(`  Caught error: ${error.message}`);
}

console.log('\n=== Examples Complete ===');
