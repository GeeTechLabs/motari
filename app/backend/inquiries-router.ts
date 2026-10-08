import { z } from "zod";
import { desc, eq, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, adminQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { cars, inquiries, requestCars } from "@db/schema";

function makeReferenceCode() {
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I/L
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return `MM-${code}`;
}

const createInquiryInput = z
  .object({
    type: z.enum(["inquiry", "price_check", "sourcing"]),
    carId: z.number().int().positive().optional(),
    requestCarId: z.number().int().positive().optional(),
    subject: z.string().trim().max(255).optional(),
    message: z.string().trim().max(2000).optional(),
    sharePhone: z.boolean().default(false),
    phone: z.string().trim().min(7).max(40).optional(),
  })
  .refine((v) => !v.sharePhone || !!v.phone, {
    message: "Phone number required when sharing is enabled",
    path: ["phone"],
  })
  .refine((v) => v.type !== "inquiry" || !!v.carId, {
    message: "carId required for car inquiries",
    path: ["carId"],
  })
  .refine((v) => v.type !== "price_check" || !!v.requestCarId, {
    message: "requestCarId required for price checks",
    path: ["requestCarId"],
  });

export const inquiriesRouter = createRouter({
  // Public: privacy-first. Personal details are NOT collected by default.
  // The phone number is only stored when the visitor explicitly opts in.
  create: publicQuery.input(createInquiryInput).mutation(async ({ input }) => {
    const db = getDb();

    // validate referenced entities
    if (input.carId) {
      const car = await db.query.cars.findFirst({ where: eq(cars.id, input.carId) });
      if (!car) throw new TRPCError({ code: "NOT_FOUND", message: "Car not found" });
    }
    if (input.requestCarId) {
      const rc = await db.query.requestCars.findFirst({
        where: eq(requestCars.id, input.requestCarId),
      });
      if (!rc) throw new TRPCError({ code: "NOT_FOUND", message: "Not found" });
    }

    let referenceCode = makeReferenceCode();
    // extremely unlikely collision retry
    for (let i = 0; i < 3; i++) {
      const existing = await db.query.inquiries.findFirst({
        where: eq(inquiries.referenceCode, referenceCode),
      });
      if (!existing) break;
      referenceCode = makeReferenceCode();
    }

    const [{ id }] = await db
      .insert(inquiries)
      .values({
        referenceCode,
        type: input.type,
        carId: input.carId ?? null,
        requestCarId: input.requestCarId ?? null,
        subject: input.subject ?? null,
        message: input.message || null,
        sharePhone: input.sharePhone,
        phone: input.sharePhone ? input.phone! : null, // hard privacy guarantee
      })
      .returning({ id: inquiries.id });

    if (input.requestCarId) {
      await db
        .update(requestCars)
        .set({ timesRequested: sql`${requestCars.timesRequested} + 1` })
        .where(eq(requestCars.id, input.requestCarId));
    }

    const created = await db.query.inquiries.findFirst({ where: eq(inquiries.id, id) });
    return { referenceCode: created!.referenceCode };
  }),

  // Public: track an inquiry by its reference code.
  // Deliberately returns no personal data — only status and the broker's reply.
  track: publicQuery
    .input(z.object({ referenceCode: z.string().trim().min(4).max(20) }))
    .query(async ({ input }) => {
      const db = getDb();
      const inq = await db.query.inquiries.findFirst({
        where: eq(inquiries.referenceCode, input.referenceCode.toUpperCase()),
      });
      if (!inq) throw new TRPCError({ code: "NOT_FOUND", message: "Reference not found" });

      let carName: string | null = null;
      if (inq.carId) {
        const car = await db.query.cars.findFirst({ where: eq(cars.id, inq.carId) });
        if (car) carName = `${car.make} ${car.model} (${car.year})`;
      } else if (inq.requestCarId) {
        const rc = await db.query.requestCars.findFirst({
          where: eq(requestCars.id, inq.requestCarId),
        });
        if (rc) carName = `${rc.make} ${rc.model}`;
      }

      return {
        referenceCode: inq.referenceCode,
        type: inq.type,
        status: inq.status,
        carName,
        subject: inq.subject,
        brokerReply: inq.brokerReply,
        createdAt: inq.createdAt,
        updatedAt: inq.updatedAt,
      };
    }),

  // ─── admin ────────────────────────────────────────────────────────────────
  adminList: adminQuery
    .input(
      z
        .object({
          status: z.enum(["new", "in_progress", "replied", "closed"]).optional(),
        })
        .optional(),
    )
    .query(async ({ input }) => {
      const db = getDb();
      const rows = await db
        .select()
        .from(inquiries)
        .where(input?.status ? eq(inquiries.status, input.status) : undefined)
        .orderBy(desc(inquiries.createdAt));

      // join names for display
      return Promise.all(
        rows.map(async (inq) => {
          let carName: string | null = null;
          if (inq.carId) {
            const car = await db.query.cars.findFirst({ where: eq(cars.id, inq.carId) });
            if (car) carName = `${car.make} ${car.model} (${car.year})`;
          } else if (inq.requestCarId) {
            const rc = await db.query.requestCars.findFirst({
              where: eq(requestCars.id, inq.requestCarId),
            });
            if (rc) carName = `${rc.make} ${rc.model}`;
          }
          return { ...inq, carName };
        }),
      );
    }),

  update: adminQuery
    .input(
      z.object({
        id: z.number().int().positive(),
        status: z.enum(["new", "in_progress", "replied", "closed"]).optional(),
        brokerReply: z.string().trim().max(4000).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const data: Record<string, unknown> = {};
      if (input.status) data.status = input.status;
      if (input.brokerReply !== undefined) {
        data.brokerReply = input.brokerReply;
        if (!input.status) data.status = "replied";
      }
      await db.update(inquiries).set(data).where(eq(inquiries.id, input.id));
      return db.query.inquiries.findFirst({ where: eq(inquiries.id, input.id) });
    }),

  stats: adminQuery.query(async () => {
    const db = getDb();
    const [carStats] = await db
      .select({
        total: sql<number>`count(*)`,
        available: sql<number>`sum(case when ${cars.status} = 'available' then 1 else 0 end)`,
        sold: sql<number>`sum(case when ${cars.status} = 'sold' then 1 else 0 end)`,
      })
      .from(cars);
    const [inqStats] = await db
      .select({
        total: sql<number>`count(*)`,
        fresh: sql<number>`sum(case when ${inquiries.status} = 'new' then 1 else 0 end)`,
        priceChecks: sql<number>`sum(case when ${inquiries.type} = 'price_check' then 1 else 0 end)`,
      })
      .from(inquiries);
    const [rcStats] = await db
      .select({ total: sql<number>`count(*)` })
      .from(requestCars)
      .where(eq(requestCars.active, true));
    return {
      cars: {
        total: Number(carStats?.total ?? 0),
        available: Number(carStats?.available ?? 0),
        sold: Number(carStats?.sold ?? 0),
      },
      inquiries: {
        total: Number(inqStats?.total ?? 0),
        new: Number(inqStats?.fresh ?? 0),
        priceChecks: Number(inqStats?.priceChecks ?? 0),
      },
      requestCars: { total: Number(rcStats?.total ?? 0) },
    };
  }),
});
