/**
 * Test to verify UI helpers are properly exposed from the UMD factory API
 * and accessible to consumers via require() or window.FuelMoistureCalculator
 */

const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

console.log('=== UI API Exposure Test ===\n');

// Test that all expected functions are available
const expectedFunctions = [
  'computeEMC',
  'stepMoisture',
  'runModel',
  'celsiusToFahrenheit',
  'fahrenheitToCelsius',
  'populateDefaultForecastTable',
  'readForecastTable',
  'showResults',
  'wireUI'
];

let passed = 0;
let failed = 0;

console.log('Checking that all API functions are exposed:\n');

expectedFunctions.forEach(funcName => {
  if (typeof FuelMoistureCalculator[funcName] === 'function') {
    console.log(`✓ ${funcName} is exposed`);
    passed++;
  } else {
    console.error(`✗ ${funcName} is NOT exposed`);
    failed++;
  }
});

console.log('\nChecking version property:');
if (typeof FuelMoistureCalculator.version === 'string' && FuelMoistureCalculator.version.length > 0) {
  console.log(`✓ version is exposed: ${FuelMoistureCalculator.version}`);
  passed++;
} else {
  console.error('✗ version is NOT properly exposed');
  failed++;
}

console.log('\n=== Test Summary ===');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);

if (failed === 0) {
  console.log('\n✓ All UI API functions are properly exposed!');
  process.exit(0);
} else {
  console.error(`\n✗ ${failed} check(s) failed`);
  process.exit(1);
}
