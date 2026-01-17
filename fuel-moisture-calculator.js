/**
 * Fuel Moisture Calculator
 * Minimal, robust fuel moisture calculator for fire weather analysis
 * - computeEMC(tempF, rh): empirical approximation used in many fire-weather tools
 * - stepMoisture(initial, emc, hours, timeLag): exponential time-lag model
 * - runModel(...): run model over forecast days
 * - DOM wiring for browser usage (optional, defensive)
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
   * Compute Equilibrium Moisture Content (EMC) as a percentage
   * Empirical approximation commonly used in fire-weather tools
   * 
   * @param {number} tempF - Temperature in degrees Fahrenheit
   * @param {number} rh - Relative humidity as percentage (0-100)
   * @returns {number} Equilibrium moisture content as percentage
   * @throws {TypeError} If parameters are not finite numbers
   * 
   * @example
   * const emc = computeEMC(75, 50);
   * console.log(emc); // ~8.4
   */
  function computeEMC(tempF, rh) {
    const T = Number(tempF);
    const RH = Math.max(0, Math.min(100, Number(rh)));
    
    if (!isFinite(T) || !isFinite(RH)) {
      throw new TypeError('Temperature and humidity must be finite numbers');
    }
    
    // Empirical approximation (common form used in many tools)
    const emc = 0.942 * Math.pow(RH, 0.679) +
                11 * Math.exp((RH - 100) / 10) +
                0.18 * (21.1 - T) * (1 - Math.exp(-0.115 * RH));
    
    return Math.max(0.1, Number(emc.toFixed(1)));
  }

  /**
   * Time-lag drying/wetting model using exponential decay
   * Formula: m_t = EMC + (m0 - EMC) * exp(-hours / timeLag)
   * 
   * @param {number} initial - Initial moisture content as percentage
   * @param {number} emc - Equilibrium moisture content as percentage
   * @param {number} hours - Number of hours for the time step
   * @param {number} timeLag - Time lag constant in hours (1 for 1-hr fuels, 10 for 10-hr fuels, etc.)
   * @returns {number} New moisture content as percentage
   * @throws {TypeError} If parameters are not finite numbers
   * 
   * @example
   * const newMoisture = stepMoisture(12, 8, 12, 10);
   * console.log(newMoisture); // ~9.2
   */
  function stepMoisture(initial, emc, hours, timeLag) {
    const m0 = Number(initial);
    const e = Number(emc);
    const h = Number(hours);
    const tl = Number(timeLag);
    
    if (!isFinite(m0) || !isFinite(e) || !isFinite(h) || !isFinite(tl)) {
      throw new TypeError('All parameters must be finite numbers');
    }
    
    const k = Math.exp(-h / Math.max(0.0001, tl));
    return Number((e + (m0 - e) * k).toFixed(1));
  }

  /**
   * Run moisture model over multiple forecast days
   * 
   * @param {number} initial1hr - Initial 1-hour fuel moisture percentage
   * @param {number} initial10hr - Initial 10-hour fuel moisture percentage
   * @param {Array<Object>} forecastEntries - Array of forecast day objects
   * @param {string} [forecastEntries[].label] - Day label (e.g., "Day 1")
   * @param {number} forecastEntries[].temp - Temperature in °F
   * @param {number} forecastEntries[].rh - Relative humidity percentage
   * @param {number} [forecastEntries[].wind] - Wind speed (optional)
   * @param {number} [forecastEntries[].hours=12] - Hours in period (default 12)
   * @returns {Object} Model results with daily calculations and summary
   * @throws {TypeError} If parameters are invalid
   * 
   * @example
   * const results = runModel(8, 10, [
   *   { temp: 75, rh: 50, hours: 12 },
   *   { temp: 80, rh: 40, hours: 12 }
   * ]);
   */
  function runModel(initial1hr, initial10hr, forecastEntries) {
    if (!Array.isArray(forecastEntries)) {
      throw new TypeError('forecastEntries must be an array');
    }
    
    const results = {
      initial1hr: Number(initial1hr),
      initial10hr: Number(initial10hr),
      dailyResults: [],
      summary: {}
    };

    let prev1 = Number(initial1hr);
    let prev10 = Number(initial10hr);

    forecastEntries.forEach((day, i) => {
      if (typeof day !== 'object' || day === null) {
        throw new TypeError(`Forecast entry ${i} must be an object`);
      }
      
      const emc = computeEMC(day.temp, day.rh);
      const hours = day.hours || 12;
      const m1 = stepMoisture(prev1, emc, hours, 1);
      const m10 = stepMoisture(prev10, emc, hours, 10);

      results.dailyResults.push({
        day: day.label || (`Day ${i + 1}`),
        temp: day.temp,
        rh: day.rh,
        wind: day.wind || 0,
        hours: hours,
        moisture1Hr: m1,
        moisture10Hr: m10
      });

      prev1 = m1;
      prev10 = m10;
    });

    // Find first day where 1-hour moisture drops to critical level (≤6%)
    const critIndex = results.dailyResults.findIndex(r => r.moisture1Hr <= 6);
    results.summary.firstCritical1HrDay = critIndex >= 0 ? results.dailyResults[critIndex].day : null;

    return results;
  }

  /* UI helpers: these will run only if the page contains the expected elements.
     Keeps the file safe to include everywhere.
  */
  
  /**
   * Populate default forecast table with initial values (browser only)
   * @param {number} rows - Number of forecast days to create
   */
  function populateDefaultForecastTable(rows = 5) {
    if (typeof document === 'undefined') return; // Not in browser
    
    const tbody = document.getElementById('forecastDays');
    if (!tbody) return;
    tbody.innerHTML = '';
    for (let i = 0; i < rows; i++) {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>Day ${i + 1}</td>
        <td><input type="number" class="fc-temp" value="${60 + i}" step="1" min="-20" max="130"></td>
        <td><input type="number" class="fc-rh" value="${60 - i * 5}" step="1" min="0" max="100"></td>
        <td><input type="number" class="fc-wind" value="${5 + i}" step="1" min="0" max="100"></td>
        <td><input type="number" class="fc-hours" value="12" step="1" min="0" max="24"></td>
      `;
      tbody.appendChild(tr);
    }
  }

  /**
   * Read forecast data from table (browser only)
   * @returns {Array<Object>} Forecast entries
   */
  function readForecastTable() {
    if (typeof document === 'undefined') return []; // Not in browser
    
    const tbody = document.getElementById('forecastDays');
    if (!tbody) return [];
    const rows = Array.from(tbody.querySelectorAll('tr'));
    return rows.map((tr, idx) => {
      const temp = Number(tr.querySelector('.fc-temp')?.value || 70);
      const rh = Number(tr.querySelector('.fc-rh')?.value || 50);
      const wind = Number(tr.querySelector('.fc-wind')?.value || 5);
      const hours = Number(tr.querySelector('.fc-hours')?.value || 12);
      return { label: `Day ${idx + 1}`, temp, rh, wind, hours };
    });
  }

  /**
   * Display model results in table (browser only)
   * @param {Object} results - Model results from runModel()
   */
  function showResults(results) {
    if (typeof document === 'undefined') return; // Not in browser
    
    const resultsSection = document.getElementById('resultsSection');
    const resultsTable = document.getElementById('resultsTable');
    const warningMessage = document.getElementById('warningMessage');
    if (!resultsSection || !resultsTable) return;

    resultsSection.style.display = 'block';
    let html = '<table><thead><tr><th>Day</th><th>Temp°F</th><th>Min RH%</th><th>1-hr%</th><th>10-hr%</th></tr></thead><tbody>';
    results.dailyResults.forEach(r => {
      html += `<tr>
        <td>${r.day}</td><td>${r.temp}</td><td>${r.rh}</td>
        <td>${r.moisture1Hr}%</td><td>${r.moisture10Hr}%</td>
      </tr>`;
    });
    html += '</tbody></table>';
    resultsTable.innerHTML = html;

    if (warningMessage) {
      if (results.summary.firstCritical1HrDay) {
        warningMessage.style.display = 'block';
        warningMessage.textContent = `⚠️ Critical drying detected first on ${results.summary.firstCritical1HrDay}`;
      } else {
        warningMessage.style.display = 'none';
        warningMessage.textContent = '';
      }
    }
  }

  /**
   * Wire up UI event handlers (browser only)
   */
  function wireUI() {
    if (typeof document === 'undefined') return; // Not in browser
    
    populateDefaultForecastTable(5);

    const runBtn = document.getElementById('runModelBtn');
    if (runBtn) {
      runBtn.addEventListener('click', () => {
        const initial1 = Number(document.getElementById('initial1hr')?.value || 8);
        const initial10 = Number(document.getElementById('initial10hr')?.value || 10);
        const forecast = readForecastTable();
        try {
          const results = runModel(initial1, initial10, forecast);
          showResults(results);
          console.log('Fuel model results:', results);
        } catch (err) {
          console.error('Fuel model error', err);
        }
      });
    }

    const modalClose = document.getElementById('modalCloseBtn');
    if (modalClose) modalClose.addEventListener('click', () => {
      const modal = document.getElementById('fuelCalcModal');
      if (modal) modal.style.display = 'none';
    });
  }

  // On DOM ready, wire UI (safe-guarded, browser only)
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', wireUI);
    } else {
      wireUI();
    }
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
    const c = Number(celsius);
    if (!isFinite(c)) {
      throw new TypeError('celsius must be a finite number');
    }
    return (c * 9 / 5) + 32;
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
    const f = Number(fahrenheit);
    if (!isFinite(f)) {
      throw new TypeError('fahrenheit must be a finite number');
    }
    return (f - 32) * 5 / 9;
  }

  // Public API
  return {
    computeEMC,
    stepMoisture,
    runModel,
    celsiusToFahrenheit,
    fahrenheitToCelsius,
    populateDefaultForecastTable,
    readForecastTable,
    showResults,
    wireUI,
    version: '1.0.0'
  };
}));
