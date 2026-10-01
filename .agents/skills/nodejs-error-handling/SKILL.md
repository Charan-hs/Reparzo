---
name: nodejs-error-handling
description: >-
  Expert guide and implementation patterns for Node.js backend error handling.
  Use when designing or implementing error handling strategies, custom error classes,
  centralized Express/API error-handling middleware, graceful shutdown procedures,
  exponential backoff retry mechanisms, or concurrent AggregateError handling in Node.js services.
---

# Error Handling — Node.js Patterns

You are an expert in Node.js error handling strategies for building robust, debuggable applications that fail gracefully.

## Core Philosophy

### Overview

Node.js has multiple error propagation mechanisms — synchronous throws, error-first callbacks, rejected promises, EventEmitter `'error'` events, and process-level handlers. A solid error handling strategy must address all of them consistently. The goal is to distinguish operational errors (expected failures like network timeouts) from programmer errors (bugs like null dereferences), handle the former gracefully, and surface the latter loudly.

## Core Concepts

### Operational vs Programmer Errors

- **Operational errors** — runtime problems in correctly written code: connection refused, file not found, request timeout. These must be caught and handled.
- **Programmer errors** — bugs: typos in property names, passing a string where a number is expected, forgetting to `await`. These should crash the process (in development) or trigger alerts (in production).

### Error Propagation Channels

1. `throw` / `try-catch` — synchronous code and `async` functions
2. `Promise.reject` / `.catch()` — promise chains
3. Error-first callbacks — `(err, result) => {}`
4. EventEmitter `'error'` event — streams, servers, sockets
5. `process.on('uncaughtException')` / `process.on('unhandledRejection')` — last resort

### Error Classes

Custom error classes encode machine-readable error types, HTTP status codes, and metadata that generic `Error` objects lack.

## Implementation Patterns

### Custom error hierarchy

```javascript
class AppError extends Error {
  constructor(message, { code, statusCode = 500, cause } = {}) {
    super(message, { cause });
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  get isOperational() {
    return true;
  }
}

class NotFoundError extends AppError {
  constructor(resource, id) {
    super(`${resource} with id ${id} not found`, {
      code: 'NOT_FOUND',
      statusCode: 404,
    });
  }
}

class ValidationError extends AppError {
  constructor(details) {
    super('Validation failed', {
      code: 'VALIDATION_ERROR',
      statusCode: 400,
    });
    this.details = details;
  }
}
```

### Express-style centralized error handler

```javascript
// Error-handling middleware (four arguments)
function errorHandler(err, req, res, next) {
  // Log all errors
  req.log.error({ err, requestId: req.id }, err.message);

  // Operational errors: send structured response
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // Programmer errors: generic 500, do not leak internals
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong' },
  });
}

// Async route wrapper
function asyncRoute(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

app.get('/users/:id', asyncRoute(async (req, res) => {
  const user = await userService.findById(req.params.id);
  if (!user) throw new NotFoundError('User', req.params.id);
  res.json(user);
}));

app.use(errorHandler);
```

### Graceful shutdown on fatal errors

```javascript
const server = app.listen(3000);

function gracefulShutdown(reason) {
  console.error('Initiating graceful shutdown:', reason);

  server.close(() => {
    // Close database connections, flush logs, etc.
    db.end().then(() => process.exit(1));
  });

  // Force exit if graceful shutdown takes too long
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  gracefulShutdown(err.message);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
  gracefulShutdown(String(reason));
});
```

### Retry with exponential backoff

```javascript
async function withRetry(fn, { retries = 3, baseDelay = 200, shouldRetry } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn(attempt);
    } catch (err) {
      lastError = err;
      if (attempt === retries) break;
      if (shouldRetry && !shouldRetry(err)) break;

      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 100;
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastError;
}

// Usage
const data = await withRetry(() => fetch(url).then((r) => r.json()), {
  retries: 3,
  shouldRetry: (err) => err.code === 'ECONNRESET' || err.status === 503,
});
```

### Using AggregateError for concurrent operations

```javascript
async function fetchAll(urls) {
  const results = await Promise.allSettled(urls.map((u) => fetch(u)));
  const errors = [];
  const values = [];

  for (const [i, result] of results.entries()) {
    if (result.status === 'fulfilled') {
      values.push(result.value);
    } else {
      errors.push(new Error(`Failed to fetch ${urls[i]}`, { cause: result.reason }));
    }
  }

  if (errors.length > 0 && values.length === 0) {
    throw new AggregateError(errors, 'All fetches failed');
  }

  return { values, errors };
}
```

## Best Practices

- Distinguish operational from programmer errors and handle them differently — recover from the former, crash or alert on the latter.
- Use `Error.cause` (ES2022) to chain errors so stack traces preserve the full failure path.
- Always set a meaningful `error.code` string for programmatic matching; do not match on `error.message` text.
- Use `Promise.allSettled()` instead of `Promise.all()` when partial success is acceptable.
- Log errors with structured metadata (request ID, user ID, operation name) rather than just the message string.

## Common Pitfalls

- **Catching errors and doing nothing** — `catch (e) {}` silently swallows failures and makes debugging nearly impossible.
- **Throwing strings** — `throw 'something broke'` produces no stack trace. Always throw `Error` instances.
- **Crashing on operational errors** — a network timeout should not bring down the server; handle it and respond with an appropriate status.
- **Returning errors instead of throwing** — mixing `return new Error(...)` and `throw new Error(...)` confuses callers and breaks control flow expectations.
- **Not cleaning up resources on error** — use `try/finally`, `AbortController`, or `using` declarations (Node.js 22+) to ensure file handles, connections, and timers are released.

## Anti-Patterns

- **Over-engineering for hypothetical scale.** Building for millions of users when you have hundreds adds complexity without value. Solve today's problems first.
- **Ignoring the existing ecosystem.** Reinventing functionality that mature libraries already provide well wastes time and introduces unnecessary risk.
- **Premature abstraction.** Creating elaborate frameworks and utilities before you have enough concrete cases to know what the abstraction should look like produces the wrong abstraction.
- **Neglecting error handling at boundaries.** Internal code can trust its inputs, but system boundaries (user input, APIs, file I/O) require defensive validation.
- **Skipping documentation for obvious code.** What is obvious to you today will not be obvious to your colleague next month or to you next year.
