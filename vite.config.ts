
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import express, { Express } from 'express';
import { setupApiServer } from './src/server';
import type { ViteDevServer } from 'vite';
import cors from 'cors';
import type { IncomingMessage, ServerResponse } from 'http';
import type { Connect } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,HEAD,PUT,PATCH,POST,DELETE',
      'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    },
    proxy: {
      '/api': {
        target: 'https://crm-six-black.vercel.app',
        changeOrigin: true,
        secure: false,
      }
    },
    middleware: (app: Express) => {
      // Handle SPA routing - serve index.html for all routes
      app.use('*', (req, res, next) => {
        if (req.url.startsWith('/api')) {
          next();
        } else {
          next();
        }
      });
    }
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    {
      name: 'api-server',
      configureServer(server: ViteDevServer) {
        const app = express();
        app.use(cors({
          origin: '*',
          methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
          credentials: true,
          optionsSuccessStatus: 204,
        }));
        app.use(express.json());
        setupApiServer(app);
        server.middlewares.use(app);
      },
    },
    {
      name: 'handle-client-routing',
      configureServer(server: ViteDevServer) {
        server.middlewares.use((
          req: Connect.IncomingMessage,
          res: ServerResponse,
          next: Connect.NextFunction
        ) => {
          // If the request is not for an API route or a static file
          if (!req.url?.startsWith('/api') && !req.url?.match(/\.(js|css|ico|png|jpg|jpeg|svg|gif)$/)) {
            // Rewrite to index.html
            req.url = '/';
          }
          next();
        });
      },
    }
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
