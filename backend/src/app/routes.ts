import { Router } from "express";
import { badRequest, notFound } from "../domain/errors";
import { AvailabilityService } from "../services/availability-service";
import { BookingsService } from "../services/bookings-service";
import { EventTypesService } from "../services/event-types-service";
import { OwnerService } from "../services/owner-service";
import { SlotsService } from "../services/slots-service";

type Services = {
  ownerService: OwnerService;
  eventTypesService: EventTypesService;
  availabilityService: AvailabilityService;
  slotsService: SlotsService;
  bookingsService: BookingsService;
};

export function createRoutes(services: Services) {
  const router = Router();

  router.get("/owner/profile", (_request, response) => {
    response.json(services.ownerService.getProfile());
  });

  router.get("/owner/event-types", (_request, response) => {
    response.json(services.eventTypesService.list());
  });

  router.post("/owner/event-types", (request, response) => {
    response.status(201).json(services.eventTypesService.create(request.body));
  });

  router.get("/owner/availability-windows", (_request, response) => {
    response.json(services.availabilityService.list());
  });

  router.post("/owner/availability-windows", (request, response) => {
    response.status(201).json(services.availabilityService.create(request.body));
  });

  router.get("/owner/bookings/upcoming", (_request, response) => {
    response.json(services.ownerService.listUpcomingBookings(new Date()));
  });

  router.get("/event-types", (_request, response) => {
    response.json(services.eventTypesService.list());
  });

  router.get("/event-types/:eventTypeId", (request, response) => {
    const eventType = services.eventTypesService.getById(request.params.eventTypeId);

    if (!eventType) {
      notFound(`Event type \"${request.params.eventTypeId}\" was not found.`);
    }

    response.json(eventType);
  });

  router.get("/event-types/:eventTypeId/slots", (request, response) => {
    const from = readOptionalQueryValue(request.query.from, "from");
    const to = readOptionalQueryValue(request.query.to, "to");

    response.json(
      services.slotsService.listAvailableSlots(request.params.eventTypeId, { from, to }, new Date()),
    );
  });

  router.post("/bookings", (request, response) => {
    response.status(201).json(services.bookingsService.create(request.body, new Date()));
  });

  router.use("*", (_request, response) => {
    response.status(404).json({
      code: "not_found",
      message: "Route was not found.",
    });
  });

  return router;
}

function readOptionalQueryValue(value: unknown, fieldName: string): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    badRequest(`Query parameter \"${fieldName}\" must be provided once.`);
  }

  if (typeof value !== "string") {
    badRequest(`Query parameter \"${fieldName}\" must be a string.`);
  }

  return value;
}
