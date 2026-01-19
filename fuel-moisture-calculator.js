/**
 * Fuel Moisture Calculator
 * 
 * Robust JavaScript library for calculating fuel moisture content using EMC 
 * and time-lag models for fire weather forecasting.
 * 
 * @module fuel-moisture-calculator
 */

'use strict';

/**
 * Computes Equilibrium Moisture Content (EMC) based on temperature and relative humidity.
 * Uses an empirical approximation commonly used in fire weather tools.
 * 
 * @param {number} tempF - Temperature in Fahrenheit
 * @param {number} rh - Relative humidity (0-100%)
 * @returns {number} - Equilibrium moisture content as a percentage (1 decimal place)
 * @throws {TypeError} - If inputs are not finite numbers
 */
function computeEMC(tempF, rh) {
    const T = Number(tempF);
    const RH = Math.max(0, Math.min(100, Number(rh)));
    
    if (!isFinite(T) || !isFinite(RH)) {
        throw new TypeError('Temperature and humidity must be finite numbers');
    }
    
    // Empirical EMC formula used in fire weather (simplified approximation)
    // Based on the relationship between temperature, humidity, and fuel moisture
    const emc = 0.03229 + 0.281073 * RH - 0.000578 * RH * T;
    
    return Math.max(0, Math.round(emc * 10) / 10);
}

/**
 * Calculate new fuel moisture using exponential time-lag model.
 * Models the drying or wetting of fuel over time toward equilibrium.
 * 
 * @param {number} initial - Current fuel moisture (%)
 * @param {number} emc - Equilibrium moisture content (%)
 * @param {number} hours - Time period in hours
 * @param {number} timeLag - Fuel time lag constant in hours (1, 10, 100, etc.)
 * @returns {number} - New fuel moisture content (%) with 1 decimal place
 * @throws {TypeError} - If inputs are not finite numbers
 */
function stepMoisture(initial, emc, hours, timeLag) {
    const M0 = Number(initial);
    const Me = Number(emc);
    const t = Number(hours);
    const tau = Number(timeLag);
    
    if (!isFinite(M0) || !isFinite(Me) || !isFinite(t) || !isFinite(tau)) {
        throw new TypeError('All parameters must be finite numbers');
    }
    
    if (tau <= 0) {
        throw new TypeError('Time lag must be positive');
    }
    
    // Exponential decay/wetting model: M(t) = Me + (M0 - Me) * e^(-t/tau)
    const moisture = Me + (M0 - Me) * Math.exp(-t / tau);
    
    return Math.round(moisture * 10) / 10;
}

/**
 * Convert Celsius to Fahrenheit
 * @param {number} celsius - Temperature in Celsius
 * @returns {number} - Temperature in Fahrenheit
 * @throws {TypeError} - If input is not a finite number
 */
function celsiusToFahrenheit(celsius) {
    const c = Number(celsius);
    if (!isFinite(c)) {
        throw new TypeError('Temperature must be a finite number');
    }
    return c * 9/5 + 32;
}

/**
 * Convert Fahrenheit to Celsius
 * @param {number} fahrenheit - Temperature in Fahrenheit
 * @returns {number} - Temperature in Celsius
 * @throws {TypeError} - If input is not a finite number
 */
function fahrenheitToCelsius(fahrenheit) {
    const f = Number(fahrenheit);
    if (!isFinite(f)) {
        throw new TypeError('Temperature must be a finite number');
    }
    return (f - 32) * 5/9;
}

/**
 * Run a multi-day forecast model for fuel moisture.
 * Processes forecast data and tracks 1-hour and 10-hour fuel moisture.
 * 
 * @param {number} initial1hr - Initial 1-hour fuel moisture (%)
 * @param {number} initial10hr - Initial 10-hour fuel moisture (%)
 * @param {Array<Object>} forecastEntries - Array of forecast periods
 * @param {string} [forecastEntries[].label] - Optional label for the period (e.g., "Monday")
 * @param {number} forecastEntries[].temp - Temperature in Fahrenheit
 * @param {number} forecastEntries[].rh - Relative humidity (%)
 * @param {number} forecastEntries[].hours - Duration in hours
 * @param {number} [forecastEntries[].wind] - Optional wind speed (preserved in output)
 * @returns {Object} - Results object with daily moisture values and summary
 * @throws {TypeError} - If inputs are invalid
 */
function runModel(initial1hr, initial10hr, forecastEntries) {
    const m1 = Number(initial1hr);
    const m10 = Number(initial10hr);
    
    if (!isFinite(m1) || !isFinite(m10)) {
        throw new TypeError('Initial moisture values must be finite numbers');
    }
    
    if (!Array.isArray(forecastEntries) || forecastEntries.length === 0) {
        throw new TypeError('Forecast entries must be a non-empty array');
    }
    
    let moisture1Hr = m1;
    let moisture10Hr = m10;
    const dailyResults = [];
    let firstCritical1HrDay = null;
    let firstCritical10HrDay = null;
    
    forecastEntries.forEach((entry, index) => {
        const temp = Number(entry.temp);
        const rh = Number(entry.rh);
        const hours = Number(entry.hours);
        
        if (!isFinite(temp) || !isFinite(rh) || !isFinite(hours)) {
            throw new TypeError(`Forecast entry ${index} has invalid values`);
        }
        
        const emc = computeEMC(temp, rh);
        moisture1Hr = stepMoisture(moisture1Hr, emc, hours, 1);
        moisture10Hr = stepMoisture(moisture10Hr, emc, hours, 10);
        
        const dayLabel = entry.label || `Day ${index + 1}`;
        
        // Check for critical moisture (≤6%)
        if (firstCritical1HrDay === null && moisture1Hr <= 6) {
            firstCritical1HrDay = dayLabel;
        }
        if (firstCritical10HrDay === null && moisture10Hr <= 6) {
            firstCritical10HrDay = dayLabel;
        }
        
        const result = {
            day: dayLabel,
            temp: temp,
            rh: rh,
            emc: emc,
            moisture1Hr: moisture1Hr,
            moisture10Hr: moisture10Hr
        };
        
        // Preserve wind if provided
        if (entry.wind !== undefined) {
            result.wind = entry.wind;
        }
        
        dailyResults.push(result);
    });
    
    return {
        initial1hr: m1,
        initial10hr: m10,
        dailyResults: dailyResults,
        summary: {
            firstCritical1HrDay: firstCritical1HrDay,
            firstCritical10HrDay: firstCritical10HrDay,
            final1Hr: moisture1Hr,
            final10Hr: moisture10Hr
        }
    };
}

/**
 * Computes moisture content based on temperature and relative humidity.
 * @param {Object} input - The input object containing temperature and humidity.
 * @param {number} input.temperature - The temperature in Fahrenheit.
 * @param {number} input.humidity - The relative humidity in percentage.
 * @returns {number} - The calculated moisture content.
 * @throws {Error} - If input is invalid.
 */
const calculateMoisture = (input) => {
    if (!input || typeof input.temperature !== 'number' || typeof input.humidity !== 'number') {
        throw new Error('Invalid input for calculateMoisture');
    }
    return (input.humidity - input.temperature * 0.1).toFixed(2);
};

// Ensure other utility functions are tested as well.
const someOtherFunction = () => {
    return true;
};

// Export all functions
module.exports = { 
    computeEMC,
    stepMoisture,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    runModel,
    calculateMoisture, 
    someOtherFunction 
};