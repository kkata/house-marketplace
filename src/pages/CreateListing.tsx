import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/Spinner";
import { toast } from "react-toastify";
import { storeImage } from "../utils";
import { FormDataType } from "../type";
import { ListingForm } from "../components/ListingForm";

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

export const CreateListing = () => {
  // handle geolocation input is not implemented
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [geolocationEnabled, setGeolocationEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormDataType>(initialFormState);

  const {
    address,
    regularPrice,
    discountedPrice,
    images,
    latitude,
    longitude,
  } = formData;

  const auth = getAuth();
  const navigate = useNavigate();

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

    if (images === undefined) {
      return;
    }

    setLoading(true);

    if (discountedPrice !== undefined && discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discounted price must be less than regular price");
      return;
    }

    if (images.length > 6) {
      setLoading(false);
      toast.error("Maximum 6 images allowed");
      return;
    }

    const _geolocation = {
      lat: latitude,
      lng: longitude,
    };

    if (geolocationEnabled) {
      const response = await fetch(
        `http://api.positionstack.com/v1/forward?access_key=${process.env.REACT_APP_POSITIONSTACK_API_KEY}&query=${address}`
      );
      const data = await response.json();

      _geolocation.lat = data.data[0]?.latitude ?? 0;
      _geolocation.lng = data.data[0]?.longitude ?? 0;

      const _location = data.data[0] ? data.data[0]?.label : undefined;

      if (_location === undefined || _location.includes("undefined")) {
        setLoading(false);
        toast.error("Please enter a correct address");
        return;
      }
    }

    const imgUrls = await Promise.all(
      Array.from(images).map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Error uploading images");
      return;
    });

    const formDataCopy = {
      ...formData,
      imgUrls,
      geolocation: _geolocation,
      timestamp: serverTimestamp(),
    };

    formDataCopy.location = address;
    delete formDataCopy.images;
    delete formDataCopy.address;
    !formDataCopy.offer && delete formDataCopy.discountedPrice;

    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    setLoading(false);
    toast.success("Listing created");
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

    // Files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files as FileList,
      }));
    }

    // Text, Boolean, Number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: toggleFlag ?? e.target.value,
      }));
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <ListingForm
      ActionText="Create"
      formData={formData}
      onMutate={onMutate}
      onSubmit={onSubmit}
      geolocationEnabled={geolocationEnabled}
    />
  );
};
