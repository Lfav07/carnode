import { Decimal128 } from "mongodb";
import type { CarDocument } from "../../modules/cars/infrastructure/mongodb/CarDocument.js";
import type { CarStatus } from "../../modules/cars/domain/CarStatus.js";

interface CarSeedInput {
  brand: string;
  model: string;
  year: number;
  category: string;
  plate: string;
  status: CarStatus;
  dailyRate: string;
}

const CARS: CarSeedInput[] = [
  // ECONOMY (5)
  { brand: "FIAT", model: "Panda", year: 2023, category: "ECONOMY", plate: "EK372FB", status: "AVAILABLE", dailyRate: "30.00" },
  { brand: "HYUNDAI", model: "i10", year: 2022, category: "ECONOMY", plate: "FH814GD", status: "AVAILABLE", dailyRate: "28.00" },
  { brand: "TOYOTA", model: "Yaris", year: 2024, category: "ECONOMY", plate: "GJ295HE", status: "AVAILABLE", dailyRate: "35.00" },
  { brand: "KIA", model: "Picanto", year: 2023, category: "ECONOMY", plate: "HL607IF", status: "RENTED", dailyRate: "25.00" },
  { brand: "CHEVROLET", model: "Onix", year: 2022, category: "ECONOMY", plate: "IM948JG", status: "AVAILABLE", dailyRate: "32.00" },

  // COMPACT (5)
  { brand: "VOLKSWAGEN", model: "Golf", year: 2024, category: "COMPACT", plate: "JN461KH", status: "AVAILABLE", dailyRate: "50.00" },
  { brand: "HONDA", model: "Civic", year: 2023, category: "COMPACT", plate: "KO783LI", status: "AVAILABLE", dailyRate: "48.00" },
  { brand: "TOYOTA", model: "Corolla", year: 2024, category: "COMPACT", plate: "LP125MJ", status: "AVAILABLE", dailyRate: "52.00" },
  { brand: "HYUNDAI", model: "i30", year: 2022, category: "COMPACT", plate: "MQ549NK", status: "MAINTENANCE", dailyRate: "45.00" },
  { brand: "FORD", model: "Focus", year: 2023, category: "COMPACT", plate: "NR871OL", status: "AVAILABLE", dailyRate: "47.00" },

  // SUV (5)
  { brand: "JEEP", model: "Compass", year: 2024, category: "SUV", plate: "OS234PM", status: "AVAILABLE", dailyRate: "75.00" },
  { brand: "HYUNDAI", model: "Tucson", year: 2023, category: "SUV", plate: "PT657QN", status: "AVAILABLE", dailyRate: "70.00" },
  { brand: "TOYOTA", model: "RAV4", year: 2024, category: "SUV", plate: "QU980RO", status: "RENTED", dailyRate: "80.00" },
  { brand: "NISSAN", model: "Qashqai", year: 2022, category: "SUV", plate: "RV312SP", status: "AVAILABLE", dailyRate: "65.00" },
  { brand: "KIA", model: "Sportage", year: 2024, category: "SUV", plate: "SW745TQ", status: "AVAILABLE", dailyRate: "72.00" },

  // LUXURY (5)
  { brand: "BMW", model: "Série 3", year: 2024, category: "LUXURY", plate: "XA168UR", status: "AVAILABLE", dailyRate: "120.00" },
  { brand: "MERCEDES_BENZ", model: "Classe C", year: 2023, category: "LUXURY", plate: "YB491VS", status: "AVAILABLE", dailyRate: "125.00" },
  { brand: "AUDI", model: "A4", year: 2024, category: "LUXURY", plate: "ZC824WT", status: "RENTED", dailyRate: "115.00" },
  { brand: "VOLVO", model: "XC60", year: 2023, category: "LUXURY", plate: "AD157XU", status: "AVAILABLE", dailyRate: "110.00" },
  { brand: "LEXUS", model: "ES", year: 2024, category: "LUXURY", plate: "BE580YV", status: "MAINTENANCE", dailyRate: "130.00" },

  // PICKUP (5)
  { brand: "FORD", model: "Ranger", year: 2024, category: "PICKUP", plate: "CF913ZW", status: "AVAILABLE", dailyRate: "90.00" },
  { brand: "TOYOTA", model: "Hilux", year: 2023, category: "PICKUP", plate: "DG246AX", status: "AVAILABLE", dailyRate: "85.00" },
  { brand: "VOLKSWAGEN", model: "Amarok", year: 2024, category: "PICKUP", plate: "EH579BY", status: "AVAILABLE", dailyRate: "95.00" },
  { brand: "MITSUBISHI", model: "L200", year: 2022, category: "PICKUP", plate: "FI812CZ", status: "RENTED", dailyRate: "80.00" },
  { brand: "NISSAN", model: "Navara", year: 2023, category: "PICKUP", plate: "GJ145DA", status: "AVAILABLE", dailyRate: "82.00" },

  // VAN (5)
  { brand: "FIAT", model: "Ducato", year: 2024, category: "VAN", plate: "HK478EB", status: "AVAILABLE", dailyRate: "60.00" },
  { brand: "RENAULT", model: "Master", year: 2023, category: "VAN", plate: "IL701FC", status: "AVAILABLE", dailyRate: "58.00" },
  { brand: "FORD", model: "Transit", year: 2024, category: "VAN", plate: "JM034GD", status: "AVAILABLE", dailyRate: "62.00" },
  { brand: "MERCEDES_BENZ", model: "Sprinter", year: 2023, category: "VAN", plate: "KN367HE", status: "MAINTENANCE", dailyRate: "70.00" },
  { brand: "VOLKSWAGEN", model: "Crafter", year: 2024, category: "VAN", plate: "LO690IF", status: "AVAILABLE", dailyRate: "65.00" },
];

export function buildSeedCars(): CarDocument[] {
  const now = new Date();

  return CARS.map((car) => ({
    brand: car.brand,
    model: car.model,
    year: car.year,
    category: car.category,
    plate: car.plate,
    status: car.status,
    daily_rate: Decimal128.fromString(car.dailyRate),
    created_at: now,
    updated_at: now,
  }));
}
