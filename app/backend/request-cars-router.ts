import { z } from "zod";
import { and, desc, eq, like, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { requestCars } from "@db/schema";

const requestCarInput = z.object({
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  yearFrom: z.number().int().min(1990),
  yearTo: z.number().int().min(1990),
  bodyType: z.enum(["suv", "sedan", "hatchback", "wagon", "pickup", "van", "coupe"]),
  note: z.string().max(2000).optional(),
  imageUrl: z.string().min(1),
  active: z.boolean().default(true),
});

export const requestCarsRouter = createRouter({
  // Public: cars the broker can source on order. NEVER exposes a price.
  search: publicQuery
    .input(z.object({ q: z.string().trim().max(120).optional() }).optional())
    .query(async ({ input }) => {
      const db = getDb();
      const conds = [eq(requestCars.active, true)];
      if (input?.q) {
        const q = `%${input.q}%`;
        conds.push(or(like(requestCars.make, q), like(requestCars.model, q))!);
      }
      return db
        .select()
        .from(requestCars)
        .where(and(...conds))
        .orderBy(desc(requestCars.timesRequested));
    }),

  byId: publicQuery
    .input(z.object({ id: z.number().int().positive() }))
    .query(async ({ input }) => {
      const db = getDb();
      const rc = await db.query.requestCars.findFirst({
        where: and(eq(requestCars.id, input.id), eq(requestCars.active, true)),
      });
      if (!rc) throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
      return rc;
    }),

  // ─── admin ────────────────────────────────────────────────────────────────
  adminList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(requestCars).orderBy(desc(requestCars.createdAt));
  }),

  create: adminQuery.input(requestCarInput).mutation(async ({ input }) => {
    const db = getDb();
    const [{ id }] = await db.insert(requestCars).values(input).$returningId();
    return db.query.requestCars.findFirst({ where: eq(requestCars.id, id) });
  }),

  update: adminQuery
    .input(z.object({ id: z.number().int().positive(), data: requestCarInput.partial() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(requestCars).set(input.data).where(eq(requestCars.id, input.id));
      return db.query.requestCars.findFirst({ where: eq(requestCars.id, input.id) });
    }),

  remove: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(requestCars).where(eq(requestCars.id, input.id));
      return { ok: true };
    }),
});
