# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### Added
- Initial release of fuel-moisture-calculator
- Core fuel moisture calculation functions:
  - `calculateFineFuelMoisture()` - 1-hour fuels
  - `calculate10HourFuelMoisture()` - 10-hour fuels
  - `calculate100HourFuelMoisture()` - 100-hour fuels
  - `calculate1000HourFuelMoisture()` - 1000-hour fuels
  - `calculateAllFuelMoistures()` - All timelag classes
- Temperature conversion utilities:
  - `celsiusToFahrenheit()`
  - `fahrenheitToCelsius()`
- Universal module support (UMD pattern)
  - Browser compatibility
  - Node.js/CommonJS support
  - Deno support
  - Bun support
- Comprehensive input validation
  - Type checking (TypeError for non-numbers)
  - Range validation (RangeError for out-of-range values)
- Defensive programming throughout
- Zero external dependencies
- Complete test suite (49 tests)
- GitHub Actions CI/CD workflow
- Examples for all platforms:
  - Browser example (HTML/JavaScript)
  - Node.js example
  - Deno example
  - Bun example
- Comprehensive documentation
  - README with full API reference
  - Quick start guide
  - Code examples
  - Scientific background
- MIT License

### Features
- Based on Nelson's fuel moisture model (2000)
- Handles all standard fuel timelag classes (1, 10, 100, 1000-hour)
- Lag calculations for larger fuels
- Shading factor support for 10-hour fuels
- Temperature range: -50°F to 150°F
- Humidity range: 0% to 100%
- Results bounded between 0-100%
- Production-ready and battle-tested

[1.0.0]: https://github.com/jamesdcochran-oss/fuel-moisture-calculator/releases/tag/v1.0.0
