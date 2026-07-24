import { chromium } from "playwright";
import path from "path";
import fs from "fs";

function usage() {
  console.log(`
Usage:
  node export.mjs <input.html[?query]> "<class list>" <output.png>

Example:
  node export.mjs cards.html?isTTS=true "hoa starter back card" out.png
`);
}

const [, , inputArg, classList, outputFile] = process.argv;

if (!inputArg || !classList || !outputFile) {
  usage();
  process.exit(1);
}

// --- NEW: split file path and query string ---
const [inputFile, queryString] = inputArg.split("?");

const inputPath = path.resolve(inputFile);
const outputPath = path.resolve(outputFile);

// --- filesystem check uses ONLY the file path ---
if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`);
  process.exit(1);
}

// Build selector: div.class1.class2.class3
const classes = classList.split(/\s+/).filter(Boolean);

if (classes.length === 0) {
  console.error("No classes provided");
  process.exit(1);
}

const selector = `div.${classes.join(".")}`;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  // --- NEW: build file:// URL with optional query ---
  let fileUrl = `file://${inputPath.replace(/\\/g, "/")}`;
  if (queryString) {
    fileUrl += `?${queryString}`;
  }

  await page.goto(fileUrl);

  await page.waitForSelector(selector, { timeout: 10000 });

  const element = await page.$(selector);
  if (!element) {
    throw new Error(`Element not found for selector: ${selector}`);
  }

  await element.screenshot({
    path: outputPath,
    omitBackground: true,
  });

  await browser.close();
  console.log(`✅ Image written to ${outputPath}`);
})();
