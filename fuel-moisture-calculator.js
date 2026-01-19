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
    let RH = Number(rh);
    
    if (!isFinite(T) || !isFinite(RH)) {
        throw new TypeError('Temperature and humidity must be finite numbers');
    }
    
    // Clamp RH to valid range after checking for finiteness
    RH = Math.max(0, Math.min(100, RH));
    
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
    return Number((input.humidity - input.temperature * 0.1).toFixed(2));
};

// Ensure other utility functions are tested as well.
const someOtherFunction = () => {
    return true;
};

/**
 * Interpolates missing weather data using linear interpolation.
 * If data is missing, interpolates between neighboring valid values.
 * 
 * @param {Array<Object>} weatherData - Array of weather data points
 * @param {number} weatherData[].temp - Temperature (may be null/undefined)
 * @param {number} weatherData[].rh - Relative humidity (may be null/undefined)
 * @returns {Array<Object>} - Weather data with interpolated values
 */
function interpolateWeatherData(weatherData) {
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
        return weatherData;
    }
    
    const result = weatherData.map(d => ({ ...d }));
    
    // Interpolate temperature
    interpolateField(result, 'temp');
    
    // Interpolate relative humidity
    interpolateField(result, 'rh');
    
    return result;
}

/**
 * Helper function to interpolate a specific field in weather data array
 * @private
 */
function interpolateField(data, field) {
    for (let i = 0; i < data.length; i++) {
        if (data[i][field] === null || data[i][field] === undefined || !isFinite(Number(data[i][field]))) {
            // Find previous valid value
            let prevIdx = i - 1;
            while (prevIdx >= 0 && (data[prevIdx][field] === null || data[prevIdx][field] === undefined || !isFinite(Number(data[prevIdx][field])))) {
                prevIdx--;
            }
            
            // Find next valid value
            let nextIdx = i + 1;
            while (nextIdx < data.length && (data[nextIdx][field] === null || data[nextIdx][field] === undefined || !isFinite(Number(data[nextIdx][field])))) {
                nextIdx++;
            }
            
            // Interpolate
            if (prevIdx >= 0 && nextIdx < data.length) {
                const weight = (i - prevIdx) / (nextIdx - prevIdx);
                data[i][field] = data[prevIdx][field] + weight * (data[nextIdx][field] - data[prevIdx][field]);
            } else if (prevIdx >= 0) {
                data[i][field] = data[prevIdx][field];
            } else if (nextIdx < data.length) {
                data[i][field] = data[nextIdx][field];
            }
        }
    }
}

/**
 * Predicts drying trends over an extended period based on weather simulations and historical data.
 * Uses exponential decay model for moisture changes and predicts when fuel moisture drops below critical levels.
 * 
 * @param {Object} params - Configuration parameters
 * @param {number} params.currentMoisture - Starting fuel moisture as a percentage
 * @param {Array<Object>} params.historicalWeather - Temperature and humidity for past 7 days (or more)
 * @param {number} params.historicalWeather[].temp - Temperature in Fahrenheit
 * @param {number} params.historicalWeather[].rh - Relative humidity (%)
 * @param {number} [params.historicalWeather[].wind] - Optional wind speed (mph)
 * @param {string} [params.historicalWeather[].timestamp] - Optional timestamp/label
 * @param {Array<Object>} params.predictedWeather - Forecasted temperature and humidity for next 7 days (or more)
 * @param {number} params.predictedWeather[].temp - Temperature in Fahrenheit
 * @param {number} params.predictedWeather[].rh - Relative humidity (%)
 * @param {number} [params.predictedWeather[].wind] - Optional wind speed (mph)
 * @param {string} [params.predictedWeather[].timestamp] - Optional timestamp/label
 * @param {number} params.timeLag - Time lag class in hours (1, 10, 100, etc.)
 * @param {Object} [options] - Additional options
 * @param {string} [options.resolution='daily'] - 'hourly' or 'daily' output resolution
 * @param {boolean} [options.interpolateMissing=true] - Interpolate missing historical data
 * @param {number} [options.criticalThreshold=6] - Critical moisture threshold (%)
 * @returns {Object} - Drying trend prediction results
 * @throws {TypeError} - If inputs are invalid
 */
function predictDryingTrend(params, options = {}) {
    // Validate required parameters
    if (!params || typeof params !== 'object') {
        throw new TypeError('Parameters object is required');
    }
    
    const currentMoisture = Number(params.currentMoisture);
    if (!isFinite(currentMoisture) || currentMoisture < 0 || currentMoisture > 100) {
        throw new TypeError('Current moisture must be a number between 0 and 100');
    }
    
    if (!Array.isArray(params.historicalWeather) || params.historicalWeather.length === 0) {
        throw new TypeError('Historical weather must be a non-empty array');
    }
    
    if (!Array.isArray(params.predictedWeather) || params.predictedWeather.length === 0) {
        throw new TypeError('Predicted weather must be a non-empty array');
    }
    
    const timeLag = Number(params.timeLag);
    if (!isFinite(timeLag) || timeLag <= 0) {
        throw new TypeError('Time lag must be a positive number');
    }
    
    // Default options
    const resolution = options.resolution || 'daily';
    const interpolateMissing = options.interpolateMissing !== false;
    const criticalThreshold = options.criticalThreshold || 6;
    
    // Interpolate missing data if requested
    const historical = interpolateMissing ? 
        interpolateWeatherData(params.historicalWeather) : 
        params.historicalWeather;
    const predicted = interpolateMissing ? 
        interpolateWeatherData(params.predictedWeather) : 
        params.predictedWeather;
    
    // Calculate initial moisture based on historical data
    let moisture = currentMoisture;
    const historicalResults = [];
    
    // Process historical data to establish trend
    historical.forEach((entry, index) => {
        const temp = Number(entry.temp);
        const rh = Number(entry.rh);
        
        if (!isFinite(temp) || !isFinite(rh)) {
            throw new TypeError(`Historical weather entry ${index} has invalid values`);
        }
        
        const emc = computeEMC(temp, rh);
        const hours = resolution === 'hourly' ? 1 : 24;
        
        // Apply wind effect if provided (simplified model: higher wind increases drying rate)
        let effectiveTimeLag = timeLag;
        if (entry.wind !== undefined && entry.wind > 0) {
            // Wind reduces effective time lag (faster drying)
            // Simplified: 10 mph wind reduces time lag by ~20%
            const windFactor = 1 - (Math.min(entry.wind, 30) / 30) * 0.2;
            effectiveTimeLag = timeLag * windFactor;
        }
        
        moisture = stepMoisture(moisture, emc, hours, effectiveTimeLag);
        
        historicalResults.push({
            period: entry.timestamp || `Historical Day ${index + 1}`,
            temp: temp,
            rh: rh,
            wind: entry.wind,
            emc: emc,
            moisture: moisture,
            type: 'historical'
        });
    });
    
    // Process predicted data to forecast future moisture
    const forecastResults = [];
    let criticalTime = null;
    
    predicted.forEach((entry, index) => {
        const temp = Number(entry.temp);
        const rh = Number(entry.rh);
        
        if (!isFinite(temp) || !isFinite(rh)) {
            throw new TypeError(`Predicted weather entry ${index} has invalid values`);
        }
        
        const emc = computeEMC(temp, rh);
        const hours = resolution === 'hourly' ? 1 : 24;
        
        // Apply wind effect if provided
        let effectiveTimeLag = timeLag;
        if (entry.wind !== undefined && entry.wind > 0) {
            const windFactor = 1 - (Math.min(entry.wind, 30) / 30) * 0.2;
            effectiveTimeLag = timeLag * windFactor;
        }
        
        moisture = stepMoisture(moisture, emc, hours, effectiveTimeLag);
        
        // Check for critical threshold
        if (criticalTime === null && moisture <= criticalThreshold) {
            criticalTime = entry.timestamp || `Forecast Day ${index + 1}`;
        }
        
        forecastResults.push({
            period: entry.timestamp || `Forecast Day ${index + 1}`,
            temp: temp,
            rh: rh,
            wind: entry.wind,
            emc: emc,
            moisture: moisture,
            type: 'forecast'
        });
    });
    
    // Combine results
    const allResults = [...historicalResults, ...forecastResults];
    
    return {
        metadata: {
            initialMoisture: currentMoisture,
            timeLag: timeLag,
            resolution: resolution,
            criticalThreshold: criticalThreshold,
            historicalPeriods: historical.length,
            forecastPeriods: predicted.length
        },
        trend: allResults,
        summary: {
            startingMoisture: currentMoisture,
            endingMoisture: moisture,
            moistureChange: Math.round((moisture - currentMoisture) * 10) / 10,
            criticalTime: criticalTime,
            belowCritical: moisture <= criticalThreshold,
            minMoisture: Math.min(...allResults.map(r => r.moisture)),
            maxMoisture: Math.max(...allResults.map(r => r.moisture))
        }
    };
}

// Export all functions
module.exports = { 
    computeEMC,
    stepMoisture,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    runModel,
    predictDryingTrend,
    interpolateWeatherData,
    calculateMoisture, 
    someOtherFunction 
};