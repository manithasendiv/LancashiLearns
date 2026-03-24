import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";

const BASE_URL = "http://localhost:5000";

test("POST /api/execute returns 400 for missing language and sourceCode", async () => {
  try {
    await axios.post(`${BASE_URL}/api/execute`, {});
    assert.fail("Request should have failed with status 400");
  } catch (error) {
    assert.equal(error.response.status, 400);
    assert.match(error.response.data.error, /required/i);
  }
});