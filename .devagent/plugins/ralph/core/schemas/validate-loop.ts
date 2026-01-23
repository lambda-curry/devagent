#!/usr/bin/env bun
/**
 * Temporary validation script for loop.schema.json
 * 
 * Usage:
 *   bun validate-loop.ts <path-to-json-file>
 * 
 * Example:
 *   bun validate-loop.ts ../../templates/generic-ralph-loop.json
 */

import Ajv from "ajv";
import addFormats from "ajv-formats";
import { readFileSync } from "fs";
import { resolve } from "path";

const ajv = new Ajv({ allErrors: true, verbose: true });
addFormats(ajv);

// Load schema
const schemaPath = resolve(import.meta.dir, "loop.schema.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

// Compile validator
const validate = ajv.compile(schema);

// Get JSON file path from args
const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error("Usage: bun validate-loop.ts <path-to-json-file>");
  process.exit(1);
}

// Load and validate JSON
try {
  const jsonPathResolved = resolve(process.cwd(), jsonPath);
  const jsonData = JSON.parse(readFileSync(jsonPathResolved, "utf-8"));
  
  const valid = validate(jsonData);
  
  if (valid) {
    console.log("✅ Validation passed!");
    console.log(`Validated: ${jsonPathResolved}`);
    process.exit(0);
  } else {
    console.error("❌ Validation failed!");
    console.error("Errors:");
    if (validate.errors) {
      validate.errors.forEach((error) => {
        console.error(`  - ${error.instancePath || "/"}: ${error.message}`);
        if (error.params) {
          console.error(`    Params: ${JSON.stringify(error.params)}`);
        }
      });
    }
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
