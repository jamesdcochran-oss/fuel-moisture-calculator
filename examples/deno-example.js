/**
 * Deno Example for Fuel Moisture Calculator
 * Run with: deno run examples/deno-example.js
 */

import FuelMoistureCalculator from '../fuel-moisture-calculator.js';

console.log('=== Fuel Moisture Calculator - Deno Example ===\n');

// Example 1: Compute EMC
console.log('Example 1: Compute EMC');
const emc = FuelMoistureCalculator.computeEMC(75, 50);
console.log(`  Temperature: 75°F, Humidity: 50%`);
console.log(`  EMC: ${emc}%\n`);

// Example 2: Run forecast model
console.log('Example 2: Multi-Day Forecast');
const forecast = [
  { temp: 70, rh: 60, hours: 12 },
  { temp: 75, rh: 50, hours: 12 },
  { temp: 80, rh: 40, hours: 12 }
];

const results = FuelMoistureCalculator.runModel(8, 10, forecast);

console.log(`  Initial: 1-hr ${results.initial1hr}%, 10-hr ${results.initial10hr}%`);
results.dailyResults.forEach(day => {
  console.log(`  ${day.day}: ${day.moisture1Hr}% (1-hr), ${day.moisture10Hr}% (10-hr)`);
});

// Example 3: Temperature conversion
console.log('\nExample 3: Temperature Conversion');
const fahrenheit = FuelMoistureCalculator.celsiusToFahrenheit(25);
console.log(`  25°C = ${fahrenheit.toFixed(1)}°F`);

// Example 4: Compare different weather scenarios
console.log('\nExample 4: Weather Scenario Comparison');
const scenarios = [
  { name: 'Hot & Dry', temp: 95, rh: 15 },
  { name: 'Moderate', temp: 70, rh: 50 },
  { name: 'Cool & Wet', temp: 55, rh: 80 }
];

scenarios.forEach(scenario => {
  const emc = FuelMoistureCalculator.computeEMC(scenario.temp, scenario.rh);
  console.log(`  ${scenario.name}: EMC ${emc}% at ${scenario.temp}°F, ${scenario.rh}% RH`);
});

console.log('\n=== Examples Complete ===');
