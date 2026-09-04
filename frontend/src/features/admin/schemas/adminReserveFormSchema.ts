import { z } from "zod";

export const adminReserveFormSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  carId: z.string().min(1, "Car ID is required"),
  pickupDate: z.string().min(1, "Pickup date is required"),
  pickupStoreId: z.string().min(1, "Pickup store is required"),
  returnDate: z.string().min(1, "Return date is required"),
  returnStoreId: z.string().min(1, "Return store is required"),
});

export type AdminReserveFormValues = z.infer<typeof adminReserveFormSchema>;
