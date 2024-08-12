import { initTRPC } from "@trpc/server";
import * as trpcExpress from "@trpc/server/adapters/express";
import morganBody from "morgan-body";
import express from "express";
// @ts-ignore
import bodyParser from "body-parser";
import swaggerUi from "swagger-ui-express";
import {
  createOpenApiExpressMiddleware,
  generateOpenApiDocument,
  OpenApiMeta,
} from "trpc-openapi";
import cors from "cors";
import { actionController } from "./controllers/actionController";
import { z } from "zod";
import { snapshotController } from "./controllers/snapshotController";
import { stopController } from "./controllers/stopController";

const BASE_URL = "https://flashlight-ai.ngrok.io";

const createContext = ({
  req,
  res,
}: trpcExpress.CreateExpressContextOptions) => ({}); // no context

type Context = Awaited<ReturnType<typeof createContext>>;

const t = initTRPC.context<Context>().meta<OpenApiMeta>().create();

const appRouter = t.router({
  action: t.procedure
    .meta({
      openapi: {
        method: actionController.meta.method,
        path: `/${actionController.meta.name}`,
      },
    })
    .input(actionController.inputSchema)
    .output(actionController.outputSchema)
    .mutation(({ input }) => actionController.controller(input)),
  snapshot: t.procedure
    .meta({
      openapi: {
        method: snapshotController.meta.method,
        path: `/${snapshotController.meta.name}`,
      },
    })
    .input(snapshotController.inputSchema)
    .output(snapshotController.outputSchema)
    .query(({ input }) => snapshotController.controller(input)),
  stopController: t.procedure
    .meta({
      openapi: {
        method: stopController.meta.method,
        path: `/${stopController.meta.name}`,
      },
    })
    .input(stopController.inputSchema)
    .output(stopController.outputSchema)
    .mutation(({ input }) => stopController.controller(input)),
});

const app = express();

export type AppRouter = typeof appRouter;

// @ts-ignore
const openApiDocument = generateOpenApiDocument(appRouter, {
  title: "Android controller",
  version: "0.1.0",
  baseUrl: `${BASE_URL}/api`,
});

app.use(cors());

app.use(bodyParser.json());
// app.use((req, res, next) => {
//   // Log the request URL and body
//   console.log(`Request URL: ${req.url}`);
//   console.log("Request Body:", req.body);

//   // Store the original send function
//   const originalSend = res.json;

//   // Wrap the res.send function to log the response body and status code
//   res.json = function (body) {
//     // Log the response body
//     console.log("Response Body:", body);

//     // Log the response status code
//     console.log(`Response Status Code: ${res.statusCode}`);

//     // Call the original send function with the body
//     return originalSend.call(this, body);
//   };

//   // Call the next middleware in the stack
//   next();
// });

app.use(
  "/api/trpc",
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError: ({ error }) => {
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(error);
      }
    },
  })
);
app.use(
  "/api",
  createOpenApiExpressMiddleware({ router: appRouter, createContext })
);

app.use("/docs", swaggerUi.serve);
app.get("/docs", swaggerUi.setup(openApiDocument));
app.get("/docs-json", (_, res) =>
  res.json({
    ...openApiDocument,
    openapi: "3.1.0",
    components: {
      ...openApiDocument.components,
      schemas: {},
    },
  })
);

app.listen(3000, () => {
  // console.log("Server started on http://localhost:3000");
});
