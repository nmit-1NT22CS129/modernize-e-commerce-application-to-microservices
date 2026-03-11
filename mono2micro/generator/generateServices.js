import fse from "fs-extra";
import path from "path";

const fs = fse;

/* ================================
   MAIN ENTRY
================================ */
async function generateServices(services, output, inputRoot) {
  for (const [serviceName, cfg] of Object.entries(services)) {
    const serviceRoot = path.join(output, `${serviceName}-service`);
    const src = path.join(serviceRoot, "src");

    await createBaseStructure(src);
    await copyAndRewrite(serviceName, services, cfg, src, inputRoot);
    await generateConfig(src);
    await generateAppFile(src, cfg.routeFile);
    await generateDockerfile(serviceRoot);
  }
}

/* ================================
   FOLDER STRUCTURE
================================ */
async function createBaseStructure(src) {
  const folders = [
    "routes",
    "controllers",
    "models",
    "middleware",
    "config"
  ];

  for (const f of folders) {
    await fs.ensureDir(path.join(src, f));
  }
}

/* ================================
   COPY + REWRITE FILES
================================ */
async function copyAndRewrite(serviceName, services, cfg, src, inputRoot) {
  const filesToCopy = [
    { dir: "routes", file: cfg.routeFile },
    { dir: "controllers", file: cfg.controllerFile }
  ];

  if (cfg.modelFiles) {
    for (const model of cfg.modelFiles) {
      filesToCopy.push({ dir: "models", file: model });
    }
  }

  for (const { dir, file } of filesToCopy) {
    const dest = path.join(src, dir, file);
    await fs.copy(path.join(inputRoot, dir, file), dest);
    await rewriteImports(dest, serviceName, services);
  }

  // Middleware (shared copy)
  await fs.copy(
    path.join(inputRoot, "middleware"),
    path.join(src, "middleware")
  );
}

/* ================================
   IMPORT REWRITER (JS SAFE)
================================ */
async function rewriteImports(filePath, serviceName, services) {
  let code = await fs.readFile(filePath, "utf-8");

  // Handle require()
  code = code.replace(
    /require\(["'](.+?)["']\)/g,
    (_, importPath) =>
      rewritePath(importPath, serviceName, services, "require")
  );

  // Handle ES import
  code = code.replace(
    /from ["'](.+?)["']/g,
    (_, importPath) =>
      `from "${rewritePath(importPath, serviceName, services, "import")}"`
  );

  await fs.writeFile(filePath, code);
}

/* ================================
   PATH REWRITE LOGIC
================================ */
function rewritePath(importPath, serviceName, services, type) {
  // Node / npm package → leave untouched
  if (!importPath.startsWith(".")) {
    return importPath;
  }

  // Detect cross-service imports
  for (const otherService of Object.keys(services)) {
    if (
      otherService !== serviceName &&
      importPath.includes(`/${otherService}/`)
    ) {
      return type === "require"
        ? "axios"
        : "axios";
    }
  }

  // Normalize relative paths
  return normalizePath(importPath);
}

/* ================================
   PATH NORMALIZER
   ../../models/x → ./models/x
================================ */
function normalizePath(p) {
  return p.replace(/^(\.\.\/)+/, "./");
}

/* ================================
   DB CONFIG
================================ */
async function generateConfig(src) {
  const content = `
const mongoose = require("mongoose");

module.exports = async () => {
  await mongoose.connect(process.env.DB_URL);
};
`;
  await fs.writeFile(path.join(src, "config", "db.js"), content);
}

/* ================================
   APP.JS
================================ */
async function generateAppFile(src, routeFile) {
  const content = `
const express = require("express");
const app = express();

app.use(express.json());

require("./config/db")();

const routes = require("./routes/${routeFile}");
app.use(routes);

app.get("/health", (_, res) => res.json({ status: "ok" }));

module.exports = app;
`;
  await fs.writeFile(path.join(src, "app.js"), content);
}

/* ================================
   DOCKERFILE
================================ */
async function generateDockerfile(serviceRoot) {
  const content = `
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 4000
CMD ["node", "src/app.js"]
`;
  await fs.writeFile(path.join(serviceRoot, "Dockerfile"), content);
}

export { generateServices };
