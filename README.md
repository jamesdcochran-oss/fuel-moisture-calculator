# Fuel Moisture Calculator

A robust, standalone JavaScript library for calculating fuel moisture content using equilibrium moisture content (EMC) and time-lag drying models. Commonly used in fire weather forecasting and wildfire risk assessment.

![Test Suite](https://github.com/user-attachments/assets/a34342e5-fb13-4195-b9fb-07f22fe64136)

## Features

- **Robust Input Handling**: Defensive programming with proper validation to handle invalid inputs, NaN values, and preserve valid zeros
- **EMC Calculation**: Empirical approximation used in fire weather tools
- **Time-Lag Modeling**: Exponential decay model for 1-hour and 10-hour fuel moisture
- **Universal Compatibility**: Works in browser, Node.js, Deno, and Bun
- **Zero Dependencies**: Pure JavaScript with no external dependencies
- **Defensive Programming**: Guards against division by zero, invalid ranges, and missing DOM elements
- **Comprehensive Testing**: 51 automated tests covering all functionality

## Quick Start

### Browser Usage

```html
<!DOCTYPE html>
<html>
<head>
  <title>Fuel Moisture Calculator</title>
</head>
<body>
  <script src="fuel-moisture-calculator.js"></script>
  <script>
    // Calculate EMC
    const emc = FuelMoistureCalculator.computeEMC(85, 25); // temp=85°F, rh=25%
    console.log('EMC:', emc); // ~4.1%

    // Calculate fuel moisture after drying
    const moisture = FuelMoistureCalculator.stepMoisture(15, emc, 12, 1);
    console.log('1-hr fuel moisture:', moisture);

    // Run full model
    const results = FuelMoistureCalculator.runModel(10, 12, [
      { temp: 85, rh: 25, wind: 10, hours: 12 },
      { temp: 90, rh: 20, wind: 15, hours: 12 }
    ]);
    console.log('Results:', results);
  </script>
</body>
</html>
```

### Node.js Usage

```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');

// Calculate EMC
const emc = FuelMoistureCalculator.computeEMC(85, 25);
console.log('EMC:', emc);

// Run model
const results = FuelMoistureCalculator.runModel(10, 12, [
  { temp: 85, rh: 25, wind: 10, hours: 12 }
]);
console.log(results);
```

### NPM Installation

```bash
npm install fuel-moisture-calculator
```

## API Reference

### `computeEMC(tempF, rh)`

Computes Equilibrium Moisture Content using empirical approximation.

**Parameters:**
- `tempF` (number): Temperature in Fahrenheit (string inputs are converted)
- `rh` (number): Relative humidity percentage (automatically clamped to 0-100)

**Returns:** (number) EMC percentage with one decimal place, minimum 0.1%

**Throws:** TypeError if inputs cannot be converted to valid finite numbers

**Example:**
```javascript
const emc = FuelMoistureCalculator.computeEMC(85, 25); // Returns ~4.1
```

### `stepMoisture(initial, emc, hours, timeLag)`

Models fuel moisture change over time using exponential decay.

**Parameters:**
- `initial` (number): Initial fuel moisture percentage
- `emc` (number): Target equilibrium moisture content
- `hours` (number): Drying/wetting duration in hours
- `timeLag` (number): Fuel time-lag constant
  - `1` for 1-hour fuels (< 0.25" diameter)
  - `10` for 10-hour fuels (0.25-1" diameter)
  - `100` for 100-hour fuels (1-3" diameter)
  - `1000` for 1000-hour fuels (3-8" diameter)

**Returns:** (number) Final fuel moisture percentage with one decimal place

**Throws:** TypeError if any parameter is not a finite number

**Example:**
```javascript
const moisture = FuelMoistureCalculator.stepMoisture(20, 5, 6, 1); 
// 20% initial, drying to 5% EMC over 6 hours
// Returns: ~9.2%
```

### `runModel(initial1hr, initial10hr, forecastEntries)`

Runs fuel moisture model over multiple forecast periods.

**Parameters:**
- `initial1hr` (number): Initial 1-hour fuel moisture percentage
- `initial10hr` (number): Initial 10-hour fuel moisture percentage
- `forecastEntries` (Array): Array of forecast objects:
  - `label` (string, optional): Day label (e.g., "Day 1", "Monday")
  - `temp` (number): Temperature in °F
  - `rh` (number): Relative humidity %
  - `wind` (number, optional): Wind speed in mph
  - `hours` (number, optional): Drying hours (default: 12)

**Returns:** (Object) Results with `initial1hr`, `initial10hr`, `dailyResults` array, and `summary` object

**Example:**
```javascript
const results = FuelMoistureCalculator.runModel(10, 12, [
  { label: "Monday", temp: 85, rh: 25, wind: 10, hours: 12 },
  { label: "Tuesday", temp: 90, rh: 20, wind: 15, hours: 12 }
]);

if (results.summary.firstCritical1HrDay) {
  console.log(`⚠️ Critical drying on ${results.summary.firstCritical1HrDay}`);
}
```

### Temperature Conversion

```javascript
// Celsius to Fahrenheit
const f = FuelMoistureCalculator.celsiusToFahrenheit(25); // 77

// Fahrenheit to Celsius
const c = FuelMoistureCalculator.fahrenheitToCelsius(77); // 25
```

## Critical Moisture Thresholds

The model identifies critical fire weather conditions when:
- **1-hour fuel moisture ≤ 6%**: Indicates fine fuels are critically dry
- Fire weather forecasters use these thresholds to issue warnings

## Test Suite

Run the comprehensive test suite (51 tests):

```bash
npm test
```

Tests cover:
- EMC calculation validation
- Time-lag drying model verification
- Multi-day forecast processing
- Input validation and edge cases
- Critical condition detection
- Temperature conversions

## Examples

Complete working examples in the `examples/` directory:
- `browser-example.html` - Interactive web interface
- `node-example.js` - Node.js usage
- `deno-example.js` - Deno usage
- `bun-example.js` - Bun usage

### Multi-Day Forecast Example

```javascript
const FMC = require('fuel-moisture-calculator');

const forecast = FMC.runModel(15, 18, [
  { label: "Day 1", temp: 55, rh: 65, wind: 5, hours: 12 },
  { label: "Day 2", temp: 68, rh: 45, wind: 8, hours: 12 },
  { label: "Day 3", temp: 75, rh: 30, wind: 12, hours: 12 },
  { label: "Day 4", temp: 80, rh: 22, wind: 15, hours: 12 }
]);

forecast.dailyResults.forEach(day => {
  console.log(`${day.day}: 1-hr ${day.moisture1Hr}%, 10-hr ${day.moisture10Hr}%`);
});
```

## Technical Details

### EMC Formula

Empirical approximation commonly used in fire weather tools:

```
EMC = 0.942 × RH^0.679 + 11 × e^((RH-100)/10) + 0.18 × (21.1 - T) × (1 - e^(-0.115×RH))
```

### Time-Lag Model

Exponential decay toward equilibrium:

```
M(t) = EMC + (M₀ - EMC) × e^(-t/τ)
```

Where τ is the time-lag constant (1, 10, 100, or 1000 hours)

## Browser Compatibility

- Modern browsers (ES6+)
- Node.js 12+
- Deno
- Bun

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT License - See [LICENSE](LICENSE) file

## Author

James D. Cochran

## Acknowledgments

- EMC formula based on empirical approximations used in fire weather tools
- Time-lag model follows standard fuel moisture modeling practices

## Package Information

- **Version**: 1.0.0
- **Size**: ~12KB uncompressed
- **Dependencies**: Zero
- **License**: MIT
