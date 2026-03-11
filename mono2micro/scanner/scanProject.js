import fsExtra from 'fs-extra';
const { readFile } = fsExtra;
import { globby } from 'globby';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

async function scanProject(root) {
  const routeFiles = await globby(`${root}/routes/**/*.js`);
  const routes = [];

  for (const file of routeFiles) {
    const code = await readFile(file, 'utf8');
    const ast = parse(code, { sourceType: 'module' });

    traverse(ast, {
      CallExpression(path) {
        const callee = path.node.callee;
        if (
          callee.property &&
          ['get', 'post', 'put', 'delete'].includes(callee.property.name)
        ) {
          const routePath = path.node.arguments[0]?.value;
          if (routePath) {
            routes.push({
              file,
              path: routePath
            });
          }
        }
      }
    });
  }

  return { routes };
}

export { scanProject };
