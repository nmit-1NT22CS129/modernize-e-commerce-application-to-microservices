#!/usr/bin/env node
import { run } from './CLI/run.js';

// Parse command-line arguments
const args = process.argv.slice(2);

const options = {};
for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    options[key] = value;
}

// Call run function
await run(options);

