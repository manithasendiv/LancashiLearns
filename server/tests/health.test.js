import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("GET /api/health returns ok true", async () => {
  const res = await request(app).get("/api/health");

  assert.equal(res.statusCode, 200);
  assert.deepEqual(res.body, { ok: true });
});