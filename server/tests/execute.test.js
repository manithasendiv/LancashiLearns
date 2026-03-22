import test from "node:test";
import assert from "node:assert/strict";
import request from "supertest";
import app from "../index.js";
import axios from "axios";

test("POST /api/execute rejects empty payload", async () => {
  const res = await request(app).post("/api/execute").send({});

  assert.equal(res.statusCode, 400);
  assert.equal(
    res.body.error,
    "Language and source code are required."
  );
});

test("POST /api/execute rejects unsupported language", async () => {
  const res = await request(app).post("/api/execute").send({
    language: "python",
    sourceCode: "print('hello')",
  });

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, "Unsupported language selected.");
});

test("POST /api/execute accepts valid payload", async () => {
  const originalPost = axios.post;

  axios.post = async () => ({
    data: {
      stdout: "Hello\n",
    },
  });

  try {
    const res = await request(app).post("/api/execute").send({
      language: "javascript",
      sourceCode: "console.log('Hello');",
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.output, "Hello\n");
  } finally {
    axios.post = originalPost;
  }
});