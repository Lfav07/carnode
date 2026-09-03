export type StoreLocation = {
  name: string;
  city: string;
};

export type StoreResponse = {
  id: string;
  location: StoreLocation;
};

export type StoreCreateRequest = {
  location: StoreLocation;
};

export type StoreUpdateLocationRequest = {
  location: StoreLocation;
};
