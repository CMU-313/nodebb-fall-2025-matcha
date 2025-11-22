import http from "k6/http";
import { check, sleep } from "k6";
import { Rate } from "k6/metrics";

// Custom metrics
const errorRate = new Rate("errors");

// Test configuration
export const options = {
  thresholds: {
    // Assert that 99% of requests finish within 3000ms
    http_req_duration: ["p(99) < 3000"],
    // Assert that 95% of requests finish within 1000ms
    "http_req_duration{type:homepage}": ["p(95) < 1000"],
    "http_req_duration{type:api}": ["p(95) < 800"],
    // Error rate should be less than 1%
    errors: ["rate<0.01"],
    // 95% of requests should return status 200
    checks: ["rate>0.95"],
  },
  // Ramp the number of virtual users up and down
  stages: [
    { duration: "30s", target: 10 }, // Ramp up to 10 users
    { duration: "1m", target: 10 },  // Stay at 10 users for 1 minute
    { duration: "30s", target: 20 }, // Ramp up to 20 users
    { duration: "1m", target: 20 },  // Stay at 20 users for 1 minute
    { duration: "20s", target: 0 },  // Ramp down to 0 users
  ],
};

const BASE_URL = "http://localhost:4567";

// Simulated user behavior
export default function () {
  // Test 1: Load homepage
  let homepageRes = http.get(BASE_URL, {
    tags: { type: "homepage" },
  });

  let homepageSuccess = check(homepageRes, {
    "homepage status is 200": (r) => r.status === 200,
    "homepage contains NodeBB": (r) => r.body.includes("NodeBB"),
  });

  errorRate.add(!homepageSuccess);
  sleep(1);

  // Test 2: Load recent topics API
  let recentRes = http.get(`${BASE_URL}/api/recent`, {
    tags: { type: "api" },
  });

  let recentSuccess = check(recentRes, {
    "recent API status is 200": (r) => r.status === 200,
    "recent API returns JSON": (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.topics !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!recentSuccess);
  sleep(1);

  // Test 3: Load categories
  let categoriesRes = http.get(`${BASE_URL}/api/categories`, {
    tags: { type: "api" },
  });

  let categoriesSuccess = check(categoriesRes, {
    "categories API status is 200": (r) => r.status === 200,
    "categories API returns JSON": (r) => {
      try {
        const data = JSON.parse(r.body);
        return data.categories !== undefined;
      } catch {
        return false;
      }
    },
  });

  errorRate.add(!categoriesSuccess);
  sleep(1);

  // Test 4: Load popular topics API
  let popularRes = http.get(`${BASE_URL}/api/popular`, {
    tags: { type: "api" },
  });

  let popularSuccess = check(popularRes, {
    "popular API status is 200": (r) => r.status === 200,
    "popular API response is valid": (r) => r.status === 200,
  });

  errorRate.add(!popularSuccess);
  sleep(2);
}
