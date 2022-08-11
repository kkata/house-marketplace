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

export type FormDataType = {
  type: string;
  name: string;
  bedrooms: number;
  bathrooms: number;
  parking: boolean;
  furnished: boolean;
  address?: string;
  location?: string;
  offer: boolean;
  regularPrice: number;
  discountedPrice?: number;
  images?: FileList;
  latitude: number;
  longitude: number;
  userRef: string;
};
