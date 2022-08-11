import {
  DocumentData,
  FirestoreDataConverter,
  QueryDocumentSnapshot,
  serverTimestamp,
  SnapshotOptions,
} from "firebase/firestore";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { auth } from "./firebase.config";
import { v4 as uuidv4 } from "uuid";
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

// Store images in firebase storage
export const storeImage = async (image: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storage = getStorage();
    const fileName = `${auth.currentUser?.uid}-${image.name}-${uuidv4()}`;

    const storageRef = ref(storage, "images/" + fileName);

    const uploadTask = uploadBytesResumable(storageRef, image);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log("Upload is " + progress + "% done");
        switch (snapshot.state) {
          case "paused":
            console.log("Upload is paused");
            break;
          case "running":
            console.log("Upload is running");
            break;
        }
      },
      (error) => {
        reject(error);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          resolve(downloadURL);
        });
      }
    );
  });
};
