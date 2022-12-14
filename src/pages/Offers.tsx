import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  startAfter,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { Spinner } from "../components/Spinner";
import { ListingItem } from "../components/ListingItem";
import { ListingsItemType } from "../type";
import { listingsItemConverter } from "../utils";

export const Offers = () => {
  const [listings, setListings] = useState<ListingsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] =
    useState<QueryDocumentSnapshot>();
  const [isListedAll, setIsListedAll] = useState(true); // FIXME: when the last listing is fetched, set this to false

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const listingRef = collection(db, "listings").withConverter(
          listingsItemConverter
        );
        const q = query(
          listingRef,
          where("offer", "==", true),
          orderBy("timestamp", "desc"),
          limit(10)
        );
        const querySnap = await getDocs(q);

        const lastVisible = querySnap.docs[querySnap.docs.length - 1];

        setLastFetchedListing(lastVisible);

        const listings = querySnap.docs.map((doc) => doc.data());

        setListings(listings);
        setIsListedAll(querySnap.empty);
        setLoading(false);
      } catch (error) {
        toast.error("Could not fetch listings");
      }
    };
    fetchListings();
  }, []);

  // Pagination Load More
  const onFetchMoreListings = async () => {
    try {
      const listingRef = collection(db, "listings").withConverter(
        listingsItemConverter
      );
      const q = query(
        listingRef,
        where("offer", "==", true),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchedListing),
        limit(10)
      );
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1];

      setLastFetchedListing(lastVisible);

      const listings = querySnap.docs.map((doc) => doc.data());

      setListings((prevListings) => [...prevListings, ...listings]);
      setIsListedAll(querySnap.empty);
      setLoading(false);
    } catch (error) {
      toast.error("Could not fetch listings");
    }
  };

  return (
    <div className="category">
      <header>
        <p className="pageHeader">Offers</p>
      </header>

      {loading ? (
        <Spinner />
      ) : listings && listings.length > 0 ? (
        <>
          <main>
            <ul className="categoryListings">
              {listings.map((listing) => (
                <ListingItem key={listing.id} listing={listing} />
              ))}
            </ul>
          </main>

          <br />
          <br />

          {isListedAll ? (
            <p>No More Listings</p>
          ) : (
            <p className="loadMore" onClick={onFetchMoreListings}>
              Load More
            </p>
          )}
        </>
      ) : (
        <p>There are no current offers</p>
      )}
    </div>
  );
};
