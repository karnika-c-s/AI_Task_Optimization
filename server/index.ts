import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { spawn } from "child_process";

// Start the Python FastAPI server
const startFastAPIServer = () => {
  const pythonProcess = spawn("python", [
    "-m",
    "uvicorn",
    "server.fastapi_app:app",
    "--host",
    "localhost",
    "--port",
    "8000",
  ]);

  pythonProcess.stdout.on("data", (data) => {
    log(`[FastAPI] ${data}`, "python");
  });

  pythonProcess.stderr.on("data", (data) => {
    log(`[FastAPI Error] ${data}`, "python");
  });

  pythonProcess.on("close", (code) => {
    log(`[FastAPI] process exited with code ${code}`, "python");
    // Restart the server if it crashes
    if (code !== 0) {
      log("[FastAPI] Restarting server...", "python");
      setTimeout(startFastAPIServer, 1000);
    }
  });

  return pythonProcess;
};

// Start the FastAPI server
const fastAPIProcess = startFastAPIServer();

// Handle process termination
process.on("SIGINT", () => {
  if (fastAPIProcess) {
    fastAPIProcess.kill();
  }
  process.exit();
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`Serving on port ${port}`);
  });
})();
