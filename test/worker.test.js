import { test } from "node:test";
import assert from "node:assert/strict";
import worker from "../src/index.js";

const env = { JARVIS_PROVISIONING_SECRET: "test-secret" };
const ctx = {};

test("health endpoint reports service status honestly", async () => {
  const res = await worker.fetch(new Request("https://example.test/health"), env, ctx);
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.equal(data.service, "jarvis-puter-provisioner");
  assert.equal(data.accountProvisioning, "not_supported_by_verified_public_api");
});

test("provision endpoint rejects missing credentials", async () => {
  const req = new Request("https://example.test/v1/provision", { method: "POST", body: JSON.stringify({ userId: "u1" }) });
  const res = await worker.fetch(req, env, ctx);
  assert.equal(res.status, 401);
});

test("provision endpoint never claims unsupported account creation", async () => {
  const req = new Request("https://example.test/v1/provision", {
    method: "POST",
    headers: { authorization: "Bearer test-secret", "content-type": "application/json" },
    body: JSON.stringify({ userId: "supabase-user-123" })
  });
  const res = await worker.fetch(req, env, ctx);
  assert.equal(res.status, 501);
  const data = await res.json();
  assert.equal(data.accountCreated, false);
});
