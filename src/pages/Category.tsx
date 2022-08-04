import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  FirestoreDataConverter,
  DocumentData,
  QueryDocumentSnapshot,
  SnapshotOptions,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { Spinner } from "../components/Spinner";
import { ListingItem } from "../components/ListingItem";
import { ListingsItemType } from "../type";

// ref. https://maku.blog/p/bw9kv6g/
const listingsItemConverter: FirestoreDataConverter<ListingsItemType> = {
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
        imageUrls: data.imageUrls,
        timestamp: data.timestamp,
      },
    };
  },
};

export const Category = () => {
  const [listings, setListings] = useState<ListingsItemType[]>([]);
  const [loading, setLoading] = useState(true);

  const params = useParams();

  const onEdit = (id: string) => {};
  const onDelete = (id: string, name: string) => {};

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingRef = collection(db, "listings").withConverter(
          listingsItemConverter
        );
        const q = query(
          listingRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const querySnap = await getDocs(q);

        const listings = querySnap.docs.map((doc) => doc.data());

        setListings(listings);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    };
    fetchListings();
  }, [params.categoryName]);

  return (
    <div className="category">
      <header>
        <p className="pageHeader">
          {params.categoryName === "rent"
            ? "Places for rent"
            : "Places for sale"}
        </p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </ul>
          </main>
        </>
      ) : (
        <p>No listings for {params.categoryName}</p>
      )}
    </div>
  );
};
