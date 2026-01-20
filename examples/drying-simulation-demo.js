/**
 * Demonstration of new drying simulation and analysis features
 * Run with: node examples/drying-simulation-demo.js
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

console.log('=== Fuel Moisture Drying Simulation Demo ===\n');

// Example 1: Simulate 24-hour drying period
console.log('Example 1: 24-Hour Drying Simulation');
console.log('Scenario: Hot, dry conditions (95°F, 15% RH)');

const dryingParams = {
  initial1hr: 15,
  initial10hr: 18,
  initial100hr: 20,
  tempF: 95,
  rh: 15,
  durationHours: 24,
  stepHours: 4
};

const dryingResults = FuelMoistureCalculator.simulateDrying(dryingParams);

console.log(`  Target EMC: ${dryingResults.emc}%`);
console.log('  Time Series:');
dryingResults.timeSeries.forEach(point => {
  console.log(`    Hour ${point.hour}: 1-hr=${point.moisture1hr}%, 10-hr=${point.moisture10hr}%, 100-hr=${point.moisture100hr}%`);
});
console.log(`  Final Moisture: 1-hr=${dryingResults.final.moisture1hr}%, 10-hr=${dryingResults.final.moisture10hr}%, 100-hr=${dryingResults.final.moisture100hr}%\n`);

// Example 2: Analyze drying pattern with rainfall
console.log('Example 2: Drying Pattern Analysis with Rainfall Event');
console.log('Scenario: Prolonged drying followed by rain recovery');

// Simulate moisture data over 3 days with a rain event
const moistureHistory = [
  { hour: 0, moisture1hr: 12, moisture10hr: 14 },
  { hour: 6, moisture1hr: 8, moisture10hr: 11 },
  { hour: 12, moisture1hr: 5, moisture10hr: 9 },  // Critical drying
  { hour: 18, moisture1hr: 4, moisture10hr: 7 },  // More critical
  { hour: 24, moisture1hr: 3, moisture10hr: 6 },  // Most critical
  { hour: 30, moisture1hr: 14, moisture10hr: 10 }, // Rain event!
  { hour: 36, moisture1hr: 16, moisture10hr: 13 }, // Recovery continues
  { hour: 42, moisture1hr: 15, moisture10hr: 14 }  // Still wet
];

const analysis = FuelMoistureCalculator.analyzeDryingPattern(moistureHistory, 6);

console.log('  Drying Rates:');
console.log(`    1-hr fuel: avg=${analysis.dryingRates.fuel1hr.avg}%/hr, max=${analysis.dryingRates.fuel1hr.max}%/hr, min=${analysis.dryingRates.fuel1hr.min}%/hr`);
console.log(`    10-hr fuel: avg=${analysis.dryingRates.fuel10hr.avg}%/hr, max=${analysis.dryingRates.fuel10hr.max}%/hr, min=${analysis.dryingRates.fuel10hr.min}%/hr`);

console.log('\n  Threshold Crossings (≤6%):');
console.log(`    1-hr fuel crossed at hour: ${analysis.thresholdCrossings.fuel1hr}`);
console.log(`    10-hr fuel crossed at hour: ${analysis.thresholdCrossings.fuel10hr}`);

console.log('\n  Critical Periods:');
analysis.criticalPeriods.forEach((period, i) => {
  console.log(`    Period ${i + 1}: Hour ${period.start} to ${period.end} (${period.duration} hours)`);
});

// Example 3: Compare different weather scenarios
console.log('\n\nExample 3: Scenario Comparison');
console.log('Compare drying under different conditions over 48 hours\n');

const scenarios = [
  { name: 'Extreme Fire Weather', tempF: 100, rh: 10 },
  { name: 'High Fire Danger', tempF: 90, rh: 25 },
  { name: 'Moderate Conditions', tempF: 75, rh: 45 },
  { name: 'Low Fire Danger', tempF: 65, rh: 65 }
];

scenarios.forEach(scenario => {
  const params = {
    initial1hr: 15,
    initial10hr: 18,
    initial100hr: 20,
    tempF: scenario.tempF,
    rh: scenario.rh,
    durationHours: 48
  };
  
  const results = FuelMoistureCalculator.simulateDrying(params);
  console.log(`  ${scenario.name} (${scenario.tempF}°F, ${scenario.rh}% RH):`);
  console.log(`    EMC: ${results.emc}%`);
  console.log(`    After 48hrs: 1-hr=${results.final.moisture1hr}%, 10-hr=${results.final.moisture10hr}%, 100-hr=${results.final.moisture100hr}%`);
});

// Example 4: Day/Night Cycle Simulation
console.log('\n\nExample 4: Day/Night Cycle Impact');
console.log('24-hour period with temperature and humidity fluctuations\n');

const dayNightForecast = [
  { label: 'Morning (6am)', temp: 65, rh: 70, hours: 6 },
  { label: 'Midday (12pm)', temp: 85, rh: 30, hours: 6 },
  { label: 'Afternoon (6pm)', temp: 80, rh: 35, hours: 6 },
  { label: 'Night (12am)', temp: 60, rh: 75, hours: 6 }
];

const cycleResults = FuelMoistureCalculator.runModel(12, 14, dayNightForecast);

console.log('  Moisture Evolution:');
cycleResults.dailyResults.forEach(period => {
  console.log(`    ${period.day}: Temp ${period.temp}°F, RH ${period.rh}% → EMC ${period.emc}%`);
  console.log(`      1-hr: ${period.moisture1Hr}%, 10-hr: ${period.moisture10Hr}%`);
});

console.log('\n=== Demo Complete ===');
console.log('\nKey Takeaways:');
console.log('  • simulateDrying() provides detailed time-series moisture evolution');
console.log('  • analyzeDryingPattern() identifies critical periods and drying rates');
console.log('  • Both functions support fire weather forecasting and risk assessment');
console.log('  • Rainfall events can be modeled by providing higher RH periods\n');
