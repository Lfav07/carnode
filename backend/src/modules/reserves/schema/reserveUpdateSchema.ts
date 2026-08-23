import { z } from "zod";
import { pickupSchema } from "./PickupSchema.js";
import { returnSchema } from "./ReturnSchema.js";

export const reserveUpdateSchema = z
  .object({
    pickup: pickupSchema.optional(),
    returnInfo: returnSchema.optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: "custom",
        message: "At least one field must be provided",
      });
    }
  });

export type ReserveUpdateRequest = z.infer<typeof reserveUpdateSchema>;
