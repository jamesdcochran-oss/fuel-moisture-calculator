# Fuel Moisture Calculator

A simple and efficient tool for calculating fuel moisture content. This package helps users easily determine the moisture levels in fuel components, essential for safe handling and storage.

## Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [Examples](#examples)
- [Contributing](#contributing)

## Installation
To install the package, use npm:
```bash
npm install fuel-moisture-calculator
```

## Usage
After installing, you can require the package in your JavaScript file:
```javascript
const FuelMoistureCalculator = require('fuel-moisture-calculator');
```

## Examples
### Basic Calculation
Calculate moisture content using the following function:
```javascript
const calculator = new FuelMoistureCalculator();
const moistureContent = calculator.calculateMoisture(gasDryWeight, gasWetWeight);
console.log(`Moisture Content: ${moistureContent}%`);
```

### Advanced Options
You can also customize the calculator settings:
```javascript
const calculator = new FuelMoistureCalculator({ precision: 2 });
const moistureContent = calculator.calculateMoisture(gasDryWeight, gasWetWeight);
console.log(`Moisture Content with Precision: ${moistureContent}%`);
```

## Contributing
Contributions are welcome! Please open an issue or submit a pull request if you'd like to contribute to this project.

---

## License
This project is licensed under the MIT License.