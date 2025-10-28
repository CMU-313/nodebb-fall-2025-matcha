import http from "k6/http";
import { check, sleep } from "k6";

// Smoke test configuration - minimal load to verify basic functionality
export const options = {
  vus: 1, // 1 virtual user
  duration: "30s", // Run for 30 seconds
  thresholds: {
    http_req_duration: ["p(99) < 2000"], // 99% of requests should be below 2s
    http_req_failed: ["rate<0.01"], // Less than 1% of requests should fail
  },
};

const BASE_URL = "http://localhost:4567";

export default function () {
  // Test homepage
  const homepageRes = http.get(BASE_URL);
  check(homepageRes, {
    "homepage status is 200": (r) => r.status === 200,
  });

  sleep(1);

  // Test API endpoint
  const apiRes = http.get(`${BASE_URL}/api/recent`);
  check(apiRes, {
    "API status is 200": (r) => r.status === 200,
    "API returns JSON": (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
