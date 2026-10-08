import { z } from "zod";
import { and, desc, eq, gte, like, lte, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cars } from "@db/schema";

const carInput = z.object({
  make: z.string().min(1).max(100),
  model: z.string().min(1).max(100),
  year: z.number().int().min(1990).max(new Date().getFullYear() + 1),
  price: z.number().int().min(1),
  mileage: z.number().int().min(0),
  fuelType: z.enum(["petrol", "diesel", "hybrid", "electric"]),
  transmission: z.enum(["automatic", "manual"]),
  bodyType: z.enum(["suv", "sedan", "hatchback", "wagon", "pickup", "van", "coupe"]),
  color: z.string().min(1).max(60),
  engineCc: z.number().int().min(600).max(8000).optional(),
  description: z.string().max(4000).optional(),
  imageUrl: z.string().min(1),
  status: z.enum(["available", "reserved", "sold"]).default("available"),
  featured: z.boolean().default(false),
});

export const carsRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          q: z.string().trim().max(120).optional(),
          make: z.string().trim().max(100).optional(),
          bodyType: z
            .enum(["suv", "sedan", "hatchback", "wagon", "pickup", "van", "coupe"])
            .optional(),
          maxPrice: z.number().int().positive().optional(),
          minYear: z.number().int().optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conds = [];
      if (input?.q) {
        const q = `%${input.q}%`;
        conds.push(or(like(cars.make, q), like(cars.model, q), like(cars.color, q)));
      }
      if (input?.make) conds.push(eq(cars.make, input.make));
      if (input?.bodyType) conds.push(eq(cars.bodyType, input.bodyType));
      if (input?.maxPrice) conds.push(lte(cars.price, input.maxPrice));
      if (input?.minYear) conds.push(gte(cars.year, input.minYear));

      const rows = await db
        .select()
        .from(cars)
        .where(conds.length ? and(...conds) : undefined)
        .orderBy(desc(cars.featured), desc(cars.createdAt));

      // For the public catalogue only expose available/reserved cars,
      // unless the caller is just searching (sold cars still show as "Sold").
      return rows.filter((c) => c.status !== "sold" || !!input?.q);
    }),

  featured: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select()
      .from(cars)
      .where(and(eq(cars.status, "available"), eq(cars.featured, true)))
      .orderBy(desc(cars.createdAt))
      .limit(6);
  }),

  makes: publicQuery.query(async () => {
    const db = getDb();
    const rows = await db
      .selectDistinct({ make: cars.make })
      .from(cars)
      .where(eq(cars.status, "available"))
      .orderBy(cars.make);
    return rows.map((r) => r.make);
  }),

  byId: publicQuery.input(z.object({ id: z.number().int().positive() })).query(async ({ input }) => {
    const db = getDb();
    const car = await db.query.cars.findFirst({ where: eq(cars.id, input.id) });
    if (!car) throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" });
    return car;
  }),

  // ─── admin ────────────────────────────────────────────────────────────────
  adminList: adminQuery.query(async () => {
    const db = getDb();
    return db.select().from(cars).orderBy(desc(cars.createdAt));
  }),

  create: adminQuery.input(carInput).mutation(async ({ input }) => {
    const db = getDb();
    const [{ id }] = await db.insert(cars).values(input).returning({ id: cars.id });
    return db.query.cars.findFirst({ where: eq(cars.id, id) });
  }),

  update: adminQuery
    .input(z.object({ id: z.number().int().positive(), data: carInput.partial() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(cars).set(input.data).where(eq(cars.id, input.id));
      return db.query.cars.findFirst({ where: eq(cars.id, input.id) });
    }),

  remove: adminQuery
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(cars).where(eq(cars.id, input.id));
      return { ok: true };
    }),

  countSold: publicQuery.query(async () => {
    const db = getDb();
    const [row] = await db
      .select({ n: sql<number>`count(*)` })
      .from(cars)
      .where(eq(cars.status, "sold"));
    // The broker's lifetime track record (400+) predates this system
    return 400 + Number(row?.n ?? 0);
  }),
});
