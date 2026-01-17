/**
 * Node.js Example for Fuel Moisture Calculator
 * Run with: node examples/node-example.js
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

console.log('=== Fuel Moisture Calculator - Node.js Example ===\n');

// Example 1: Compute Equilibrium Moisture Content (EMC)
console.log('Example 1: Compute EMC');
const emc1 = FuelMoistureCalculator.computeEMC(75, 50);
console.log(`  Temperature: 75°F, Humidity: 50%`);
console.log(`  EMC: ${emc1}%\n`);

// Example 2: Time-lag drying model
console.log('Example 2: Time-Lag Drying Model');
const initial = 12;
const emc = 8;
const hours = 12;
const timeLag10 = 10;

const newMoisture = FuelMoistureCalculator.stepMoisture(initial, emc, hours, timeLag10);
console.log(`  Initial moisture: ${initial}%`);
console.log(`  EMC: ${emc}%`);
console.log(`  Time period: ${hours} hours`);
console.log(`  Time lag: ${timeLag10} hours`);
console.log(`  New moisture: ${newMoisture}%\n`);

// Example 3: Run multi-day forecast model
console.log('Example 3: Multi-Day Forecast Model');
const forecast = [
  { temp: 75, rh: 50, hours: 12 },
  { temp: 80, rh: 40, hours: 12 },
  { temp: 85, rh: 30, hours: 12 },
  { temp: 90, rh: 25, hours: 12 }
];

const results = FuelMoistureCalculator.runModel(10, 12, forecast);

console.log(`  Initial conditions: 1-hr: ${results.initial1hr}%, 10-hr: ${results.initial10hr}%`);
console.log('  Daily Results:');
results.dailyResults.forEach(day => {
  console.log(`    ${day.day}: Temp ${day.temp}°F, RH ${day.rh}% → 1-hr: ${day.moisture1Hr}%, 10-hr: ${day.moisture10Hr}%`);
});

if (results.summary.firstCritical1HrDay) {
  console.log(`  ⚠️  Critical drying (≤6%) first detected on: ${results.summary.firstCritical1HrDay}\n`);
} else {
  console.log(`  No critical drying detected\n`);
}

// Example 4: Custom day labels
console.log('Example 4: Forecast with Custom Labels');
const weekForecast = [
  { label: 'Monday', temp: 70, rh: 60, wind: 5, hours: 12 },
  { label: 'Tuesday', temp: 75, rh: 50, wind: 10, hours: 12 },
  { label: 'Wednesday', temp: 80, rh: 40, wind: 15, hours: 12 }
];

const weekResults = FuelMoistureCalculator.runModel(8, 10, weekForecast);
weekResults.dailyResults.forEach(day => {
  console.log(`  ${day.day}: ${day.moisture1Hr}% (1-hr), ${day.moisture10Hr}% (10-hr), Wind: ${day.wind} mph`);
});

// Example 5: Temperature conversion
console.log('\nExample 5: Temperature Conversion');
const celsius = 25;
const fahrenheit = FuelMoistureCalculator.celsiusToFahrenheit(celsius);
console.log(`  ${celsius}°C = ${fahrenheit.toFixed(1)}°F`);

const f = 77;
const c = FuelMoistureCalculator.fahrenheitToCelsius(f);
console.log(`  ${f}°F = ${c.toFixed(1)}°C\n`);

console.log('=== Examples Complete ===');

