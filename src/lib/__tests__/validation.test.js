const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeEmail,
  isValidEmail,
  isStrongPassword,
  normalizeName,
} = require("../validation.js");

test("normalizeEmail trims and lowercases values", () => {
  assert.equal(normalizeEmail("  Admin@School.com "), "admin@school.com");
});

test("isValidEmail accepts valid addresses", () => {
  assert.equal(isValidEmail("principal@ghanaacademy.edu.gh"), true);
});

test("isValidEmail rejects invalid addresses", () => {
  assert.equal(isValidEmail("not-an-email"), false);
});

test("isStrongPassword requires letters and numbers", () => {
  assert.equal(isStrongPassword("Strong123"), true);
  assert.equal(isStrongPassword("short"), false);
  assert.equal(isStrongPassword("onlyletters"), false);
});

test("normalizeName trims whitespace", () => {
  assert.equal(normalizeName("  Ama  "), "Ama");
});
