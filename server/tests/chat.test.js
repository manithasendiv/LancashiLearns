import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../index.js";

test("POST /api/chat rejects missing message", async () => {
  const res = await request(app).post("/api/chat").send({});

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "Message is required.");
});