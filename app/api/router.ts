import { authRouter } from "./auth-router";
import { carsRouter } from "./cars-router";
import { inquiriesRouter } from "./inquiries-router";
import { requestCarsRouter } from "./request-cars-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  cars: carsRouter,
  requestCars: requestCarsRouter,
  inquiries: inquiriesRouter,
});

export type AppRouter = typeof appRouter;
