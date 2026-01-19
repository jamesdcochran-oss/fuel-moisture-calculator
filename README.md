# Fuel Moisture Calculator

## Overview
The Fuel Moisture Calculator is a specialized tool designed to help users analyze and predict fuel moisture levels, which are critical for understanding fire behavior. This calculator plays a significant role in fire weather analysis and predictions by allowing users to assess moisture content, thereby aiding in fire risk assessment and management.

## Features
- **Compute Equilibrium Moisture Content (EMC):** Accurately calculates the moisture content in fuel beds at various temperature and humidity levels.
- **Time-lag drying/wetting model:** Implements models that reflect how moisture levels change over time under different environmental conditions.
- **Forecast trend modeling:** Utilizes historical and predicted data to model future trends in fuel moisture content.
- **Customizable parameters:** Users can input specific parameters such as temperature, humidity, and time lag for tailored results.

## Installation
To install the Fuel Moisture Calculator, please ensure you have [npm](https://www.npmjs.com/) installed. Then, run the following command in your terminal:

```
npm install fuel-moisture-calculator
```

If you are unfamiliar with npm, refer to the official [npm documentation](https://docs.npmjs.com/getting-started/installing-node) for instructions on installation and setup.

## Usage
To use the Fuel Moisture Calculator, you can follow these steps:

1. **Basic Prediction:** Run a simple prediction to gauge moisture levels using default settings.

   ```
   const fuelMoistureCalculator = require('fuel-moisture-calculator');
   
   const prediction = fuelMoistureCalculator.predict();
   console.log(prediction);
   ```

2. **Extended Weather Simulation:** Perform advanced simulations by setting custom parameters such as temperature and humidity.
   
   ```
   const customPrediction = fuelMoistureCalculator.predict({ temperature: 30, humidity: 50 });
   console.log(customPrediction);
   ```

3. **Real-world Testing:** Run both basic and advanced tests to determine fuel moisture under various conditions.

## Contributing
We welcome contributions to the Fuel Moisture Calculator! To contribute, please follow these steps:
1. **Open Issues:** If you find a bug or have a feature request, please open a new issue in the repository.
2. **Fork the Repository:** Create a personal fork of the repository to make changes.
3. **Submit a Pull Request:** After making your changes, submit a pull request detailing the improvements you've made.

## Future Enhancements (Coming Soon)
- Predict drying trends with improved graph outputs.
- Integrate wind factor simulation.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.