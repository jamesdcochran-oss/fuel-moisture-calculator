/**
 * Deno Example for Fuel Moisture Calculator
 * Run with: deno run examples/deno-example.js
 */

import FuelMoistureCalculator from '../fuel-moisture-calculator.js';

console.log('=== Fuel Moisture Calculator - Deno Example ===\n');

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

// Example 4: Multiple calculations for different conditions
console.log('Example 4: Weather Scenarios');
const scenarios = [
    { name: 'Hot & Dry', temp: 95, humidity: 15 },
    { name: 'Moderate', temp: 70, humidity: 50 },
    { name: 'Cool & Wet', temp: 55, humidity: 80 }
];

scenarios.forEach(scenario => {
    const moisture = FuelMoistureCalculator.calculateFineFuelMoisture(
        scenario.temp,
        scenario.humidity
    );
    console.log(`  ${scenario.name}: ${moisture.toFixed(2)}% (${scenario.temp}°F, ${scenario.humidity}% RH)`);
});

console.log('\n=== Examples Complete ===');
