# Test Suite Documentation

This repository includes comprehensive unit tests to validate all functionality of the Fuel Moisture Calculator library.

## Test Files

### test/test.js (51 tests)
The original test suite covering core functionality:
- `computeEMC` basic functionality and validation
- `stepMoisture` time-lag modeling
- `runModel` multi-day forecast processing
- Temperature conversion functions
- Input validation and error handling
- Critical moisture detection

### test/comprehensive-test.js (65 tests)
Extended test suite covering edge cases and boundary conditions:
- **Extreme values**: Temperature ranges from -50°F to 150°F
- **Boundary conditions**: RH at 0% and 100%, zero/negative timelag
- **Edge cases**: Zero hours, negative hours, empty forecasts
- **Fuel types**: 1-hour, 10-hour, 100-hour, and 1000-hour fuel timelag
- **Wetting scenarios**: Moisture increasing (low initial → high EMC)
- **Critical thresholds**: Exact boundary testing at 6% moisture
- **Integration tests**: Full workflow validations
- **Precision tests**: Decimal place validation

## Running Tests

```bash
# Run all tests (116 tests total)
npm test

# Run basic tests only (51 tests)
npm run test:basic

# Run comprehensive tests only (65 tests)
npm run test:comprehensive

# Run tests with specific runtime
npm run test:node   # Node.js
npm run test:deno   # Deno
npm run test:bun    # Bun
```

## Test Coverage

### computeEMC Function
- ✅ Valid temperature and humidity ranges
- ✅ Extreme temperatures (-50°F to 150°F)
- ✅ RH clamping (negative values → 0, >100 → 100)
- ✅ String to number conversion
- ✅ NaN and Infinity rejection
- ✅ Minimum EMC enforcement (0.1%)

### stepMoisture Function
- ✅ Time-lag modeling (1-hr, 10-hr, 100-hr, 1000-hr fuels)
- ✅ Drying scenarios (moisture decreasing)
- ✅ Wetting scenarios (moisture increasing)
- ✅ Zero hours (no change)
- ✅ Negative hours handling
- ✅ Zero/negative timelag protection
- ✅ Equilibrium conditions
- ✅ Extreme moisture values

### runModel Function
- ✅ Multi-day forecast processing
- ✅ Empty forecast arrays
- ✅ Single day forecasts
- ✅ Custom labels and default labels
- ✅ Hours = 0 preservation (fixed bug)
- ✅ Wind = 0 preservation (fixed bug)
- ✅ Critical moisture detection (≤6%)
- ✅ 10-hour fuel lag validation
- ✅ Input validation (non-arrays, null entries)

### Temperature Conversion
- ✅ Celsius to Fahrenheit
- ✅ Fahrenheit to Celsius
- ✅ Extreme values (absolute zero)
- ✅ String input conversion
- ✅ NaN and Infinity rejection

## Bug Fixes Identified

1. **Hours Default Value**: Fixed `day.hours || 12` to properly handle `hours: 0`
   - **Before**: `hours: 0` would default to 12 (falsy check)
   - **After**: `hours: 0` is preserved correctly using `!== undefined` check

2. **Wind Default Value**: Fixed `day.wind || 0` to properly handle `wind: 0`
   - **Before**: Setting wind explicitly to 0 would be treated as missing
   - **After**: `wind: 0` is preserved correctly using `!== undefined` check

## Test Results

All 116 tests passing:
- ✅ 51 basic functionality tests
- ✅ 65 comprehensive edge case tests
- ✅ 0 failures
- ✅ 100% pass rate

## Edge Cases Validated

1. Division by zero protection in timelag calculations
2. RH clamping to valid 0-100 range
3. Minimum EMC enforcement (never below 0.1%)
4. Proper handling of zero values (hours, wind, timelag)
5. Negative value handling (hours, timelag, moisture)
6. Very large timelag values (1000-hour fuels)
7. Extreme temperature ranges
8. Empty and single-item forecasts
9. Critical threshold boundary conditions
10. Precision and rounding validation (1 decimal place)
