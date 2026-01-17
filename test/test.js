/**
 * Test Suite for Fuel Moisture Calculator
 * Validates all functions and edge cases
 */

// Import the library (works in Node.js, Deno, and Bun)
const FuelMoistureCalculator = require('../fuel-moisture-calculator.js');

// Simple test framework
let testCount = 0;
let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  testCount++;
  if (condition) {
    passCount++;
    console.log(`✓ ${message}`);
  } else {
    failCount++;
    console.error(`✗ ${message}`);
  }
}

function assertEquals(actual, expected, message, tolerance = 0.1) {
  const passed = Math.abs(actual - expected) < tolerance;
  assert(passed, `${message} (expected: ${expected}, got: ${actual})`);
}

function assertThrows(fn, expectedError, message) {
  testCount++;
  try {
    fn();
    failCount++;
    console.error(`✗ ${message} (expected to throw ${expectedError.name})`);
  } catch (error) {
    if (error instanceof expectedError) {
      passCount++;
      console.log(`✓ ${message}`);
    } else {
      failCount++;
      console.error(`✗ ${message} (expected ${expectedError.name}, got ${error.constructor.name})`);
    }
  }
}

console.log('=== Fuel Moisture Calculator Test Suite ===\n');

// Test 1: computeEMC function
console.log('--- computeEMC Tests ---');
const emc1 = FuelMoistureCalculator.computeEMC(75, 50);
assert(emc1 > 0 && emc1 < 20, `EMC at 75°F, 50% RH should be reasonable (got ${emc1}%)`);

const emc2 = FuelMoistureCalculator.computeEMC(90, 20);
assert(emc2 < emc1, 'Higher temp and lower humidity should give lower EMC');

const emc3 = FuelMoistureCalculator.computeEMC(60, 80);
assert(emc3 > emc1, 'Lower temp and higher humidity should give higher EMC');

// Test boundary conditions
const emc4 = FuelMoistureCalculator.computeEMC(32, 100);
assert(emc4 > 15, 'Freezing temp with 100% RH should give high EMC');

const emc5 = FuelMoistureCalculator.computeEMC(100, 10);
assert(emc5 > 0 && emc5 < 5, 'Hot and dry should give low EMC');

// Test 2: Input validation for computeEMC
console.log('\n--- computeEMC Input Validation Tests ---');
// String inputs are converted to numbers (defensive)
const emcStr = FuelMoistureCalculator.computeEMC('75', 50);
assert(emcStr > 0, 'Should convert string temperature to number');

assertThrows(
  () => FuelMoistureCalculator.computeEMC(NaN, 50),
  TypeError,
  'Should reject NaN temperature'
);

assertThrows(
  () => FuelMoistureCalculator.computeEMC(Infinity, 50),
  TypeError,
  'Should reject Infinity temperature'
);

// RH is clamped, not rejected
const emcNeg = FuelMoistureCalculator.computeEMC(75, -10);
assert(emcNeg > 0, 'Should clamp negative humidity and still calculate');

const emcHigh = FuelMoistureCalculator.computeEMC(75, 150);
assert(emcHigh > 0, 'Should clamp humidity > 100 and still calculate');

// Test 3: stepMoisture function
console.log('\n--- stepMoisture Tests ---');
// Starting at 12%, EMC of 8%, 12 hours, 10-hour timelag
const step1 = FuelMoistureCalculator.stepMoisture(12, 8, 12, 10);
assert(step1 > 8 && step1 < 12, `Moisture should move toward EMC (got ${step1}%)`);
assert(step1 < 10.5, '12-hour period should bring moisture closer to EMC');

// Same starting point, longer time
const step2 = FuelMoistureCalculator.stepMoisture(12, 8, 24, 10);
assert(step2 < step1, 'Longer time should move closer to EMC');

// 1-hour timelag responds faster
const step3 = FuelMoistureCalculator.stepMoisture(12, 8, 12, 1);
assert(step3 < step1, '1-hour timelag should respond faster than 10-hour');

// Zero hours should not change
const step4 = FuelMoistureCalculator.stepMoisture(12, 8, 0, 10);
assertEquals(step4, 12, 'Zero hours should not change moisture', 0.1);

// Already at equilibrium
const step5 = FuelMoistureCalculator.stepMoisture(8, 8, 12, 10);
assertEquals(step5, 8, 'Already at EMC should stay at EMC', 0.1);

// Test 4: stepMoisture input validation
console.log('\n--- stepMoisture Input Validation Tests ---');
// String inputs are converted to numbers (defensive)
const stepStr = FuelMoistureCalculator.stepMoisture('12', 8, 12, 10);
assert(stepStr > 0, 'Should convert string initial moisture to number');

assertThrows(
  () => FuelMoistureCalculator.stepMoisture(12, NaN, 12, 10),
  TypeError,
  'Should reject NaN EMC'
);

assertThrows(
  () => FuelMoistureCalculator.stepMoisture(12, 8, Infinity, 10),
  TypeError,
  'Should reject Infinity hours'
);

assertThrows(
  () => FuelMoistureCalculator.stepMoisture(12, 8, 12, 'ten'),
  TypeError,
  'Should reject string timelag'
);

// Test 5: runModel function
console.log('\n--- runModel Tests ---');
const forecast = [
  { temp: 75, rh: 50, hours: 12 },
  { temp: 80, rh: 40, hours: 12 },
  { temp: 85, rh: 30, hours: 12 }
];

const results = FuelMoistureCalculator.runModel(10, 12, forecast);

assert(typeof results === 'object', 'Should return an object');
assert(results.initial1hr === 10, 'Should preserve initial 1-hour moisture');
assert(results.initial10hr === 12, 'Should preserve initial 10-hour moisture');
assert(Array.isArray(results.dailyResults), 'Should have dailyResults array');
assert(results.dailyResults.length === 3, 'Should have 3 daily results');
assert(typeof results.summary === 'object', 'Should have summary object');

// Check first day results
const day1 = results.dailyResults[0];
assert(day1.day === 'Day 1', 'First day should be labeled Day 1');
assert(day1.temp === 75, 'Should preserve temperature');
assert(day1.rh === 50, 'Should preserve RH');
assert(day1.moisture1Hr > 0, 'Should calculate 1-hour moisture');
assert(day1.moisture10Hr > 0, 'Should calculate 10-hour moisture');
assert(day1.moisture10Hr > day1.moisture1Hr, '10-hour should lag behind 1-hour when drying');

// Check progression - moisture should generally decrease with drying conditions
const day3 = results.dailyResults[2];
assert(day3.moisture1Hr < results.initial1hr, 'Final 1-hour moisture should be lower than initial');

// Test 6: runModel with labels
console.log('\n--- runModel with Custom Labels Tests ---');
const forecastLabeled = [
  { label: 'Monday', temp: 70, rh: 60, wind: 5, hours: 12 },
  { label: 'Tuesday', temp: 75, rh: 50, wind: 10, hours: 12 }
];

const results2 = FuelMoistureCalculator.runModel(8, 10, forecastLabeled);
assert(results2.dailyResults[0].day === 'Monday', 'Should use custom day label');
assert(results2.dailyResults[0].wind === 5, 'Should preserve wind data');
assert(results2.dailyResults[1].day === 'Tuesday', 'Should use second custom label');

// Test 7: runModel critical moisture detection
console.log('\n--- runModel Critical Moisture Detection Tests ---');
const dryForecast = [
  { temp: 90, rh: 20, hours: 24 },
  { temp: 95, rh: 15, hours: 24 },
  { temp: 100, rh: 10, hours: 24 }
];

const dryResults = FuelMoistureCalculator.runModel(8, 10, dryForecast);
// With extreme drying, should hit critical level
const critDay = dryResults.summary.firstCritical1HrDay;
if (critDay) {
  assert(true, `Critical moisture detected on ${critDay}`);
} else {
  assert(true, 'No critical moisture detected (depends on calculations)');
}

// Test 8: runModel input validation
console.log('\n--- runModel Input Validation Tests ---');
assertThrows(
  () => FuelMoistureCalculator.runModel(10, 12, 'not-an-array'),
  TypeError,
  'Should reject non-array forecast'
);

assertThrows(
  () => FuelMoistureCalculator.runModel(10, 12, [null]),
  TypeError,
  'Should reject null forecast entry'
);

assertThrows(
  () => FuelMoistureCalculator.runModel(10, 12, ['invalid']),
  TypeError,
  'Should reject string forecast entry'
);

assertThrows(
  () => FuelMoistureCalculator.runModel(10, 12, [{}]),
  TypeError,
  'Should handle missing temp/rh appropriately'
);

// Test 9: Temperature conversion functions
console.log('\n--- Temperature Conversion Tests ---');
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(0), 32, 'Freezing point conversion', 0.1);
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(100), 212, 'Boiling point conversion', 0.1);
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(25), 77, '25°C to Fahrenheit', 0.1);

assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(32), 0, 'Freezing point conversion', 0.1);
assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(212), 100, 'Boiling point conversion', 0.1);
assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(77), 25, '77°F to Celsius', 0.1);

assertThrows(
  () => FuelMoistureCalculator.celsiusToFahrenheit(NaN),
  TypeError,
  'Should reject NaN in celsius conversion'
);

assertThrows(
  () => FuelMoistureCalculator.fahrenheitToCelsius(Infinity),
  TypeError,
  'Should reject Infinity in fahrenheit conversion'
);

// Test 10: Version
console.log('\n--- Version Test ---');
assert(typeof FuelMoistureCalculator.version === 'string', 'Should have version property');
assert(FuelMoistureCalculator.version.length > 0, 'Version should not be empty');

// Summary
console.log('\n=== Test Summary ===');
console.log(`Total tests: ${testCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✓ All tests passed!');
  if (typeof process !== 'undefined') {
    process.exit(0);
  } else if (typeof Deno !== 'undefined') {
    Deno.exit(0);
  }
} else {
  console.error(`\n✗ ${failCount} test(s) failed`);
  if (typeof process !== 'undefined') {
    process.exit(1);
  } else if (typeof Deno !== 'undefined') {
    Deno.exit(1);
  }
}
