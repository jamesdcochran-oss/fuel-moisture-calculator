/**
 * Comprehensive Test Suite for Fuel Moisture Calculator
 * This test suite covers edge cases, boundary conditions, and critical functionality
 */

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

console.log('=== Comprehensive Fuel Moisture Calculator Test Suite ===\n');

// ========== computeEMC Edge Cases ==========
console.log('--- computeEMC Edge Cases ---');

// Extreme temperature values
const emcExtremeCold = FuelMoistureCalculator.computeEMC(-50, 50);
assert(emcExtremeCold >= 0.1, `Extreme cold temp should give valid EMC (got ${emcExtremeCold}%)`);

const emcExtremeHot = FuelMoistureCalculator.computeEMC(150, 5);
assert(emcExtremeHot >= 0.1, `Extreme hot temp should give valid EMC (got ${emcExtremeHot}%)`);
assert(emcExtremeHot < 5, `Very hot and dry should give low EMC (got ${emcExtremeHot}%)`);

// RH boundary values
const emcRH0 = FuelMoistureCalculator.computeEMC(75, 0);
assertEquals(emcRH0, 0.1, 'RH at 0% should give minimum EMC of 0.1%', 0.05);

const emcRH100 = FuelMoistureCalculator.computeEMC(75, 100);
assert(emcRH100 > 15, `RH at 100% should give high EMC (got ${emcRH100}%)`);

// RH values outside 0-100 range (should be clamped)
const emcRHNeg = FuelMoistureCalculator.computeEMC(75, -50);
assertEquals(emcRHNeg, 0.1, 'Negative RH should be clamped to 0', 0.05);

const emcRHHigh = FuelMoistureCalculator.computeEMC(75, 200);
const emcRH100Ref = FuelMoistureCalculator.computeEMC(75, 100);
assertEquals(emcRHHigh, emcRH100Ref, 'RH > 100 should be clamped to 100', 0.1);

// String inputs (should be converted)
const emcFromStrings = FuelMoistureCalculator.computeEMC('75', '50');
assert(emcFromStrings > 0, 'Should accept string inputs and convert to numbers');

// Test EMC minimum enforcement
const emcVeryLow = FuelMoistureCalculator.computeEMC(120, 2);
assert(emcVeryLow >= 0.1, `EMC should never be below 0.1% (got ${emcVeryLow}%)`);

// ========== stepMoisture Edge Cases ==========
console.log('\n--- stepMoisture Edge Cases ---');

// Zero timelag (should use Math.max(0.0001, tl))
const stepZeroTL = FuelMoistureCalculator.stepMoisture(10, 5, 12, 0);
assert(stepZeroTL > 0, `Zero timelag should not cause error (got ${stepZeroTL}%)`);
assert(stepZeroTL < 10, 'Zero timelag should still allow drying');

// Negative timelag (should be protected by Math.max)
const stepNegTL = FuelMoistureCalculator.stepMoisture(10, 5, 12, -5);
assert(stepNegTL > 0, `Negative timelag should not cause error (got ${stepNegTL}%)`);
assert(stepNegTL < 10, 'Negative timelag should still allow drying');

// Very small positive timelag
const stepSmallTL = FuelMoistureCalculator.stepMoisture(10, 5, 12, 0.00001);
assert(stepSmallTL >= 0, `Very small timelag should work (got ${stepSmallTL}%)`);
assertEquals(stepSmallTL, 5, 'Very small timelag should rapidly approach EMC', 0.5);

// Very large timelag (1000-hour fuels)
const step1000hr = FuelMoistureCalculator.stepMoisture(20, 5, 12, 1000);
assert(step1000hr > 15, `1000-hour fuels should change slowly (got ${step1000hr}%)`);
assert(step1000hr < 20, '1000-hour fuels should still change slightly');

// 100-hour fuels
const step100hr = FuelMoistureCalculator.stepMoisture(20, 5, 12, 100);
assert(step100hr > 10 && step100hr < 20, `100-hour fuels (got ${step100hr}%)`);

// Negative hours (edge case)
const stepNegHours = FuelMoistureCalculator.stepMoisture(10, 5, -12, 10);
assert(isFinite(stepNegHours), 'Negative hours should not break calculation');

// Zero hours (no change expected)
const stepZeroHours = FuelMoistureCalculator.stepMoisture(12, 8, 0, 10);
assertEquals(stepZeroHours, 12, 'Zero hours should result in no change', 0.1);

// Wetting scenario (moisture increasing)
const stepWetting = FuelMoistureCalculator.stepMoisture(5, 15, 12, 10);
assert(stepWetting > 5, 'Wetting scenario should increase moisture');
assert(stepWetting < 15, 'Should move toward EMC but not reach it in 12 hours');

// Very high initial moisture
const stepHighInitial = FuelMoistureCalculator.stepMoisture(100, 5, 12, 10);
assert(stepHighInitial < 100, 'Very high initial moisture should decrease');
assert(stepHighInitial > 5, 'Should not reach EMC in 12 hours');

// Negative initial moisture (edge case)
const stepNegInitial = FuelMoistureCalculator.stepMoisture(-5, 5, 12, 10);
assert(isFinite(stepNegInitial), 'Negative initial moisture should not break calculation');

// Initial equals EMC (equilibrium)
const stepEquilibrium = FuelMoistureCalculator.stepMoisture(8, 8, 12, 10);
assertEquals(stepEquilibrium, 8, 'At equilibrium should stay at equilibrium', 0.1);

// Very long time period
const stepLongTime = FuelMoistureCalculator.stepMoisture(20, 5, 240, 10);
assert(stepLongTime < 7, 'Very long time period should approach EMC closely');
assert(stepLongTime > 4, 'Should be close to but not exactly at EMC');

// ========== runModel Edge Cases ==========
console.log('\n--- runModel Edge Cases ---');

// Empty forecast array
const emptyResults = FuelMoistureCalculator.runModel(10, 12, []);
assert(emptyResults.dailyResults.length === 0, 'Empty forecast should return empty results');
assert(emptyResults.initial1hr === 10, 'Should preserve initial 1-hour');
assert(emptyResults.initial10hr === 12, 'Should preserve initial 10-hour');
assert(emptyResults.summary.firstCritical1HrDay === null, 'No critical day with empty forecast');

// Single day forecast
const singleDay = FuelMoistureCalculator.runModel(10, 12, [{ temp: 75, rh: 50 }]);
assert(singleDay.dailyResults.length === 1, 'Single day forecast should have 1 result');
assert(singleDay.dailyResults[0].hours === 12, 'Should use default 12 hours');
assert(singleDay.dailyResults[0].wind === 0, 'Should use default 0 wind');

// Forecast with hours = 0 (should preserve 0, not default to 12)
const zeroHours = FuelMoistureCalculator.runModel(10, 12, [{ temp: 75, rh: 50, hours: 0 }]);
assertEquals(zeroHours.dailyResults[0].hours, 0, 'Should preserve hours = 0', 0.01);
assertEquals(zeroHours.dailyResults[0].moisture1Hr, 10, 'Zero hours should not change moisture', 0.1);

// Forecast with wind = 0 (should preserve 0, not default)
const zeroWind = FuelMoistureCalculator.runModel(10, 12, [{ temp: 75, rh: 50, wind: 0 }]);
assertEquals(zeroWind.dailyResults[0].wind, 0, 'Should preserve wind = 0', 0.01);

// Forecast with positive wind
const withWind = FuelMoistureCalculator.runModel(10, 12, [{ temp: 75, rh: 50, wind: 15 }]);
assertEquals(withWind.dailyResults[0].wind, 15, 'Should preserve wind value', 0.01);

// Critical moisture threshold - exactly at 6%
const critical6 = FuelMoistureCalculator.runModel(6.0, 12, [{ temp: 75, rh: 50, hours: 1 }]);
if (critical6.dailyResults[0].moisture1Hr <= 6) {
  assert(critical6.summary.firstCritical1HrDay !== null, 'Should detect critical at threshold');
}

// Critical moisture threshold - just above 6%
const critical61 = FuelMoistureCalculator.runModel(6.1, 12, [{ temp: 90, rh: 20, hours: 24 }]);
if (critical61.dailyResults[0].moisture1Hr <= 6) {
  assert(critical61.summary.firstCritical1HrDay !== null, 'Should detect when moisture drops to critical');
}

// No critical condition
const noCritical = FuelMoistureCalculator.runModel(15, 18, [{ temp: 60, rh: 70, hours: 12 }]);
if (noCritical.dailyResults[0].moisture1Hr > 6) {
  assert(noCritical.summary.firstCritical1HrDay === null, 'Should not detect critical when above threshold');
}

// Multi-day forecast with varying conditions
const multiDay = FuelMoistureCalculator.runModel(10, 12, [
  { label: 'Day 1', temp: 75, rh: 50, wind: 5, hours: 12 },
  { label: 'Day 2', temp: 80, rh: 40, wind: 10, hours: 12 },
  { label: 'Day 3', temp: 85, rh: 30, wind: 15, hours: 12 },
  { label: 'Day 4', temp: 90, rh: 20, wind: 20, hours: 24 }
]);
assert(multiDay.dailyResults.length === 4, 'Should process all 4 days');
assert(multiDay.dailyResults[0].moisture1Hr < 10, 'Day 1 should show drying');
assert(multiDay.dailyResults[3].moisture1Hr < multiDay.dailyResults[0].moisture1Hr, 'Should show progressive drying');
assert(multiDay.dailyResults[3].moisture10Hr > multiDay.dailyResults[3].moisture1Hr, '10-hour should lag behind 1-hour');

// Test that 10-hour fuels lag behind 1-hour fuels
const lagTest = FuelMoistureCalculator.runModel(15, 18, [
  { temp: 85, rh: 25, hours: 12 }
]);
assert(lagTest.dailyResults[0].moisture10Hr > lagTest.dailyResults[0].moisture1Hr, 
  '10-hour fuels should lag when drying');

// ========== Temperature Conversion Edge Cases ==========
console.log('\n--- Temperature Conversion Edge Cases ---');

// Extreme values
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(-40), -40, 'Celsius to Fahrenheit at -40', 0.1);
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(-273.15), -459.67, 'Absolute zero conversion', 0.1);

assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(-40), -40, 'Fahrenheit to Celsius at -40', 0.1);
assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(-459.67), -273.15, 'Absolute zero conversion', 0.1);

// String inputs (should convert)
const fFromString = FuelMoistureCalculator.celsiusToFahrenheit('25');
assertEquals(fFromString, 77, 'Should convert string input', 0.1);

const cFromString = FuelMoistureCalculator.fahrenheitToCelsius('77');
assertEquals(cFromString, 25, 'Should convert string input', 0.1);

// Zero values
assertEquals(FuelMoistureCalculator.celsiusToFahrenheit(0), 32, 'Zero Celsius', 0.1);
assertEquals(FuelMoistureCalculator.fahrenheitToCelsius(0), -17.777777, 'Zero Fahrenheit', 0.1);

// ========== Integration Tests ==========
console.log('\n--- Integration Tests ---');

// Complete workflow: compute EMC and use in stepMoisture
const emc = FuelMoistureCalculator.computeEMC(85, 25);
const newMoisture = FuelMoistureCalculator.stepMoisture(15, emc, 12, 1);
assert(newMoisture < 15, 'Integration: EMC -> stepMoisture should show drying');
assert(newMoisture >= emc, 'Should be at or above EMC (minimum)');

// Complete workflow with temperature conversion
const celsiusTemp = 25;
const fahrenheitTemp = FuelMoistureCalculator.celsiusToFahrenheit(celsiusTemp);
const emcFromConverted = FuelMoistureCalculator.computeEMC(fahrenheitTemp, 50);
assert(emcFromConverted > 0, 'Integration: temp conversion -> EMC should work');

// Full model run with realistic conditions
const realisticForecast = FuelMoistureCalculator.runModel(12, 15, [
  { label: 'Monday', temp: 70, rh: 60, wind: 5, hours: 14 },
  { label: 'Tuesday', temp: 75, rh: 55, wind: 8, hours: 14 },
  { label: 'Wednesday', temp: 78, rh: 48, wind: 10, hours: 15 },
  { label: 'Thursday', temp: 82, rh: 42, wind: 12, hours: 16 },
  { label: 'Friday', temp: 85, rh: 35, wind: 15, hours: 16 }
]);
assert(realisticForecast.dailyResults.length === 5, 'Should process 5 days');
assert(realisticForecast.dailyResults[4].moisture1Hr < 12, 'Should show overall drying trend');
assert(realisticForecast.dailyResults[0].day === 'Monday', 'Should preserve labels');
assert(realisticForecast.dailyResults[0].hours === 14, 'Should preserve custom hours');

// ========== Precision and Rounding Tests ==========
console.log('\n--- Precision and Rounding Tests ---');

// EMC should return one decimal place
const emcPrecision = FuelMoistureCalculator.computeEMC(75.123, 50.789);
const emcStr = emcPrecision.toString();
const decimalPlaces = emcStr.includes('.') ? emcStr.split('.')[1].length : 0;
assert(decimalPlaces <= 1, `EMC should have max 1 decimal place (got ${emcPrecision})`);

// stepMoisture should return one decimal place
const stepPrecision = FuelMoistureCalculator.stepMoisture(12.456, 8.789, 12.123, 10.456);
const stepStr = stepPrecision.toString();
const stepDecimals = stepStr.includes('.') ? stepStr.split('.')[1].length : 0;
assert(stepDecimals <= 1, `stepMoisture should have max 1 decimal place (got ${stepPrecision})`);

// ========== Version Test ==========
console.log('\n--- Version Test ---');
assert(FuelMoistureCalculator.version === '1.0.0', 'Should have correct version');

// Summary
console.log('\n=== Test Summary ===');
console.log(`Total tests: ${testCount}`);
console.log(`Passed: ${passCount}`);
console.log(`Failed: ${failCount}`);

if (failCount === 0) {
  console.log('\n✓ All comprehensive tests passed!');
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
