import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "../firebase.config";
import { Navigation, Pagination, Scrollbar, A11y, Autoplay } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css/bundle";
import { Spinner } from "../components/Spinner";
import { ListingsItemType } from "../type";
import { listingsItemConverter } from "../utils";

export const Slider = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<ListingsItemType[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchListings = async () => {
      const listingsRef = collection(db, "listings").withConverter(
        listingsItemConverter
      );
      const q = query(listingsRef, orderBy("timestamp", "desc"), limit(5));
      const querySnap = await getDocs(q);

      const listings = querySnap.docs.map((doc) => doc.data());

      setListings(listings);
      setLoading(false);
    };

    fetchListings();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (listings.length === 0) {
    return <></>;
  }

  return (
    <>
      <p className="exploreHeading">Recommended</p>

      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y, Autoplay]}
        slidesPerView={1}
        pagination={{ clickable: true }}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
        }}
        loop={true}
        className="swiper-container"
      >
        {listings.map(({ data, id }) => (
          <SwiperSlide
            key={id}
            onClick={() => navigate(`/category/${data.type}/${id}`)}
          >
            <div
              style={{
                background: `url(${data.imgUrls[0]}) center no-repeat`,
                backgroundSize: "cover",
              }}
              className="swiperSlideDiv"
            >
              <p className="swiperSlideText">{data.name}</p>
              <p className="swiperSlidePrice">
                ${data.discountedPrice ?? data.regularPrice}{" "}
                {data.type === "rent" && "/ month"}
              </p>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </>
  );
};
