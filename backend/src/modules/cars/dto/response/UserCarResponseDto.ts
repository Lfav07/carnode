export interface UserCarResponseDto {
  id: string;
  brand: string;
  model: string;
  year: number;
  category: string;
  availability: "available" | "unavailable";
  dailyRate: string;
}
