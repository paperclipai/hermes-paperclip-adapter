import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VALID_PROVIDERS, MODEL_PREFIX_PROVIDER_HINTS } from "../dist/shared/constants.js";
import { resolveProvider, testEnvironment } from "../dist/server/index.js";

test("includes bf16 in VALID_PROVIDERS and resolves bf16/* model prefixes", () => {
  assert.ok(VALID_PROVIDERS.includes("bf16"));
  assert.ok(
    MODEL_PREFIX_PROVIDER_HINTS.some(([prefix, provider]) => prefix === "bf16/" && provider === "bf16")
  );
  assert.deepEqual(
    resolveProvider({ model: "bf16/auto:coding" }),
    { provider: "bf16", resolvedFrom: "modelInference" }
  );
  assert.deepEqual(
    resolveProvider({ explicitProvider: "bf16", model: "zai-org/glm-5.3-uncensored" }),
    { provider: "bf16", resolvedFrom: "adapterConfig" }
  );
});

test("testEnvironment recognizes BF16_API_KEY in adapter env", async () => {
  const dir = await mkdtemp(join(tmpdir(), "hermes-bf16-test-"));
  const hermesBin = join(dir, "hermes");
  await writeFile(hermesBin, "#!/bin/sh\necho Hermes Agent 0.9.0\n", { mode: 0o755 });
  try {
    const result = await testEnvironment({
      companyId: "company-test",
      adapterType: "hermes_local",
      config: {
        hermesCommand: hermesBin,
        model: "bf16/auto:coding",
        provider: "bf16",
        env: { BF16_API_KEY: "sk-bf16-test" },
      },
      deploymentMode: "local_trusted",
    });
    const keyCheck = result.checks.find((c) => c.code === "hermes_api_keys_found");
    assert.ok(keyCheck, `expected hermes_api_keys_found check, got: ${JSON.stringify(result.checks)}`);
    assert.match(keyCheck.message, /bf16\.ai/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
