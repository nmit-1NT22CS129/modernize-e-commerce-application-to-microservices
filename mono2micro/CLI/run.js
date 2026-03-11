import { scanProject } from '../scanner/scanProject.js';
import { mapServices } from '../mapper/mapServices.js';
import { generateServices } from '../generator/generateServices.js';
import { generateInfra } from '../infra/generateInfra.js';
import yaml from 'yaml';
import fse from 'fs-extra';

const fs = fse;

async function loadConfig(configPath) {
  const content = await fs.readFile(configPath, 'utf8');
  return yaml.parse(content);
}

export async function run(options) {
    const config = await loadConfig(options.config);
    const project = await scanProject(options.input);
    const services = mapServices(project, options.config);
    await generateServices(config.services, options.output, options.input);
    await generateInfra(services, options.output);
}

