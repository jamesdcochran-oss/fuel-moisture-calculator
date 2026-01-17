# 🔥 Fuel Moisture Calculator

[![npm version](https://img.shields.io/npm/v/fuel-moisture-calculator.svg)](https://www.npmjs.com/package/fuel-moisture-calculator)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Tests](https://github.com/jamesdcochran-oss/fuel-moisture-calculator/workflows/tests/badge.svg)](https://github.com/jamesdcochran-oss/fuel-moisture-calculator/actions)

A robust, production-ready JavaScript library for calculating fire weather fuel moisture content. Uses empirical approximation methods and exponential time-lag models commonly employed in fire weather tools for practical fuel moisture prediction.

## ✨ Key Features

- **🌍 Universal Compatibility**: Works seamlessly in browser, Node.js, Deno, and Bun
- **📦 Zero Dependencies**: Pure JavaScript with no external requirements
- **🛡️ Production Ready**: Validated with 51 comprehensive tests
- **🚀 CDN Ready**: Can be served via jsDelivr or unpkg
- **📚 NPM Ready**: Published and ready to install
- **🔄 Automated Testing**: GitHub Actions CI/CD workflow
- **🛠️ Defensive Programming**: Robust input validation and error handling
- **📖 Well Documented**: Complete API documentation and examples
- **🌐 Browser UI Support**: Optional DOM wiring for interactive web applications

## 📥 Installation

### NPM / Node.js

```bash
npm install fuel-moisture-calculator
```

### Deno

```javascript
import FuelMoistureCalculator from 'https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js';
```

### Bun

```bash
bun add fuel-moisture-calculator
```

### Browser (CDN)

```html
<script src="https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js"></script>
```

or

```html
<script src="https://unpkg.com/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js"></script>
```

## 🚀 Quick Start

### Node.js

```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');

// Calculate equilibrium moisture content (EMC)
const emc = FuelMoistureCalculator.computeEMC(75, 50);
console.log(`EMC: ${emc}%`); // 3.8%

// Model time-lag drying over 12 hours
const newMoisture = FuelMoistureCalculator.stepMoisture(12, emc, 12, 10);
console.log(`New moisture: ${newMoisture}%`); // 9.2%

// Run multi-day forecast
const results = FuelMoistureCalculator.runModel(10, 12, [
    { temp: 75, rh: 50, hours: 12 },
    { temp: 80, rh: 40, hours: 12 }
]);
console.log(results.dailyResults);
```

### Browser

```html
<script src="https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js"></script>
<script>
    const emc = FuelMoistureCalculator.computeEMC(75, 50);
    console.log(`EMC: ${emc}%`);
</script>
```

### Deno

```javascript
import FuelMoistureCalculator from 'https://cdn.jsdelivr.net/npm/fuel-moisture-calculator@1.0.0/fuel-moisture-calculator.js';

const emc = FuelMoistureCalculator.computeEMC(75, 50);
console.log(`EMC: ${emc}%`);
```

## 📖 API Reference

### computeEMC(tempF, rh)

Compute Equilibrium Moisture Content (EMC) using empirical approximation commonly used in fire-weather tools.

**Parameters:**
- `tempF` (number): Air temperature in degrees Fahrenheit
- `rh` (number): Relative humidity as percentage (0-100, automatically clamped)

**Returns:** (number) Equilibrium moisture content as percentage (minimum 0.1%)

**Example:**
```javascript
const emc = FuelMoistureCalculator.computeEMC(75, 50);
// Returns: 3.8
```

### stepMoisture(initial, emc, hours, timeLag)

Calculate fuel moisture using exponential time-lag drying/wetting model.

Formula: `m_t = EMC + (m0 - EMC) * exp(-hours / timeLag)`

**Parameters:**
- `initial` (number): Initial moisture content as percentage
- `emc` (number): Equilibrium moisture content as percentage
- `hours` (number): Number of hours for the time step
- `timeLag` (number): Time lag constant in hours
  - `1` for 1-hour fuels (< 0.25" diameter)
  - `10` for 10-hour fuels (0.25-1" diameter)
  - `100` for 100-hour fuels (1-3" diameter)
  - `1000` for 1000-hour fuels (3-8" diameter)

**Returns:** (number) New moisture content as percentage

**Example:**
```javascript
const moisture = FuelMoistureCalculator.stepMoisture(12, 8, 12, 10);
// Returns: 9.2 (moisture moving toward EMC of 8%)
```

### runModel(initial1hr, initial10hr, forecastEntries)

Run moisture model over multiple forecast days.

**Parameters:**
- `initial1hr` (number): Initial 1-hour fuel moisture percentage
- `initial10hr` (number): Initial 10-hour fuel moisture percentage
- `forecastEntries` (Array<Object>): Array of forecast day objects
  - `label` (string, optional): Day label (e.g., "Day 1", "Monday")
  - `temp` (number): Temperature in °F
  - `rh` (number): Relative humidity percentage
  - `wind` (number, optional): Wind speed
  - `hours` (number, optional): Hours in period (default: 12)

**Returns:** (Object) Model results
- `initial1hr` (number): Initial 1-hour moisture
- `initial10hr` (number): Initial 10-hour moisture
- `dailyResults` (Array): Array of daily calculations
  - `day` (string): Day label
  - `temp` (number): Temperature
  - `rh` (number): Relative humidity
  - `wind` (number): Wind speed
  - `hours` (number): Time period
  - `moisture1Hr` (number): Calculated 1-hour moisture
  - `moisture10Hr` (number): Calculated 10-hour moisture
- `summary` (Object): Summary information
  - `firstCritical1HrDay` (string|null): First day 1-hour moisture ≤ 6% (critical)

**Example:**
```javascript
const results = FuelMoistureCalculator.runModel(10, 12, [
    { label: 'Monday', temp: 75, rh: 50, hours: 12 },
    { label: 'Tuesday', temp: 80, rh: 40, hours: 12 }
]);

console.log(results.dailyResults);
if (results.summary.firstCritical1HrDay) {
    console.log(`Critical drying on ${results.summary.firstCritical1HrDay}`);
}
```

### celsiusToFahrenheit(celsius)

Convert temperature from Celsius to Fahrenheit.

**Parameters:**
- `celsius` (number): Temperature in Celsius

**Returns:** (number) Temperature in Fahrenheit

### fahrenheitToCelsius(fahrenheit)

Convert temperature from Fahrenheit to Celsius.

**Parameters:**
- `fahrenheit` (number): Temperature in Fahrenheit

**Returns:** (number) Temperature in Celsius

## 🔬 Scientific Background

This library implements empirical fuel moisture calculations using:

1. **Equilibrium Moisture Content (EMC)**: Empirical approximation formula commonly used in fire weather tools
2. **Exponential Time-Lag Model**: Models how fuels gradually adjust to equilibrium conditions based on their size class

**Fuel Timelag Classes:**

- **1-Hour Fuels**: Fine fuels < 0.25" diameter (grass, needles, small twigs) - rapid response
- **10-Hour Fuels**: 0.25-1" diameter (small branches) - moderate response
- **100-Hour Fuels**: 1-3" diameter (medium branches) - slow response
- **1000-Hour Fuels**: 3-8" diameter (logs, large branches) - very slow response

The timelag represents the time required for the fuel to lose or gain approximately 63% of the difference between its current moisture content and the equilibrium moisture content.

## 🧪 Testing

Run the test suite (51 comprehensive tests):

```bash
# Node.js
npm test

# Deno
deno run --allow-read test/test.js

# Bun
bun test/test.js
```

## 📚 Examples

Check the `examples/` directory for complete working examples:

- `browser-example.html` - Interactive web interface with UI controls
- `node-example.js` - Node.js usage examples
- `deno-example.js` - Deno usage examples
- `bun-example.js` - Bun usage examples

## 🛡️ Error Handling

The library performs defensive input validation:

```javascript
// String inputs are automatically converted to numbers
const emc = FuelMoistureCalculator.computeEMC('75', 50); // Works!

// Invalid inputs throw TypeErrors
try {
    FuelMoistureCalculator.computeEMC(NaN, 50);
} catch (error) {
    console.error(error.message); // "Temperature and humidity must be finite numbers"
}

// Humidity is automatically clamped to 0-100 range
const emc2 = FuelMoistureCalculator.computeEMC(75, 150); // Treated as 100%
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 👤 Author

James D. Cochran

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/jamesdcochran-oss/fuel-moisture-calculator/issues).

## 📦 Package Size

- **Uncompressed**: ~12KB
- **Zero dependencies**

## 🔗 Links

- [NPM Package](https://www.npmjs.com/package/fuel-moisture-calculator)
- [GitHub Repository](https://github.com/jamesdcochran-oss/fuel-moisture-calculator)
- [Issue Tracker](https://github.com/jamesdcochran-oss/fuel-moisture-calculator/issues)
