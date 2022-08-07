import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, Navigate } from "react-router-dom";
import { getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebase.config";
import { Spinner } from "../components/Spinner";
import shareIcon from "../assets/svg/shareIcon.svg";
import { ListingsItemDataType } from "../type";
import { listingsConverter } from "../utils";

export const Listing = () => {
  const [listing, setListing] = useState<ListingsItemDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [shareLinkCopied, setShareLinkCopied] = useState(false);

  const navigate = useNavigate();
  const params = useParams();
  const auth = getAuth();

  useEffect(() => {
    const fetchListing = async () => {
      if (!params.listingId) {
        return;
      }
      const docRef = doc(db, "listings", params.listingId).withConverter(
        listingsConverter
      );
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        console.log(docSnapshot.data());
        setListing(docSnapshot.data());
        setLoading(false);
      }
    };

    fetchListing();
  }, [navigate, params.listingId]);

  return <div>Listing</div>;
};
