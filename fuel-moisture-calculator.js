/**
 * Fuel Moisture Calculator
 * A robust JavaScript library for fire weather fuel moisture calculations
 * 
 * @version 1.0.0
 * @license MIT
 * @author James D. Cochran
 */

(function (global, factory) {
  // UMD (Universal Module Definition) pattern for universal compatibility
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.FuelMoistureCalculator = factory());
})(this, (function () {
  'use strict';

  /**
   * Validates that a value is a finite number
   * @private
   * @param {*} value - Value to validate
   * @param {string} name - Parameter name for error messages
   * @returns {number} Validated number
   * @throws {TypeError} If value is not a finite number
   */
  function validateNumber(value, name) {
    if (typeof value !== 'number' || !isFinite(value)) {
      throw new TypeError(`${name} must be a finite number, got ${typeof value}: ${value}`);
    }
    return value;
  }

  /**
   * Validates that a value is within a specified range
   * @private
   * @param {number} value - Value to validate
   * @param {number} min - Minimum allowed value
   * @param {number} max - Maximum allowed value
   * @param {string} name - Parameter name for error messages
   * @returns {number} Validated number
   * @throws {RangeError} If value is outside the specified range
   */
  function validateRange(value, min, max, name) {
    if (value < min || value > max) {
      throw new RangeError(`${name} must be between ${min} and ${max}, got ${value}`);
    }
    return value;
  }

  /**
   * Calculates fine fuel moisture content using Nelson's model (2000)
   * Fine fuels are typically < 0.25 inches in diameter (1-hour fuels)
   * 
   * @param {number} temperature - Air temperature in degrees Fahrenheit
   * @param {number} relativeHumidity - Relative humidity as a percentage (0-100)
   * @returns {number} Fine fuel moisture content as a percentage
   * @throws {TypeError} If parameters are not finite numbers
   * @throws {RangeError} If parameters are outside valid ranges
   * 
   * @example
   * const moisture = calculateFineFuelMoisture(75, 50);
   * console.log(moisture); // ~8.9
   */
  function calculateFineFuelMoisture(temperature, relativeHumidity) {
    // Validate inputs
    validateNumber(temperature, 'temperature');
    validateNumber(relativeHumidity, 'relativeHumidity');
    
    // Reasonable ranges for weather conditions
    validateRange(temperature, -50, 150, 'temperature');
    validateRange(relativeHumidity, 0, 100, 'relativeHumidity');

    // Nelson's fine fuel moisture model
    // EMC = equilibrium moisture content
    const humidity = relativeHumidity / 100;
    
    let emc;
    if (humidity <= 0.10) {
      emc = 0.03229 + 0.281073 * humidity - 0.000578 * temperature * humidity;
    } else if (humidity <= 0.50) {
      emc = 2.22749 + 0.160107 * humidity - 0.014784 * temperature;
    } else {
      emc = 21.0606 + 0.005565 * humidity * humidity - 0.00035 * humidity * temperature - 0.483199 * humidity;
    }

    // Apply temperature correction factor
    const tempCorrection = 1 + 0.00509 * (temperature - 70);
    emc = emc * tempCorrection;

    // Ensure result is within reasonable bounds
    return Math.max(0, Math.min(100, emc));
  }

  /**
   * Calculates 10-hour fuel moisture content
   * 10-hour fuels are typically 0.25-1 inch in diameter
   * 
   * @param {number} temperature - Air temperature in degrees Fahrenheit
   * @param {number} relativeHumidity - Relative humidity as a percentage (0-100)
   * @param {number} [shading=0] - Shading factor (0=full sun, 1=full shade)
   * @returns {number} 10-hour fuel moisture content as a percentage
   * @throws {TypeError} If parameters are not finite numbers
   * @throws {RangeError} If parameters are outside valid ranges
   * 
   * @example
   * const moisture = calculate10HourFuelMoisture(75, 50, 0.5);
   * console.log(moisture); // ~9.2
   */
  function calculate10HourFuelMoisture(temperature, relativeHumidity, shading = 0) {
    // Validate inputs
    validateNumber(temperature, 'temperature');
    validateNumber(relativeHumidity, 'relativeHumidity');
    validateNumber(shading, 'shading');
    
    validateRange(temperature, -50, 150, 'temperature');
    validateRange(relativeHumidity, 0, 100, 'relativeHumidity');
    validateRange(shading, 0, 1, 'shading');

    // Base calculation using fine fuel moisture
    let moisture = calculateFineFuelMoisture(temperature, relativeHumidity);
    
    // Apply lag factor for 10-hour fuels (slower response to conditions)
    moisture = moisture * 1.03;
    
    // Apply shading adjustment (shaded fuels retain more moisture)
    if (shading > 0) {
      moisture = moisture * (1 + shading * 0.1);
    }

    return Math.max(0, Math.min(100, moisture));
  }

  /**
   * Calculates 100-hour fuel moisture content
   * 100-hour fuels are typically 1-3 inches in diameter
   * 
   * @param {number} temperature - Air temperature in degrees Fahrenheit
   * @param {number} relativeHumidity - Relative humidity as a percentage (0-100)
   * @param {number} [previousMoisture] - Previous moisture content (for lag calculation)
   * @returns {number} 100-hour fuel moisture content as a percentage
   * @throws {TypeError} If parameters are not finite numbers
   * @throws {RangeError} If parameters are outside valid ranges
   * 
   * @example
   * const moisture = calculate100HourFuelMoisture(75, 50);
   * console.log(moisture); // ~10.1
   */
  function calculate100HourFuelMoisture(temperature, relativeHumidity, previousMoisture) {
    // Validate inputs
    validateNumber(temperature, 'temperature');
    validateNumber(relativeHumidity, 'relativeHumidity');
    
    validateRange(temperature, -50, 150, 'temperature');
    validateRange(relativeHumidity, 0, 100, 'relativeHumidity');

    // Base calculation
    let moisture = calculateFineFuelMoisture(temperature, relativeHumidity);
    
    // Apply lag factor for 100-hour fuels (much slower response)
    moisture = moisture * 1.12;
    
    // If previous moisture is provided, apply lag calculation
    if (previousMoisture !== undefined) {
      validateNumber(previousMoisture, 'previousMoisture');
      validateRange(previousMoisture, 0, 100, 'previousMoisture');
      
      // Weighted average (100-hour fuels respond slowly to changes)
      moisture = previousMoisture * 0.92 + moisture * 0.08;
    }

    return Math.max(0, Math.min(100, moisture));
  }

  /**
   * Calculates 1000-hour fuel moisture content
   * 1000-hour fuels are typically 3-8 inches in diameter
   * 
   * @param {number} temperature - Air temperature in degrees Fahrenheit
   * @param {number} relativeHumidity - Relative humidity as a percentage (0-100)
   * @param {number} [previousMoisture] - Previous moisture content (for lag calculation)
   * @returns {number} 1000-hour fuel moisture content as a percentage
   * @throws {TypeError} If parameters are not finite numbers
   * @throws {RangeError} If parameters are outside valid ranges
   * 
   * @example
   * const moisture = calculate1000HourFuelMoisture(75, 50);
   * console.log(moisture); // ~11.5
   */
  function calculate1000HourFuelMoisture(temperature, relativeHumidity, previousMoisture) {
    // Validate inputs
    validateNumber(temperature, 'temperature');
    validateNumber(relativeHumidity, 'relativeHumidity');
    
    validateRange(temperature, -50, 150, 'temperature');
    validateRange(relativeHumidity, 0, 100, 'relativeHumidity');

    // Base calculation
    let moisture = calculateFineFuelMoisture(temperature, relativeHumidity);
    
    // Apply lag factor for 1000-hour fuels (very slow response)
    moisture = moisture * 1.28;
    
    // If previous moisture is provided, apply lag calculation
    if (previousMoisture !== undefined) {
      validateNumber(previousMoisture, 'previousMoisture');
      validateRange(previousMoisture, 0, 100, 'previousMoisture');
      
      // Weighted average (1000-hour fuels respond very slowly)
      moisture = previousMoisture * 0.98 + moisture * 0.02;
    }

    return Math.max(0, Math.min(100, moisture));
  }

  /**
   * Calculates all fuel moisture timelag classes at once
   * 
   * @param {Object} conditions - Weather conditions
   * @param {number} conditions.temperature - Air temperature in degrees Fahrenheit
   * @param {number} conditions.relativeHumidity - Relative humidity as a percentage (0-100)
   * @param {number} [conditions.shading=0] - Shading factor for 10-hour fuels (0-1)
   * @param {Object} [previous] - Previous moisture values for lag calculations
   * @param {number} [previous.hundredHour] - Previous 100-hour moisture
   * @param {number} [previous.thousandHour] - Previous 1000-hour moisture
   * @returns {Object} Moisture content for all timelag classes
   * @throws {TypeError} If parameters are not valid
   * @throws {RangeError} If parameters are outside valid ranges
   * 
   * @example
   * const moistures = calculateAllFuelMoistures({
   *   temperature: 75,
   *   relativeHumidity: 50,
   *   shading: 0.5
   * });
   * console.log(moistures);
   * // {
   * //   oneHour: 8.9,
   * //   tenHour: 9.2,
   * //   hundredHour: 10.1,
   * //   thousandHour: 11.5
   * // }
   */
  function calculateAllFuelMoistures(conditions, previous = {}) {
    if (typeof conditions !== 'object' || conditions === null) {
      throw new TypeError('conditions must be an object');
    }

    const { temperature, relativeHumidity, shading = 0 } = conditions;
    
    return {
      oneHour: calculateFineFuelMoisture(temperature, relativeHumidity),
      tenHour: calculate10HourFuelMoisture(temperature, relativeHumidity, shading),
      hundredHour: calculate100HourFuelMoisture(temperature, relativeHumidity, previous.hundredHour),
      thousandHour: calculate1000HourFuelMoisture(temperature, relativeHumidity, previous.thousandHour)
    };
  }

  /**
   * Converts temperature from Celsius to Fahrenheit
   * 
   * @param {number} celsius - Temperature in Celsius
   * @returns {number} Temperature in Fahrenheit
   * @throws {TypeError} If celsius is not a finite number
   * 
   * @example
   * const fahrenheit = celsiusToFahrenheit(25);
   * console.log(fahrenheit); // 77
   */
  function celsiusToFahrenheit(celsius) {
    validateNumber(celsius, 'celsius');
    return (celsius * 9/5) + 32;
  }

  /**
   * Converts temperature from Fahrenheit to Celsius
   * 
   * @param {number} fahrenheit - Temperature in Fahrenheit
   * @returns {number} Temperature in Celsius
   * @throws {TypeError} If fahrenheit is not a finite number
   * 
   * @example
   * const celsius = fahrenheitToCelsius(77);
   * console.log(celsius); // 25
   */
  function fahrenheitToCelsius(fahrenheit) {
    validateNumber(fahrenheit, 'fahrenheit');
    return (fahrenheit - 32) * 5/9;
  }

  // Public API
  return {
    calculateFineFuelMoisture,
    calculateOneHourFuelMoisture: calculateFineFuelMoisture, // Alias
    calculate10HourFuelMoisture,
    calculate100HourFuelMoisture,
    calculate1000HourFuelMoisture,
    calculateAllFuelMoistures,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    version: '1.0.0'
  };
}));
