import { FieldValue } from "firebase/firestore";

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
    lat: number;
    lng: number;
  };
  imgUrls: FileList;
  timestamp: FieldValue;
};

export type ListingsItemType = {
  id: string;
  data: ListingsItemDataType;
};

export type UsersType = {
  displayName?: string;
  email: string;
  name: string;
  timestamp: string;
};
