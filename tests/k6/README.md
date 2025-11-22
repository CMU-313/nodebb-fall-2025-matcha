# k6 Load Tests for NodeBB

This directory contains k6 load testing scripts for the NodeBB forum application.

## Prerequisites

- k6 installed (see root `.devcontainer/Dockerfile` for installation)
- NodeBB server running on `http://localhost:4567`

## Test Scripts

### 1. Smoke Test (`smoke-test.js`)
Quick test to verify basic functionality with minimal load.

**Configuration:**
- 1 virtual user
- 30 second duration
- Tests homepage and API endpoints

**Run:**
```bash
k6 run tests/k6/smoke-test.js
```

### 2. Basic Load Test (`basic-load-test.js`)
Comprehensive load test that simulates realistic user behavior.

**Configuration:**
- Ramps from 0 to 20 virtual users
- 3 minute 20 second total duration
- Tests multiple endpoints (homepage, recent topics, categories, popular)
- Custom thresholds for performance validation

**Run:**
```bash
k6 run tests/k6/basic-load-test.js
```

## Understanding Results

k6 will display metrics including:
- `http_req_duration`: Response time for requests
- `http_req_failed`: Percentage of failed requests
- `checks`: Percentage of successful checks
- `errors`: Custom error rate metric (in basic-load-test.js)

### Performance Thresholds

**Smoke Test:**
- 99% of requests should complete in under 2 seconds
- Less than 1% failure rate

**Basic Load Test:**
- 99% of requests should complete in under 3 seconds
- Homepage: 95% under 1 second
- API calls: 95% under 800ms
- Error rate: Less than 1%
- Success rate: Greater than 95%

## Adding New Tests

To create new test scripts:
1. Import required modules from k6
2. Define `options` object with test configuration
3. Implement `default function()` with test logic
4. Use `check()` to validate responses
5. Add appropriate `sleep()` calls to simulate user think time

See [k6 documentation](https://k6.io/docs/) for more information.
