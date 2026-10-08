import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { count } from "drizzle-orm";
import { cars, requestCars } from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database");
}

const sql = neon(connectionString);
const db = drizzle(sql);

const stock = [
  {
    make: "Toyota", model: "Land Cruiser Prado TX-L", year: 2019, price: 5_850_000,
    mileage: 68_000, fuelType: "diesel" as const, transmission: "automatic" as const, bodyType: "suv" as const,
    color: "Pearl White", engineCc: 2800, featured: true, imageUrl: "/cars/prado.jpg",
    description: "Fresh import, 7-seater, leather interior, sunroof, reverse camera, cruise control. Full service history available.",
  },
  {
    make: "Mazda", model: "CX-5 2.2 XD", year: 2019, price: 3_250_000,
    mileage: 54_000, fuelType: "diesel" as const, transmission: "automatic" as const, bodyType: "suv" as const,
    color: "Soul Red", engineCc: 2200, featured: true, imageUrl: "/cars/cx5.jpg",
    description: "SkyActiv-D diesel, heads-up display, blind-spot monitoring, power tailgate. Accident-free, one foreign owner.",
  },
  {
    make: "Subaru", model: "Forester 2.0i-L EyeSight", year: 2020, price: 3_480_000,
    mileage: 47_000, fuelType: "petrol" as const, transmission: "automatic" as const, bodyType: "suv" as const,
    color: "Dark Blue Pearl", engineCc: 2000, featured: true, imageUrl: "/cars/forester.jpg",
    description: "Symmetrical AWD, EyeSight driver assist, X-Mode, heated seats. Ideal for upcountry roads.",
  },
  {
    make: "Toyota", model: "Corolla 1.5 G", year: 2021, price: 2_150_000,
    mileage: 32_000, fuelType: "petrol" as const, transmission: "automatic" as const, bodyType: "sedan" as const,
    color: "Silver Metallic", engineCc: 1500, featured: false, imageUrl: "/cars/corolla.jpg",
    description: "Fuel-sipping daily driver, push start, lane assist, pristine interior. Ready logbook transfer.",
  },
  {
    make: "Toyota", model: "Hilux 2.4 GD-6 Double Cab", year: 2020, price: 4_950_000,
    mileage: 61_000, fuelType: "diesel" as const, transmission: "automatic" as const, bodyType: "pickup" as const,
    color: "Attitude Black", engineCc: 2400, featured: false, imageUrl: "/cars/hilux.jpg",
    description: "Workhorse double cab, 4x4, diff lock, canopy included. Fleet maintained.",
  },
  {
    make: "Nissan", model: "X-Trail 2.0 4WD", year: 2019, price: 2_680_000,
    mileage: 58_000, fuelType: "petrol" as const, transmission: "automatic" as const, bodyType: "suv" as const,
    color: "Gun Metallic", engineCc: 2000, featured: false, imageUrl: "/cars/xtrail.jpg",
    description: "7-seater option, 360 camera, intelligent 4x4. Family favourite in excellent condition.",
  },
  {
    make: "Honda", model: "CR-V 1.5 Turbo", year: 2020, price: 3_750_000,
    mileage: 41_000, fuelType: "petrol" as const, transmission: "automatic" as const, bodyType: "suv" as const,
    color: "Platinum White", engineCc: 1500, featured: false, imageUrl: "/cars/crv.jpg",
    description: "Turbo power with hybrid-like economy, panoramic roof, Honda Sensing suite.",
  },
  {
    make: "Volkswagen", model: "Golf 1.4 TSI Highline", year: 2019, price: 1_980_000,
    mileage: 49_000, fuelType: "petrol" as const, transmission: "automatic" as const, bodyType: "hatchback" as const,
    color: "Deep Blue", engineCc: 1400, featured: false, imageUrl: "/cars/golf.jpg",
    description: "DSG gearbox, adaptive cruise, digital cockpit. German engineering at a friendly price.",
  },
  {
    make: "Mercedes-Benz", model: "C200 AMG Line", year: 2019, price: 3_950_000,
    mileage: 52_000, fuelType: "petrol" as const, transmission: "automatic" as const, bodyType: "sedan" as const,
    color: "Obsidian Black", engineCc: 2000, featured: false, imageUrl: "/cars/c200.jpg",
    description: "AMG styling pack, ambient lighting, Burmester sound, memory seats. Executive class.",
  },
  {
    make: "Toyota", model: "Corolla Fielder 1.5 Hybrid", year: 2020, price: 1_850_000,
    mileage: 44_000, fuelType: "hybrid" as const, transmission: "automatic" as const, bodyType: "wagon" as const,
    color: "Silver Metallic", engineCc: 1500, featured: false, imageUrl: "/cars/fielder.jpg",
    description: "Hybrid wagon — huge boot, 25+ km/l. Perfect for business and family.",
  },
];

const onRequest = [
  {
    make: "Toyota", model: "Harrier", yearFrom: 2019, yearTo: 2023, bodyType: "suv" as const,
    note: "Sourced on order from Japan. Typical lead time 4–6 weeks, fully inspected before handover.",
    imageUrl: "/cars/harrier.jpg",
  },
  {
    make: "BMW", model: "X5", yearFrom: 2019, yearTo: 2022, bodyType: "suv" as const,
    note: "Imported on order from Japan or the UK. Mileage and auction sheet verified.",
    imageUrl: "/cars/x5.jpg",
  },
  {
    make: "Toyota", model: "Land Cruiser V8", yearFrom: 2016, yearTo: 2021, bodyType: "suv" as const,
    note: "The king of Kenyan roads. Sourced on request with full history check.",
    imageUrl: "/cars/v8.jpg",
  },
  {
    make: "Suzuki", model: "Swift", yearFrom: 2018, yearTo: 2022, bodyType: "hatchback" as const,
    note: "Compact, economical, easy to park. Ordered from Japan on request.",
    imageUrl: "/cars/swift.jpg",
  },
  {
    make: "Audi", model: "Q5", yearFrom: 2018, yearTo: 2022, bodyType: "suv" as const,
    note: "Premium German SUV sourced on order. Pre-shipment inspection guaranteed.",
    imageUrl: "/cars/q5.jpg",
  },
];

async function seed() {
  const [{ value: carCount }] = await db
    .select({ value: count() })
    .from(cars);
  if (carCount === 0) {
    await db.insert(cars).values(stock);
    console.log(`Seeded ${stock.length} cars`);
  } else {
    console.log("Cars already seeded, skipping");
  }

  const [{ value: rcCount }] = await db
    .select({ value: count() })
    .from(requestCars);
  if (rcCount === 0) {
    await db.insert(requestCars).values(onRequest);
    console.log(`Seeded ${onRequest.length} on-request cars`);
  } else {
    console.log("On-request cars already seeded, skipping");
  }

  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
