import {
  pgTable,
  pgEnum,
  serial,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

// ─── Enums ────────────────────────────────────────────────────────────────────
export const roleEnum = pgEnum("role", ["user", "admin"]);
export const fuelTypeEnum = pgEnum("fuel_type", [
  "petrol",
  "diesel",
  "hybrid",
  "electric",
]);
export const transmissionEnum = pgEnum("transmission", [
  "automatic",
  "manual",
]);
export const bodyTypeEnum = pgEnum("body_type", [
  "suv",
  "sedan",
  "hatchback",
  "wagon",
  "pickup",
  "van",
  "coupe",
]);
export const carStatusEnum = pgEnum("car_status", [
  "available",
  "reserved",
  "sold",
]);
export const inquiryTypeEnum = pgEnum("inquiry_type", [
  "inquiry",
  "price_check",
  "sourcing",
]);
export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "new",
  "in_progress",
  "replied",
  "closed",
]);

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Cars in stock ──────────────────────────────────────────────────────────
export const cars = pgTable(
  "cars",
  {
    id: serial("id").primaryKey(),
    make: varchar("make", { length: 100 }).notNull(),
    model: varchar("model", { length: 100 }).notNull(),
    year: integer("year").notNull(),
    price: integer("price").notNull(), // KES
    mileage: integer("mileage").notNull(), // km
    fuelType: fuelTypeEnum("fuelType").notNull(),
    transmission: transmissionEnum("transmission").notNull(),
    bodyType: bodyTypeEnum("bodyType").notNull(),
    color: varchar("color", { length: 60 }).notNull(),
    engineCc: integer("engineCc"),
    description: text("description"),
    imageUrl: text("imageUrl").notNull(),
    status: carStatusEnum("status").default("available").notNull(),
    featured: boolean("featured").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    makeModelIdx: index("cars_make_model_idx").on(table.make, table.model),
    statusIdx: index("cars_status_idx").on(table.status),
  }),
);

export type Car = typeof cars.$inferSelect;
export type InsertCar = typeof cars.$inferInsert;

// ─── Cars available on request (broker can source, no listed price) ─────────
export const requestCars = pgTable("request_cars", {
  id: serial("id").primaryKey(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  yearFrom: integer("yearFrom").notNull(),
  yearTo: integer("yearTo").notNull(),
  bodyType: bodyTypeEnum("bodyType").notNull(),
  note: text("note"), // e.g. "Imported on order from Japan, 4–6 weeks"
  imageUrl: text("imageUrl").notNull(),
  active: boolean("active").default(true).notNull(),
  timesRequested: integer("timesRequested").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RequestCar = typeof requestCars.$inferSelect;
export type InsertRequestCar = typeof requestCars.$inferInsert;

// ─── Inquiries (privacy-first: phone only stored when user opts in) ─────────
export const inquiries = pgTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    referenceCode: varchar("referenceCode", { length: 20 }).notNull().unique(),
    type: inquiryTypeEnum("type").notNull(),
    carId: integer("carId"),
    requestCarId: integer("requestCarId"),
    // free-text subject when it's a general sourcing request
    subject: varchar("subject", { length: 255 }),
    message: text("message"),
    sharePhone: boolean("sharePhone").default(false).notNull(),
    phone: varchar("phone", { length: 40 }), // null unless sharePhone = true
    status: inquiryStatusEnum("status").default("new").notNull(),
    brokerReply: text("brokerReply"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt")
      .defaultNow()
      .notNull()
      .$onUpdate(() => new Date()),
  },
  (table) => ({
    statusIdx: index("inquiries_status_idx").on(table.status),
    carIdx: index("inquiries_car_idx").on(table.carId),
  }),
);

export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = typeof inquiries.$inferInsert;
