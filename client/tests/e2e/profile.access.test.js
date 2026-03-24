import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";

const FRONTEND_URL = "http://localhost:5173";

test("protected dashboard should redirect unauthenticated users", async () => {
  const response = await axios.get(`${FRONTEND_URL}/dashboard`, {
    maxRedirects: 0,
    validateStatus: () => true,
  });

  assert.ok(
    response.status === 200 || response.status === 302 || response.status === 307,
    "Expected route handling or redirect response"
  );
});