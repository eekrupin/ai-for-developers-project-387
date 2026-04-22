import cors from "cors";
import express from "express";
import path from "node:path";
import { env } from "../config/env";
import { AvailabilityService } from "../services/availability-service";
import { BookingsService } from "../services/bookings-service";
import { EventTypesService } from "../services/event-types-service";
import { OwnerService } from "../services/owner-service";
import { SlotsService } from "../services/slots-service";
import { MemoryStore } from "../storage/memory-store";
import { errorHandler } from "./error-handler";
import { createRoutes } from "./routes";

export function createApp() {
  const store = new MemoryStore();
  const ownerService = new OwnerService(store);
  const eventTypesService = new EventTypesService(store);
  const availabilityService = new AvailabilityService(store);
  const slotsService = new SlotsService(store);
  const bookingsService = new BookingsService(store, slotsService);

  const app = express();
  const frontendDistPath = path.resolve(__dirname, "../../..", env.frontendDistDir);
  const frontendIndexPath = path.join(frontendDistPath, "index.html");

  if (env.corsOrigin) {
    app.use(
      cors({
        origin: env.corsOrigin,
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
      }),
    );
  }

  app.use(express.json());

  app.use(
    "/api",
    createRoutes({
      ownerService,
      eventTypesService,
      availabilityService,
      slotsService,
      bookingsService,
    }),
  );

  app.use(express.static(frontendDistPath));

  app.get("*", (request, response, next) => {
    if (request.path.startsWith("/api") || path.extname(request.path)) {
      next();
      return;
    }

    response.sendFile(frontendIndexPath);
  });

  app.use(errorHandler);

  return app;
}
