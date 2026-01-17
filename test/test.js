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

function assertEquals(actual, expected, message, tolerance = 0.01) {
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

// Test 1: Basic fine fuel moisture calculation
console.log('--- Fine Fuel Moisture Tests ---');
const fineMoisture1 = FuelMoistureCalculator.calculateFineFuelMoisture(75, 50);
assert(fineMoisture1 > 0 && fineMoisture1 < 20, 'Fine fuel moisture at 75°F, 50% RH should be reasonable');

const fineMoisture2 = FuelMoistureCalculator.calculateFineFuelMoisture(90, 20);
assert(fineMoisture2 < fineMoisture1, 'Higher temp and lower humidity should give lower moisture');

const fineMoisture3 = FuelMoistureCalculator.calculateFineFuelMoisture(60, 80);
assert(fineMoisture3 > fineMoisture1, 'Lower temp and higher humidity should give higher moisture');

// Test 2: Input validation
console.log('\n--- Input Validation Tests ---');
assertThrows(
  () => FuelMoistureCalculator.calculateFineFuelMoisture('75', 50),
  TypeError,
  'Should reject string temperature'
);

assertThrows(
  () => FuelMoistureCalculator.calculateFineFuelMoisture(75, '50'),
  TypeError,
  'Should reject string humidity'
);

assertThrows(
  () => FuelMoistureCalculator.calculateFineFuelMoisture(NaN, 50),
  TypeError,
  'Should reject NaN temperature'
);

assertThrows(
  () => FuelMoistureCalculator.calculateFineFuelMoisture(Infinity, 50),
  TypeError,
  'Should reject Infinity temperature'
);

assertThrows(
  () => FuelMoistureCalculator.calculateFineFuelMoisture(75, -10),
  RangeError,
  'Should reject negative humidity'
);

assertThrows(
  () => FuelMoistureCalculator.calculateFineFuelMoisture(75, 150),
  RangeError,
  'Should reject humidity > 100'
);

assertThrows(
  () => FuelMoistureCalculator.calculateFineFuelMoisture(-100, 50),
  RangeError,
  'Should reject temperature < -50'
);

assertThrows(
  () => FuelMoistureCalculator.calculateFineFuelMoisture(200, 50),
  RangeError,
  'Should reject temperature > 150'
);

// Test 3: 10-hour fuel moisture
console.log('\n--- 10-Hour Fuel Moisture Tests ---');
const tenHour1 = FuelMoistureCalculator.calculate10HourFuelMoisture(75, 50, 0);
assert(tenHour1 > fineMoisture1, '10-hour moisture should be slightly higher than 1-hour');

const tenHour2 = FuelMoistureCalculator.calculate10HourFuelMoisture(75, 50, 0.5);
assert(tenHour2 > tenHour1, 'Shading should increase moisture');

const tenHour3 = FuelMoistureCalculator.calculate10HourFuelMoisture(75, 50, 1.0);
assert(tenHour3 > tenHour2, 'Full shade should give highest moisture');

assertThrows(
  () => FuelMoistureCalculator.calculate10HourFuelMoisture(75, 50, 1.5),
  RangeError,
  'Should reject shading > 1'
);

assertThrows(
  () => FuelMoistureCalculator.calculate10HourFuelMoisture(75, 50, -0.1),
  RangeError,
  'Should reject shading < 0'
);

// Test 4: 100-hour fuel moisture
console.log('\n--- 100-Hour Fuel Moisture Tests ---');
const hundredHour1 = FuelMoistureCalculator.calculate100HourFuelMoisture(75, 50);
assert(hundredHour1 > tenHour1, '100-hour moisture should be higher than 10-hour');

const hundredHour2 = FuelMoistureCalculator.calculate100HourFuelMoisture(75, 50, 15);
assert(Math.abs(hundredHour2 - 15) < Math.abs(hundredHour1 - 15), 
  '100-hour with previous moisture should lag toward previous value');

assertThrows(
  () => FuelMoistureCalculator.calculate100HourFuelMoisture(75, 50, -5),
  RangeError,
  'Should reject negative previous moisture'
);

assertThrows(
  () => FuelMoistureCalculator.calculate100HourFuelMoisture(75, 50, 150),
  RangeError,
  'Should reject previous moisture > 100'
);

// Test 5: 1000-hour fuel moisture
console.log('\n--- 1000-Hour Fuel Moisture Tests ---');
const thousandHour1 = FuelMoistureCalculator.calculate1000HourFuelMoisture(75, 50);
assert(thousandHour1 > hundredHour1, '1000-hour moisture should be higher than 100-hour');

const thousandHour2 = FuelMoistureCalculator.calculate1000HourFuelMoisture(75, 50, 20);
assert(Math.abs(thousandHour2 - 20) < Math.abs(thousandHour1 - 20),
  '1000-hour with previous moisture should lag toward previous value');

const lagDiff100 = Math.abs(hundredHour2 - 15);
const lagDiff1000 = Math.abs(thousandHour2 - 20);
assert(lagDiff1000 < lagDiff100, '1000-hour should lag more than 100-hour');

// Test 6: Calculate all fuel moistures
console.log('\n--- Calculate All Moistures Tests ---');
const allMoistures = FuelMoistureCalculator.calculateAllFuelMoistures({
  temperature: 75,
  relativeHumidity: 50,
  shading: 0.5
});

assert(typeof allMoistures === 'object', 'Should return an object');
assert(allMoistures.oneHour > 0, 'Should have 1-hour moisture');
assert(allMoistures.tenHour > 0, 'Should have 10-hour moisture');
assert(allMoistures.hundredHour > 0, 'Should have 100-hour moisture');
assert(allMoistures.thousandHour > 0, 'Should have 1000-hour moisture');
assert(allMoistures.tenHour > allMoistures.oneHour, '10-hour should be > 1-hour');
assert(allMoistures.hundredHour > allMoistures.tenHour, '100-hour should be > 10-hour');
assert(allMoistures.thousandHour > allMoistures.hundredHour, '1000-hour should be > 100-hour');

const allMoisturesWithPrevious = FuelMoistureCalculator.calculateAllFuelMoistures(
  { temperature: 75, relativeHumidity: 50 },
  { hundredHour: 15, thousandHour: 20 }
);
assert(allMoisturesWithPrevious.hundredHour !== allMoistures.hundredHour,
  'Previous moisture should affect 100-hour calculation');
assert(allMoisturesWithPrevious.thousandHour !== allMoistures.thousandHour,
  'Previous moisture should affect 1000-hour calculation');

assertThrows(
  () => FuelMoistureCalculator.calculateAllFuelMoistures(null),
  TypeError,
  'Should reject null conditions'
);

assertThrows(
  () => FuelMoistureCalculator.calculateAllFuelMoistures('invalid'),
  TypeError,
  'Should reject string conditions'
);

// Test 7: Temperature conversion functions
console.log('\n--- Temperature Conversion Tests ---');
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(0), 32, 'Freezing point conversion', 0.1);
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(100), 212, 'Boiling point conversion', 0.1);
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(25), 77, '25°C to Fahrenheit', 0.1);

assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(32), 0, 'Freezing point conversion', 0.1);
assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(212), 100, 'Boiling point conversion', 0.1);
assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(77), 25, '77°F to Celsius', 0.1);

assertThrows(
  () => FuelMoistureCalculator.celsiusToFahrenheit('25'),
  TypeError,
  'Should reject string in celsius conversion'
);

assertThrows(
  () => FuelMoistureCalculator.fahrenheitToCelsius(NaN),
  TypeError,
  'Should reject NaN in fahrenheit conversion'
);

// Test 8: Edge cases
console.log('\n--- Edge Case Tests ---');
const veryDry = FuelMoistureCalculator.calculateFineFuelMoisture(100, 5);
assert(veryDry > 0 && veryDry < 5, 'Very dry conditions should give low moisture');

const veryWet = FuelMoistureCalculator.calculateFineFuelMoisture(50, 95);
assert(veryWet > 15 && veryWet < 50, 'Very wet conditions should give high moisture');

const cold = FuelMoistureCalculator.calculateFineFuelMoisture(0, 50);
assert(cold > 0 && cold < 100, 'Cold temperature should still give valid result');

// Test 9: Alias function
console.log('\n--- Alias Tests ---');
const oneHourMoisture = FuelMoistureCalculator.calculateOneHourFuelMoisture(75, 50);
assertEquals(oneHourMoisture, fineMoisture1, 'Alias should produce same result', 0.01);

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
