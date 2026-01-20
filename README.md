# Fuel Moisture Calculator

## Overview
The Fuel Moisture Calculator is a specialized tool designed to help users analyze and predict fuel moisture levels, which are critical for understanding fire behavior. This calculator plays a significant role in fire weather analysis and predictions by allowing users to assess moisture content, thereby aiding in fire risk assessment and management.

## Features
- **Compute Equilibrium Moisture Content (EMC):** Accurately calculates the moisture content in fuel beds at various temperature and humidity levels using Nelson's EMC equation.
- **Time-lag drying/wetting model:** Implements exponential approach models that reflect how moisture levels change over time under different environmental conditions for 1-hour, 10-hour, and 100-hour fuel classes.
- **Forecast trend modeling:** Utilizes historical and predicted data to model future trends in fuel moisture content.
- **Drying-Out Simulation:** Simulates drying processes for dead fuels based on time-series weather data.
- **Multi-day forecast modeling:** Run comprehensive multi-period forecasts with automatic detection of critical drying conditions.
- **Temperature conversion utilities:** Convert between Celsius and Fahrenheit.
- **Customizable parameters:** Users can input specific parameters such as temperature, humidity, and time lag for tailored results.

## Installation
To install the Fuel Moisture Calculator, please ensure you have [npm](https://www.npmjs.com/) installed. Then, run the following command in your terminal:

```bash
npm install fuel-moisture-calculator
```

If you are unfamiliar with npm, refer to the official [npm documentation](https://docs.npmjs.com/getting-started/installing-node) for instructions on installation and setup.

## API Reference

### computeEMC(temp, rh)
Computes Equilibrium Moisture Content (EMC) based on temperature and relative humidity using Nelson's equation.

**Parameters:**
- `temp` (number): Temperature in Fahrenheit
- `rh` (number): Relative humidity in percentage (0-100)

**Returns:** EMC in percentage

**Example:**
```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');

const emc = FuelMoistureCalculator.computeEMC(75, 50);
console.log(`EMC: ${emc}%`); // Output: EMC: 9.5%
```

### stepMoisture(currentMoisture, emc, hours, timeLag)
Updates fuel moisture content using the time-lag model with exponential approach to EMC.

**Parameters:**
- `currentMoisture` (number): Current fuel moisture percentage
- `emc` (number): Equilibrium moisture content percentage
- `hours` (number): Time period in hours
- `timeLag` (number): Time lag constant in hours (1, 10, or 100)

**Returns:** New moisture content percentage

**Example:**
```javascript
const newMoisture = FuelMoistureCalculator.stepMoisture(12, 8, 12, 10);
console.log(`New moisture: ${newMoisture}%`); // Output: New moisture: 9.2%
```

### simulateDrying(dryingInputs)
Simulates drying trends for 1-hour, 10-hour, and 100-hour fuel classes over a time series.

**Parameters:**
- `dryingInputs` (Object):
  - `tempSeries` (Array): Array of temperatures in Fahrenheit
  - `rhSeries` (Array): Array of relative humidity percentages
  - `initialState` (Object):
    - `m1` (number): Initial 1-hour fuel moisture
    - `m10` (number): Initial 10-hour fuel moisture
    - `m100` (number): Initial 100-hour fuel moisture
  - `timeStep` (number, optional): Time step in hours (default: 1.0)

**Returns:** Array of moisture trends for each time step

**Example:**
```javascript
const dryingInputs = {
  tempSeries: [60, 65, 70, 75],
  rhSeries: [40, 35, 30, 25],
  initialState: { m1: 30.0, m10: 20, m100: 15 },
  timeStep: 1.0
};

const results = FuelMoistureCalculator.simulateDrying(dryingInputs);
console.log(results);
// Output: Array of objects with step, temp, rh, emc, m1, m10, m100
```

### runModel(initial1hr, initial10hr, forecast)
Runs a multi-day forecast model for fuel moisture with automatic critical drying detection.

**Parameters:**
- `initial1hr` (number): Initial 1-hour fuel moisture percentage
- `initial10hr` (number): Initial 10-hour fuel moisture percentage
- `forecast` (Array): Array of forecast periods, each containing:
  - `temp` (number): Temperature in Fahrenheit
  - `rh` (number): Relative humidity percentage
  - `hours` (number): Duration of period in hours
  - `label` (string, optional): Custom label for the period
  - `wind` (number, optional): Wind speed (preserved in output)

**Returns:** Object containing:
- `initial1hr`: Initial 1-hour moisture
- `initial10hr`: Initial 10-hour moisture
- `dailyResults`: Array of daily moisture values
- `summary`: Summary including first critical day and final moisture values

**Example:**
```javascript
const forecast = [
  { temp: 75, rh: 50, hours: 12 },
  { temp: 80, rh: 40, hours: 12 },
  { temp: 85, rh: 30, hours: 12 }
];

const results = FuelMoistureCalculator.runModel(10, 12, forecast);
console.log(results.dailyResults);
console.log(`Final 1-hr moisture: ${results.summary.finalMoisture1Hr}%`);

if (results.summary.firstCritical1HrDay) {
  console.log(`⚠️  Critical drying detected on: ${results.summary.firstCritical1HrDay}`);
}
```

### celsiusToFahrenheit(celsius)
Converts Celsius to Fahrenheit.

**Parameters:**
- `celsius` (number): Temperature in Celsius

**Returns:** Temperature in Fahrenheit

**Example:**
```javascript
const fahrenheit = FuelMoistureCalculator.celsiusToFahrenheit(25);
console.log(`${25}°C = ${fahrenheit}°F`); // Output: 25°C = 77°F
```

### fahrenheitToCelsius(fahrenheit)
Converts Fahrenheit to Celsius.

**Parameters:**
- `fahrenheit` (number): Temperature in Fahrenheit

**Returns:** Temperature in Celsius

**Example:**
```javascript
const celsius = FuelMoistureCalculator.fahrenheitToCelsius(77);
console.log(`${77}°F = ${celsius}°C`); // Output: 77°F = 25°C
```

### calculateMoisture(input)
Legacy function for basic moisture calculation.

**Parameters:**
- `input` (Object):
  - `temperature` (number): Temperature in Fahrenheit
  - `humidity` (number): Relative humidity percentage

**Returns:** Calculated moisture content

## Usage Examples

### Basic EMC Calculation
```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');

// Compute EMC for specific conditions
const emc = FuelMoistureCalculator.computeEMC(75, 50);
console.log(`Temperature: 75°F, Humidity: 50%`);
console.log(`EMC: ${emc}%`);
```

### Time-Lag Drying Model
```javascript
// Simulate moisture change over time
const initial = 12;
const emc = 8;
const hours = 12;
const timeLag10 = 10;

const newMoisture = FuelMoistureCalculator.stepMoisture(initial, emc, hours, timeLag10);
console.log(`Initial: ${initial}%, After ${hours} hours: ${newMoisture}%`);
```

### Drying-Out Simulation
```javascript
// Simulate drying over multiple time steps
const dryingInputs = {
  tempSeries: [60, 65, 70, 75, 80],
  rhSeries: [40, 35, 30, 25, 20],
  initialState: { m1: 30.0, m10: 20, m100: 15 },
  timeStep: 1.0
};

const results = FuelMoistureCalculator.simulateDrying(dryingInputs);

results.forEach((step, index) => {
  console.log(`Hour ${index + 1}: 1-hr: ${step.m1}%, 10-hr: ${step.m10}%, 100-hr: ${step.m100}%`);
});
```

### Multi-Day Forecast
```javascript
// Run a 3-day forecast
const forecast = [
  { label: 'Monday', temp: 70, rh: 60, hours: 12 },
  { label: 'Tuesday', temp: 75, rh: 50, hours: 12 },
  { label: 'Wednesday', temp: 80, rh: 40, hours: 12 }
];

const results = FuelMoistureCalculator.runModel(10, 12, forecast);

console.log(`Initial: 1-hr: ${results.initial1hr}%, 10-hr: ${results.initial10hr}%`);
console.log('\nForecast Results:');

results.dailyResults.forEach(day => {
  console.log(`${day.day}: 1-hr: ${day.moisture1Hr}%, 10-hr: ${day.moisture10Hr}%`);
});

if (results.summary.firstCritical1HrDay) {
  console.log(`\n⚠️  Critical drying (≤6%) first detected on: ${results.summary.firstCritical1HrDay}`);
}
```

## Understanding Fuel Moisture Time Lags

Fuel moisture time lags represent the time required for fuel to reach approximately 63% of the difference between its current moisture content and the EMC:

- **1-hour fuels**: Fine dead fuels (grass, needles, small twigs < 1/4 inch diameter)
- **10-hour fuels**: Medium dead fuels (twigs 1/4 to 1 inch diameter)
- **100-hour fuels**: Large dead fuels (branches 1 to 3 inches diameter)

The exponential time-lag model: `M(t) = EMC + (M₀ - EMC) × e^(-t/τ)`

Where:
- `M(t)` = moisture at time t
- `M₀` = initial moisture
- `EMC` = equilibrium moisture content
- `τ` = time lag constant (1, 10, or 100 hours)
- `t` = elapsed time

## Critical Drying Threshold

The library automatically detects when 1-hour fuel moisture drops to or below 6%, which is considered a critical threshold for fire danger in many fire weather forecasting systems.

## Running Examples

The repository includes several example files demonstrating usage:

```bash
# Node.js example
node examples/node-example.js

# Deno example
deno run --allow-read examples/deno-example.js

# Bun example
bun examples/bun-example.js
```

## Testing

Run the comprehensive test suite:

```bash
npm test
```

The test suite includes:
- Unit tests for all functions
- Edge case validation
- Integration tests
- Temperature conversion tests

## Contributing
We welcome contributions to the Fuel Moisture Calculator! To contribute, please follow these steps:
1. **Open Issues:** If you find a bug or have a feature request, please open a new issue in the repository.
2. **Fork the Repository:** Create a personal fork of the repository to make changes.
3. **Submit a Pull Request:** After making your changes, submit a pull request detailing the improvements you've made.

## Technical Details

### EMC Calculation
The library uses Nelson's EMC equation, which provides separate formulas for different humidity ranges:
- Low humidity (< 10%): Linear approximation
- Medium humidity (10-50%): Moderate sensitivity to temperature
- High humidity (> 50%): Quadratic relationship with humidity

### Time-Lag Model
The exponential time-lag model simulates the gradual approach of fuel moisture to equilibrium conditions, accounting for the thermal and moisture diffusion properties of different fuel size classes.

## Requirements
- Node.js >= 14.0.0
- Compatible with Node.js, Deno, and Bun runtimes

## Future Enhancements
- Integration of wind factor simulation
- Support for 1000-hour fuel class
- Advanced visualization tools
- Historical data analysis capabilities

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
