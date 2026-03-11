import fse from 'fs-extra';
import path from 'path';

const fs = fse;

async function generateInfra(mapping, output) {
  for (const service of Object.keys(mapping)) {
    const ecs = {
      family: `${service}-task`,
      networkMode: 'awsvpc',
      requiresCompatibilities: ['FARGATE'],
      cpu: '256',
      memory: '512',
      containerDefinitions: [
        {
          name: service,
          image: `<ECR_URL>/${service}:latest`,
          portMappings: [{ containerPort: 4000 }]
        }
      ]
    };

    await fs.writeJSON(
      path.join(output, `${service}-service/ecs-task.json`),
      ecs,
      { spaces: 2 }
    );
  }
}

export { generateInfra };
