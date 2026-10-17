const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "../api/admin-payments.js"),
  "utf8"
);

async function requestEndpoint(method, headers = {}) {
  const access = { imports: 0, credentials: 0, queries: 0 };
  const sandbox = {
    module: { exports: {} },
    // Keep regressions isolated: never load the real database SDK or credentials.
    require() {
      access.imports++;
      return {
        createClient() {
          access.queries++;
          return {
            from() { return this; },
            select() { return this; },
            async order() {
              return { data: [{ id: "synthetic-payment", amount: 100 }], error: null };
            },
          };
        },
      };
    },
    process: {
      env: new Proxy({}, {
        get() { access.credentials++; return "test-only"; },
      }),
    },
    console: { error() {} },
  };
  vm.runInNewContext(source, sandbox, { filename: "api/admin-payments.js" });

  const response = {
    statusCode: 200,
    headers: {},
    body: undefined,
    setHeader(name, value) { this.headers[name.toLowerCase()] = value; },
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = JSON.parse(JSON.stringify(body)); return this; },
  };
  await sandbox.module.exports({ method, headers }, response);
  return { response, access };
}

function assertDisabled({ response, access }) {
  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, { error: "Forbidden" });
  assert.match(response.headers["cache-control"], /\bno-store\b/);
  assert.equal(response.headers["vercel-cdn-cache-control"], "no-store");
  assert.deepEqual(access, { imports: 0, credentials: 0, queries: 0 });
}

test("anonymous GET cannot retrieve payment records or access the database", async () => {
  assertDisabled(await requestEndpoint("GET"));
});

for (const method of ["HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]) {
  test(`anonymous ${method} cannot bypass the disabled endpoint`, async () => {
    assertDisabled(await requestEndpoint(method));
  });
}

test("caller-supplied authorization and admin headers cannot enable access", async () => {
  assertDisabled(await requestEndpoint("GET", {
    authorization: "Bearer untrusted-test-value",
    cookie: "admin=true",
    "x-admin": "true",
  }));
});
