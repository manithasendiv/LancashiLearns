import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../app.js";

test("POST /api/execute rejects empty payload", async () => {
  const res = await request(app).post("/api/execute").send({});

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.body.error,
    "Language and sourceCode are required."
  );
});

test("POST /api/execute rejects unsupported language", async () => {
  const res = await request(app).post("/api/execute").send({
    language: "python",
    sourceCode: "print('hello')",
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "Unsupported language.");
});

test("POST /api/execute accepts valid payload", async () => {
  const res = await request(app).post("/api/execute").send({
    language: "javascript",
    sourceCode: "console.log('Hello');",
  });

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
});