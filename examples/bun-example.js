/**
 * Bun Example for Fuel Moisture Calculator
 * Run with: bun run examples/bun-example.js
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

console.log('=== Fuel Moisture Calculator - Bun Example ===\n');

// Example 1: Compute EMC
console.log('Example 1: Compute EMC');
const emc = FuelMoistureCalculator.computeEMC(75, 50);
console.log(`  Temperature: 75°F, Humidity: 50%`);
console.log(`  EMC: ${emc}%\n`);

// Example 2: Time-lag model
console.log('Example 2: Time-Lag Drying');
const moisture = FuelMoistureCalculator.stepMoisture(12, 8, 12, 10);
console.log(`  Initial: 12%, Target EMC: 8%, 12 hours @ 10-hr timelag`);
console.log(`  Result: ${moisture}%\n`);

// Example 3: Batch processing multiple forecast readings
console.log('Example 3: Batch Processing Daily Forecasts');
const dailyReadings = [
  { hour: '06:00', temp: 65, rh: 75 },
  { hour: '12:00', temp: 85, rh: 35 },
  { hour: '18:00', temp: 75, rh: 50 }
];

console.log('  Time    Temp    RH     EMC');
console.log('  -------------------------------');
dailyReadings.forEach(reading => {
  const emc = FuelMoistureCalculator.computeEMC(reading.temp, reading.rh);
  console.log(`  ${reading.hour}   ${reading.temp}°F    ${reading.rh}%    ${emc}%`);
});

// Example 4: Run full forecast model
console.log('\nExample 4: Multi-Day Forecast');
const forecast = [
  { label: 'Day 1', temp: 70, rh: 60, hours: 12 },
  { label: 'Day 2', temp: 80, rh: 40, hours: 12 },
  { label: 'Day 3', temp: 90, rh: 25, hours: 12 }
];

const results = FuelMoistureCalculator.runModel(10, 12, forecast);
results.dailyResults.forEach(day => {
  console.log(`  ${day.day}: 1-hr ${day.moisture1Hr}%, 10-hr ${day.moisture10Hr}%`);
});

if (results.summary.firstCritical1HrDay) {
  console.log(`  ⚠️  Critical drying on ${results.summary.firstCritical1HrDay}`);
}

console.log('\n=== Examples Complete ===');
