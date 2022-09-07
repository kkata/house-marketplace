import React, { useState, useEffect, useRef } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate, useParams } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { toast } from "react-toastify";
import { listingsConverter, storeImage } from "../utils";
import { FormDataType, ListingsItemDataType } from "../type";
import { ListingForm } from "../components/ListingForm";
import { deleteObject, getStorage, ref } from "firebase/storage";

const initialFormState: FormDataType = {
  type: "rent",
  name: "",
  bedrooms: 1,
  bathrooms: 1,
  parking: false,
  furnished: false,
  address: "",
  offer: false,
  regularPrice: 0,
  discountedPrice: 0,
  latitude: 0,
  longitude: 0,
  userRef: "",
};

const storage = getStorage();
// handle geolocation input is not implemented
const geolocationEnabled = true;

export const EditListing = () => {
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState<ListingsItemDataType>();

  const [formData, setFormData] = useState<FormDataType>(initialFormState);

  const inputRef = useRef<HTMLInputElement>(null);

  const [uploadedImages, setUploadedImages] = useState<
    ListingsItemDataType["imgUrls"]
  >([]);

  const { address, regularPrice, discountedPrice, latitude, longitude } =
    formData;

  const auth = getAuth();
  const navigate = useNavigate();
  const params = useParams();

  // Redirect if listing is not user's
  useEffect(() => {
    if (listing && listing.userRef !== auth.currentUser?.uid) {
      toast.error("You can not edit this listing");
      navigate("/");
    }
  });

  // Fetch listing to edit
  useEffect(() => {
    setLoading(true);
    const fetchListing = async () => {
      if (!params.listingId) {
        return;
      }
      const docRef = doc(db, "listings", params.listingId).withConverter(
        listingsConverter
      );
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        setListing(docSnapshot.data());
        setFormData({
          ...docSnapshot.data(),
          address: docSnapshot.data().location,
          latitude: docSnapshot.data().geolocation.lat,
          longitude: docSnapshot.data().geolocation.lng,
        });
        setUploadedImages(docSnapshot.data().imgUrls);
        setLoading(false);
      } else {
        navigate("/");
        toast.error("Listing does not exist");
      }
    };

    fetchListing();
  }, [navigate, params.listingId]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setFormData({ ...initialFormState, userRef: user.uid });
      } else {
        navigate("/sign-in");
      }
    });

    return unsubscribe;
  }, [auth, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedImages.length) {
      toast.error("Please upload at least one image");
      return;
    }
    if (!params.listingId) {
      return;
    }

    setLoading(true);

    if (discountedPrice !== undefined && discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discounted price must be less than regular price");
      return;
    }

    if (uploadedImages.length > 6) {
      setLoading(false);
      toast.error("Maximum 6 images allowed");
      return;
    }

    const _geolocation = {
      lat: latitude,
      lng: longitude,
    };

    if (geolocationEnabled) {
      await fetch(
        `https://us1.locationiq.com/v1/search?key=${process.env.REACT_APP_LOCATIONIQ_API_KEY}&q=${address}&format=json`
      )
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            console.error("Geolocation not found");
            setLoading(false);
            toast.error("Please enter a correct address");
            return;
          }
          // data[0] is the first result. It would be the most accurate geolocation.
          _geolocation.lat = parseFloat(data[0].lat);
          _geolocation.lng = parseFloat(data[0].lon);
        })
        .catch((error) => {
          console.error(error);
        });
    }

    const formDataCopy = {
      ...formData,
      imgUrls: uploadedImages,
      geolocation: _geolocation,
      timestamp: serverTimestamp(),
    };

    formDataCopy.location = address;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    // Update listing
    const docRef = doc(db, "listings", params.listingId);
    await updateDoc(docRef, formDataCopy);
    setLoading(false);
    toast.success("Listing saved");
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  const onMutate = (
    e: React.ChangeEvent<HTMLInputElement> &
      React.ChangeEvent<HTMLTextAreaElement> &
      React.MouseEvent<HTMLButtonElement>
  ) => {
    let toggleFlag: boolean | null = null;

    if (e.target.value === "true") {
      toggleFlag = true;
    }
    if (e.target.value === "false") {
      toggleFlag = false;
    }

    // Text, Boolean, Number
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: toggleFlag ?? e.target.value,
    }));
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    setLoading(true);

    const urls = await Promise.all(
      Array.from(fileList).map((image) => storeImage(image))
    ).catch(() => {
      console.error("Error uploading images");
      setLoading(false);
      return;
    });

    if (urls) {
      setUploadedImages((prevState) => {
        return [...prevState, ...urls];
      });
    }
    setLoading(false);
  };

  const handleUpload = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    inputRef.current?.click();
  };

  const handleDeleteImage = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    setLoading(true);

    const targetUrl = e.currentTarget.dataset.url;
    const targetImageRef = ref(storage, targetUrl);

    deleteObject(targetImageRef)
      .then(() => {
        setUploadedImages((prevState) =>
          prevState.filter((url) => url !== targetUrl)
        );
        console.log("File deleted successfully");
        setLoading(false);
      })
      .catch((error) => {
        console.error("Uh-oh, an error occurred!");
        setLoading(false);
      });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="profile">
      <header>
        <p className="pageHeader">Edit Listing</p>
      </header>
      <main>
        <ListingForm
          formData={formData}
          onMutate={onMutate}
          onSubmit={onSubmit}
          handleChange={handleChange}
          handleUpload={handleUpload}
          handleDeleteImage={handleDeleteImage}
          uploadedImages={uploadedImages}
          inputRef={inputRef}
          geolocationEnabled={geolocationEnabled}
        />
      </main>
    </div>
  );
};
