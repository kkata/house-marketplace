export type ListingsItemDataType = {
  name: string;
  type: string;
  userRef: string;
  bedrooms: number;
  bathrooms: number;
  parking: boolean;
  furnished: boolean;
  offer: boolean;
  regularPrice: number;
  discountedPrice: number;
  location: string;
  geolocation: {
    lat: string;
    lng: string;
  };
  imageUrls: string[];
  timestamp: string;
};

export type ListingsItemType = {
  id: string;
  data: ListingsItemDataType;
};
