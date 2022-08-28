import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, updateEmail, updateProfile } from "firebase/auth";
import {
  updateDoc,
  doc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import arrowRight from "../assets/svg/keyboardArrowRightIcon.svg";
import homeIcon from "../assets/svg/homeIcon.svg";
import { listingsItemConverter } from "../utils";
import { ListingsItemType } from "../type";
import { ListingItem } from "../components/ListingItem";

type formDataType = {
  name: string;
  email: string;
};

export const Profile = () => {
  const auth = getAuth();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingsItemType[]>([]);
  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState<formDataType>({
    name: auth.currentUser?.displayName || "",
    email: auth.currentUser?.email || "",
  });

  const { name, email } = formData;

  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, "listings").withConverter(
        listingsItemConverter
      );
      const q = query(
        listingsRef,
        where("userRef", "==", auth.currentUser?.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);

      const listings = querySnap.docs.map((doc) => doc.data());

      setListings(listings);
      setLoading(false);
    };
    fetchListings();
  }, [auth.currentUser?.uid]);

  const onLogout = () => {
    auth.signOut();
    navigate("/");
  };

  // FIXME: these functions are not necessary here?
  const onEdit = (id: string) => {
    navigate(`/edit-listing/${id}`);
  };
  // FIXME: just delete firestore, not storage. images are not deleted.
  const onDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      await deleteDoc(doc(db, "listings", id));
      const updatedListings = listings.filter((listing) => listing.id !== id);
      setListings(updatedListings);
      toast.success("Successfully deleted listing");
    }
  };

  const onSubmit = async () => {
    try {
      if (!auth.currentUser) return alert("User not logged in");
      const userRef = doc(db, "users", auth.currentUser.uid);

      if (auth.currentUser.displayName !== name) {
        await updateProfile(auth.currentUser, { displayName: name });
        await updateDoc(userRef, { displayName: name });
        toast.success("Name updated");
      }
      if (auth.currentUser.email !== email) {
        await updateEmail(auth.currentUser, email);
        await updateDoc(userRef, { email });
        toast.success("E-mail updated");
      }
    } catch (error) {
      toast.error("Could not update profile details");
    }
  };

  const onChange = (e: React.FormEvent<HTMLInputElement>) => {
    const element = e.currentTarget || e.target; // HELP: Is this O.K.?
    setFormData((prevState) => ({
      ...prevState,
      [element.id]: element.value,
    }));
  };

  return (
    <div className="profile">
      <header className="profileHeader">
        <p className="pageHeader">My Profile</p>
        <button type="button" className="logOut" onClick={onLogout}>
          Logout
        </button>
      </header>

      <main>
        <div className="profileDetailsHeader">
          <p className="profileDetailsText">Personal Details</p>
          <button
            className="changePersonalDetails"
            onClick={() => {
              changeDetails && onSubmit();
              setChangeDetails((prevState) => !prevState);
            }}
            type="button"
          >
            {changeDetails ? "done" : "change"}
          </button>
        </div>

        <div className="profileCard">
          <form>
            <input
              type="text"
              id="name"
              className={!changeDetails ? "profileName" : "profileNameActive"}
              disabled={!changeDetails}
              value={name}
              onChange={onChange}
            />
            <input
              type="email"
              id="email"
              className={!changeDetails ? "profileEmail" : "profileEmailActive"}
              disabled={!changeDetails}
              value={email}
              onChange={onChange}
            />
          </form>
        </div>

        <Link to="/create-listing" className="createListing">
          <img src={homeIcon} alt="home" />
          <p>Sell or rent your home</p>
          <img src={arrowRight} alt="arrow right" />
        </Link>

        {!loading && listings?.length > 0 && (
          <>
            <p className="listingText">Your Listings</p>
            <ul className="listingsList">
              {listings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing}
                  onDelete={onDelete}
                  onEdit={onEdit}
                />
              ))}
            </ul>
          </>
        )}
      </main>
    </div>
  );
};
