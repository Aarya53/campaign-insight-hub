import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    ...authTables,

    users: defineTable({
      name: v.optional(v.string()),
      image: v.optional(v.string()),
      email: v.optional(v.string()),
      emailVerificationTime: v.optional(v.number()),
      isAnonymous: v.optional(v.boolean()),
      role: v.optional(roleValidator),
    }).index("email", ["email"]),

    campaigns: defineTable({
      name: v.string(),
      channel: v.string(),
      status: v.string(),
      vertical: v.string(),
      budget: v.number(),
      color: v.string(),
    }),

    dailyRows: defineTable({
      campaignId: v.id("campaigns"),
      date: v.string(), // YYYY-MM-DD
      impressions: v.number(),
      clicks: v.number(),
      conversions: v.number(),
      revenue: v.number(),
      spend: v.number(),
    })
      .index("by_campaign", ["campaignId"])
      .index("by_date", ["date"])
      .index("by_campaign_date", ["campaignId", "date"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;
