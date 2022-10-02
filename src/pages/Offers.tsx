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

const PER_PAGE = 5;
let sizeAllListings: number;
let sizeDisplayedListings: number;

export const Offers = () => {
  const [listings, setListings] = useState<ListingsItemType[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetchedListing, setLastFetchedListing] =
    useState<QueryDocumentSnapshot>();
  const [isListedAll, setIsListedAll] = useState(false);

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
          limit(PER_PAGE)
        );
        const querySnap = await getDocs(q);

        const queryAll = query(listingRef, where("offer", "==", true));
        const querySnapAll = await getDocs(queryAll);
        sizeAllListings = querySnapAll.size;

        const lastVisible = querySnap.docs[querySnap.docs.length - 1];

        setLastFetchedListing(lastVisible);

        const listings = querySnap.docs.map((doc) => doc.data());
        sizeDisplayedListings = querySnap.size;

        setListings(listings);

        if (sizeAllListings <= PER_PAGE) {
          setIsListedAll(true);
        } else {
          setIsListedAll(false);
        }

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
        limit(PER_PAGE)
      );
      const querySnap = await getDocs(q);

      const lastVisible = querySnap.docs[querySnap.docs.length - 1];

      setLastFetchedListing(lastVisible);

      const listings = querySnap.docs.map((doc) => doc.data());
      sizeDisplayedListings += querySnap.size;

      setListings((prevListings) => [...prevListings, ...listings]);

      if (sizeDisplayedListings === sizeAllListings) {
        setIsListedAll(true);
      } else {
        setIsListedAll(false);
      }

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
      ) : listings.length > 0 ? (
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
