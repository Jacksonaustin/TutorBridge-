import express from "express";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";
import path from "node:path";

// Used only by the combined Render image; local backend stays API-only.
export function serveFrontend(app, directory = fileURLToPath(new URL("../../public/", import.meta.url))) {
  const index = path.join(directory, "index.html");
  if (!existsSync(index)) throw new Error("Frontend build is missing.");
  app.use(express.static(directory));
  // Keep API errors as JSON, never return the React page for an unknown API URL.
  app.get(/^(?!\/api(?:\/|$)).*/, (req, res, next) => {
    if (!req.accepts("html") || path.extname(req.path)) return next();
    res.sendFile(index);
  });
}
