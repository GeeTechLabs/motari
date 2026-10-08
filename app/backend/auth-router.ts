import { z } from "zod";
import * as cookie from "cookie";
import { TRPCError } from "@trpc/server";
import { Session } from "@contracts/constants";
import { getSessionCookieOptions } from "./lib/cookies";
import { createRouter, publicQuery } from "./middleware";
import { signSessionToken } from "./kimi/session";
import { findUserByUnionId, upsertUser } from "./queries/users";
import { env } from "./lib/env";

export const authRouter = createRouter({
  me: publicQuery.query((opts) => opts.ctx.user ?? null),

  login: publicQuery
    .input(
      z.object({
        username: z.string().trim(),
        password: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const u = input.username.toLowerCase();
      const validUsername = u === "admin" || u === "admin@motari.co.ke";
      const validPassword = input.password === env.adminPassword;

      if (!validUsername || !validPassword) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "Invalid admin username or password",
        });
      }

      const adminUnionId = "admin_master";
      await upsertUser({
        unionId: adminUnionId,
        name: "Motari Admin",
        email: "admin@motari.co.ke",
        role: "admin",
        lastSignInAt: new Date(),
      });

      const user = await findUserByUnionId(adminUnionId);

      const token = await signSessionToken({
        unionId: adminUnionId,
        clientId: env.appId || "motari_admin",
      });

      const opts = getSessionCookieOptions(ctx.req.headers);
      ctx.resHeaders.append(
        "set-cookie",
        cookie.serialize(Session.cookieName, token, {
          httpOnly: opts.httpOnly,
          path: opts.path,
          sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
          secure: opts.secure,
          maxAge: Math.floor(Session.maxAgeMs / 1000),
        }),
      );

      return { success: true, user };
    }),

  logout: publicQuery.mutation(async ({ ctx }) => {
    const opts = getSessionCookieOptions(ctx.req.headers);
    ctx.resHeaders.append(
      "set-cookie",
      cookie.serialize(Session.cookieName, "", {
        httpOnly: opts.httpOnly,
        path: opts.path,
        sameSite: opts.sameSite?.toLowerCase() as "lax" | "none",
        secure: opts.secure,
        maxAge: 0,
      }),
    );
    return { success: true };
  }),
});
