import fse from 'fs-extra';
import yaml from 'yaml';

const fs = fse;

function mapServices(project, configPath) {
  const config = yaml.parse(fs.readFileSync(configPath, 'utf8'));
  const services = {};

  for (const [serviceName, def] of Object.entries(config.services)) {
    services[serviceName] = {
      routes: [],
      files: []
    };

    project.routes.forEach(route => {
      if (def.routes.some(prefix => route.path.startsWith(prefix))) {
        services[serviceName].routes.push(route);
        services[serviceName].files.push(route.file);
      }
    });
  }

  return services;
}

export { mapServices };
