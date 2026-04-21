import test from "node:test";
import assert from "node:assert/strict";

import { createServerAdapter } from "../dist/index.js";

test("root package export exposes Paperclip external adapter entrypoint", () => {
  const adapter = createServerAdapter();

  assert.equal(adapter.type, "hermes_local");
  assert.equal(typeof adapter.execute, "function");
  assert.equal(typeof adapter.testEnvironment, "function");
  assert.equal(typeof adapter.sessionCodec?.deserialize, "function");
  assert.equal(adapter.supportsLocalAgentJwt, true);
  assert.equal(adapter.supportsInstructionsBundle, true);
  assert.equal(adapter.instructionsPathKey, "instructionsFilePath");
  assert.equal(typeof adapter.detectModel, "function");
});
