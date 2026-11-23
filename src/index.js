const json = (data, status = 200) => new Response(JSON.stringify(data, null, 2), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" }
});

function constantTimeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        "access-control-allow-methods": "GET, POST, OPTIONS",
        "access-control-allow-headers": "authorization, content-type",
        "access-control-max-age": "86400"
      }});
    }

    if (url.pathname === "/health" && request.method === "GET") {
      return json({ service: "jarvis-puter-provisioner", status: "online", provider: "puter", accountProvisioning: "not_supported_by_verified_public_api" });
    }

    if (url.pathname === "/v1/provision" && request.method === "POST") {
      const supplied = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
      if (!env.JARVIS_PROVISIONING_SECRET || !constantTimeEqual(supplied, env.JARVIS_PROVISIONING_SECRET)) {
        return json({ error: "unauthorized" }, 401);
      }

      let body;
      try { body = await request.json(); } catch { return json({ error: "invalid_json" }, 400); }
      const userId = typeof body.userId === "string" ? body.userId.trim() : "";
      if (!userId || userId.length > 200) return json({ error: "valid_userId_required" }, 400);

      // Puter currently exposes browser sign-in/temporary-user flows, but no verified
      // public server API for silently creating a permanent account from a JARVIS identity.
      // Deliberately do not automate private endpoints, reuse a shared account, or fake success.
      return json({
        status: "blocked_pending_official_puter_provisioning_api",
        userId,
        accountCreated: false,
        message: "Puter does not currently document a supported server-side API for silent permanent account creation. No account was created."
      }, 501);
    }

    if (url.pathname === "/v1/status" && request.method === "GET") {
      const supplied = (request.headers.get("authorization") || "").replace(/^Bearer\s+/i, "");
      if (!env.JARVIS_PROVISIONING_SECRET || !constantTimeEqual(supplied, env.JARVIS_PROVISIONING_SECRET)) return json({ error: "unauthorized" }, 401);
      return json({ provider: "puter", provisioningReady: false, blocker: "official_server_side_account_provisioning_api_not_verified" });
    }

    return json({ error: "not_found" }, 404);
  }
};