import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  serverTimestamp,
  SnapshotOptions,
} from "firebase/firestore";
import { ListingsItemDataType, ListingsItemType, UsersType } from "./type";

// ref. https://maku.blog/p/bw9kv6g/
export const listingsItemConverter: FirestoreDataConverter<ListingsItemType> = {
  toFirestore(item: ListingsItemType): DocumentData {
    return {
      ...item,
      timestamp: serverTimestamp(),
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): ListingsItemType {
    const data = snapshot.data(options); //  as ListingsItemDataType にしたいけどしない
    return {
      id: snapshot.id,
      data: {
        //  as ListingsItemDataType をしていないので羅列している
        name: data.name,
        type: data.type,
        userRef: data.userRef,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        parking: data.parking,
        furnished: data.furnished,
        offer: data.offer,
        regularPrice: data.regularPrice,
        discountedPrice: data.discountedPrice,
        location: data.location,
        geolocation: data.geolocation,
        imgUrls: data.imgUrls,
        timestamp: data.timestamp,
      },
    };
  },
};

export const listingsConverter: FirestoreDataConverter<ListingsItemDataType> = {
  toFirestore(item: ListingsItemDataType): DocumentData {
    return {
      ...item,
      timestamp: serverTimestamp(),
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): ListingsItemDataType {
    const data = snapshot.data(options); //  as ListingsItemDataType にしたいけどしない
    return {
      //  as ListingsItemDataType をしていないので羅列している
      name: data.name,
      type: data.type,
      userRef: data.userRef,
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      parking: data.parking,
      furnished: data.furnished,
      offer: data.offer,
      regularPrice: data.regularPrice,
      discountedPrice: data.discountedPrice,
      location: data.location,
      geolocation: data.geolocation,
      imgUrls: data.imgUrls,
      timestamp: data.timestamp,
    };
  },
};

export const usersConverter: FirestoreDataConverter<UsersType> = {
  toFirestore(item: UsersType): DocumentData {
    return {
      ...item,
      timestamp: serverTimestamp(),
    };
  },

  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): UsersType {
    const data = snapshot.data(options);
    return {
      displayName: data.displayName,
      email: data.email,
      name: data.name,
      timestamp: data.timestamp,
    };
  },
};
