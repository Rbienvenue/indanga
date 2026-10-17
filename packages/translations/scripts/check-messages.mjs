import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";

const root = new URL("../src/", import.meta.url);
const locales = ["en", "fr", "rw"];
const namespaces = (await readdir(new URL("en/", root)))
  .filter((name) => name.endsWith(".json"))
  .sort();

function flatten(value, prefix = "", result = {}) {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `${prefix}: expected messages`,
  );
  for (const [key, message] of Object.entries(value)) {
    assert(!key.includes("."), `${prefix}${key}: message keys cannot contain periods`);
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof message === "string") {
      assert(message.trim(), `${path}: empty message`);
      result[path] = message;
    } else {
      flatten(message, path, result);
    }
  }
  return result;
}

function parameters(message) {
  const names = new Set();
  for (const match of message.matchAll(/\{(\w+)(?=[,}])/g)) {
    // A plural branch such as `other {Unavailable}` is text, not an argument.
    if (
      !/(?:\bzero|\bone|\btwo|\bfew|\bmany|\bother|=\d+)\s*$/.test(message.slice(0, match.index))
    ) {
      names.add(match[1]);
    }
  }
  for (const match of message.matchAll(/<([a-zA-Z]\w*)>/g)) names.add(`<${match[1]}>`);
  return [...names].sort();
}

let baseline;
for (const locale of locales) {
  const directory = new URL(`${locale}/`, root);
  const files = (await readdir(directory)).filter((name) => name.endsWith(".json")).sort();
  assert.deepEqual(files, namespaces, `${locale}: namespaces differ from English`);
  const catalog = {};
  for (const file of files) {
    catalog[file.slice(0, -5)] = JSON.parse(await readFile(new URL(file, directory), "utf8"));
  }
  const flat = flatten(catalog);
  if (!baseline) baseline = flat;
  assert.deepEqual(
    Object.keys(flat).sort(),
    Object.keys(baseline).sort(),
    `${locale}: message keys differ`,
  );
  for (const [key, message] of Object.entries(flat)) {
    assert.deepEqual(
      parameters(message),
      parameters(baseline[key]),
      `${locale}.${key}: interpolation differs`,
    );
  }
}
console.log(`Checked ${Object.keys(baseline).length} messages across ${locales.join(", ")}.`);
