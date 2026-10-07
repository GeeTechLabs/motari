import {
  mysqlTable,
  mysqlEnum,
  serial,
  bigint,
  varchar,
  text,
  timestamp,
  boolean,
  int,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
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
export const cars = mysqlTable(
  "cars",
  {
    id: serial("id").primaryKey(),
    make: varchar("make", { length: 100 }).notNull(),
    model: varchar("model", { length: 100 }).notNull(),
    year: int("year").notNull(),
    price: int("price").notNull(), // KES
    mileage: int("mileage").notNull(), // km
    fuelType: mysqlEnum("fuelType", ["petrol", "diesel", "hybrid", "electric"]).notNull(),
    transmission: mysqlEnum("transmission", ["automatic", "manual"]).notNull(),
    bodyType: mysqlEnum("bodyType", [
      "suv",
      "sedan",
      "hatchback",
      "wagon",
      "pickup",
      "van",
      "coupe",
    ]).notNull(),
    color: varchar("color", { length: 60 }).notNull(),
    engineCc: int("engineCc"),
    description: text("description"),
    imageUrl: text("imageUrl").notNull(),
    status: mysqlEnum("status", ["available", "reserved", "sold"])
      .default("available")
      .notNull(),
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
export const requestCars = mysqlTable("request_cars", {
  id: serial("id").primaryKey(),
  make: varchar("make", { length: 100 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  yearFrom: int("yearFrom").notNull(),
  yearTo: int("yearTo").notNull(),
  bodyType: mysqlEnum("bodyType", [
    "suv",
    "sedan",
    "hatchback",
    "wagon",
    "pickup",
    "van",
    "coupe",
  ]).notNull(),
  note: text("note"), // e.g. "Imported on order from Japan, 4–6 weeks"
  imageUrl: text("imageUrl").notNull(),
  active: boolean("active").default(true).notNull(),
  timesRequested: int("timesRequested").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RequestCar = typeof requestCars.$inferSelect;
export type InsertRequestCar = typeof requestCars.$inferInsert;

// ─── Inquiries (privacy-first: phone only stored when user opts in) ─────────
export const inquiries = mysqlTable(
  "inquiries",
  {
    id: serial("id").primaryKey(),
    referenceCode: varchar("referenceCode", { length: 20 }).notNull().unique(),
    type: mysqlEnum("type", ["inquiry", "price_check", "sourcing"]).notNull(),
    carId: bigint("carId", { mode: "number", unsigned: true }),
    requestCarId: bigint("requestCarId", { mode: "number", unsigned: true }),
    // free-text subject when it's a general sourcing request
    subject: varchar("subject", { length: 255 }),
    message: text("message"),
    sharePhone: boolean("sharePhone").default(false).notNull(),
    phone: varchar("phone", { length: 40 }), // null unless sharePhone = true
    status: mysqlEnum("status", ["new", "in_progress", "replied", "closed"])
      .default("new")
      .notNull(),
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
