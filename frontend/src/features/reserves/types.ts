export type ReserveStatus =
  | "PENDING"
  | "CONFIRMED"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";

export type Pickup = {
  date: string;
  storeId: string;
};

export type ReturnInfo = {
  date: string;
  storeId: string;
};

export type Pricing = {
  dailyRate: string;
  days: number;
  subtotal: string;
};

export type ReserveResponse = {
  id: string;
  userId: string;
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
  status: ReserveStatus;
  pricing: Pricing;
  createdAt: string;
  updatedAt: string;
};

export type UserReserveResponse = {
  id: string;
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
  status: ReserveStatus;
  pricing: Pricing;
  createdAt: string;
  updatedAt: string;
};

export type ReserveCreateRequest = {
  userId: string;
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
};

export type UserReserveCreateRequest = {
  carId: string;
  pickup: Pickup;
  returnInfo: ReturnInfo;
};

export type ReserveUpdateRequest = {
  pickup?: Pickup;
  returnInfo?: ReturnInfo;
};

export type ReserveStatusUpdateRequest = {
  status: ReserveStatus;
};
