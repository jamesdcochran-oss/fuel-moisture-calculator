# Contributing to Fuel Moisture Calculator

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Code of Conduct

Be respectful and constructive in all interactions.

## How to Contribute

### Reporting Bugs

Open an issue with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Browser/Node.js version

### Suggesting Enhancements

Open an issue describing:
- The enhancement and its use case
- Why it would be useful
- Example code if applicable

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the guidelines below
4. Test thoroughly (see Testing section)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Coding Guidelines

### Defensive Programming

All code must follow defensive programming practices:

✅ **DO:**
- Validate and convert inputs using `Number()` with proper checks
- Validate ranges (e.g., RH 0-100)
- Handle null/undefined/NaN gracefully
- Provide sensible defaults
- Preserve valid zero values
- Add guards against division by zero
- Use `isFinite()` to check for valid numbers

❌ **DON'T:**
- Use `Number(value || default)` (loses zero values)
- Assume inputs are valid
- Allow NaN to propagate
- Break the public API

### Example: Good Input Handling

```javascript
// Good - preserves zeros, handles invalid inputs
function computeEMC(tempF, rh) {
  const T = Number(tempF);
  const RH = Math.max(0, Math.min(100, Number(rh)));
  
  if (!isFinite(T) || !isFinite(RH)) {
    throw new TypeError('Temperature and humidity must be finite numbers');
  }
  
  // ... calculation
}

// Bad - loses zero values, produces NaN
function bad(value, fallback) {
  return Number(value || fallback);
}
```

### Code Style

- Use strict mode
- Prefer `const` over `let`
- Use descriptive variable names
- Add comments for complex logic
- Keep functions focused and small

### Public API

**Never break the public API:**
- `computeEMC(tempF, rh)`
- `stepMoisture(initial, emc, hours, timeLag)`
- `runModel(initial1hr, initial10hr, forecastEntries)`
- `celsiusToFahrenheit(celsius)`
- `fahrenheitToCelsius(fahrenheit)`

All functions are used by external projects and must remain compatible.

### Browser Compatibility

Maintain compatibility with:
- Modern browsers (ES6+)
- Node.js (v12+)
- Deno
- Bun
- Non-browser environments

Check for `document` and `window` before DOM operations:
```javascript
if (typeof document !== 'undefined') {
  // DOM code
}
```

## Testing

### Automated Tests

Run the full test suite:

```bash
npm test
```

This runs 51 comprehensive tests covering:
- Core EMC calculations
- Time-lag drying model
- Multi-day forecast model
- Input validation
- Edge cases
- Temperature conversions

### Node.js Examples

```bash
node examples/node-example.js
```

All examples should run without errors.

### Manual Testing

Test these scenarios:
- Empty/invalid inputs → errors thrown or handled
- Zero values → preserved (not replaced)
- String inputs → converted to numbers
- Out-of-range values → clamped or rejected
- NaN inputs → error thrown
- Multi-day forecasts → correct progression
- Critical detection → works at threshold (≤6%)

## Documentation

- Update README.md for new features
- Add examples for new functionality
- Document parameters and return values
- Include edge cases in examples
- Update CHANGELOG.md

## Commit Messages

Use clear, descriptive commit messages:

- `feat: add feature description`
- `fix: fix bug description`
- `docs: update documentation`
- `test: add test for X`
- `refactor: improve code without changing behavior`

## Questions?

Open an issue or discussion if you need help!
