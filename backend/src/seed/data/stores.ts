import type { StoreDocument } from "../../modules/stores/infrastructure/mongodb/StoreDocument.js";

export const SEED_STORES: StoreDocument[] = [
  {
    location: { name: "Roma Termini", city: "Roma" },
  },
  {
    location: { name: "Milano Centrale", city: "Milano" },
  },
  {
    location: { name: "Napoli Garibaldi", city: "Napoli" },
  },
  {
    location: { name: "Torino Porta Nuova", city: "Torino" },
  },
  {
    location: { name: "Firenze Santa Maria Novella", city: "Firenze" },
  },
  {
    location: { name: "Bologna Centrale", city: "Bologna" },
  },
  {
    location: { name: "Palermo Centrale", city: "Palermo" },
  },
  {
    location: { name: "Catania Centrale", city: "Catania" },
  },
];
