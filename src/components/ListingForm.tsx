import { FormDataType, ListingsItemDataType } from "../type";

type PropsType = {
  formData: FormDataType;
  onSubmit: (e: React.FormEvent) => void;
  onMutate: (
    e: React.ChangeEvent<HTMLInputElement> &
      React.ChangeEvent<HTMLTextAreaElement> &
      React.MouseEvent<HTMLButtonElement>
  ) => void;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUpload: (e: React.MouseEvent<HTMLButtonElement>) => void;
  handleDeleteImage: (e: React.MouseEvent<HTMLButtonElement>) => void;
  uploadedImages: ListingsItemDataType["imgUrls"];
  inputRef: React.RefObject<HTMLInputElement>;
  geolocationEnabled: boolean;
};

export const ListingForm = ({
  formData,
  onSubmit,
  onMutate,
  handleChange,
  handleUpload,
  handleDeleteImage,
  uploadedImages,
  inputRef,
  geolocationEnabled,
}: PropsType) => {
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    parking,
    furnished,
    address,
    offer,
    regularPrice,
    discountedPrice,
    latitude,
    longitude,
  } = formData;

  return (
    <form onSubmit={onSubmit}>
      <label className="formLabel">Sell / Rent</label>
      <div className="formButtons">
        <button
          type="button"
          className={type === "sale" ? "formButtonActive" : "formButton"}
          id="type"
          value="sale"
          onClick={onMutate}
        >
          Sell
        </button>
        <button
          type="button"
          className={type === "rent" ? "formButtonActive" : "formButton"}
          id="type"
          value="rent"
          onClick={onMutate}
        >
          Rent
        </button>
      </div>

      <label className="formLabel">Name</label>
      <input
        className="formInputName"
        type="text"
        id="name"
        value={name}
        onChange={onMutate}
        maxLength={32}
        minLength={10}
        required
      />

      <div className="formRooms flex">
        <div>
          <label className="formLabel">Bedrooms</label>
          <input
            className="formInputSmall"
            type="number"
            id="bedrooms"
            value={bedrooms}
            onChange={onMutate}
            min="1"
            max="50"
            required
          />
        </div>
        <div>
          <label className="formLabel">Bathrooms</label>
          <input
            className="formInputSmall"
            type="number"
            id="bathrooms"
            value={bathrooms}
            onChange={onMutate}
            min="1"
            max="50"
            required
          />
        </div>
      </div>

      <label className="formLabel">Parking spot</label>
      <div className="formButtons">
        <button
          className={parking ? "formButtonActive" : "formButton"}
          type="button"
          id="parking"
          value="true"
          onClick={onMutate}
        >
          Yes
        </button>
        <button
          className={
            !parking && parking !== null ? "formButtonActive" : "formButton"
          }
          type="button"
          id="parking"
          value="false"
          onClick={onMutate}
        >
          No
        </button>
      </div>

      <label className="formLabel">Furnished</label>
      <div className="formButtons">
        <button
          className={furnished ? "formButtonActive" : "formButton"}
          type="button"
          id="furnished"
          value="true"
          onClick={onMutate}
        >
          Yes
        </button>
        <button
          className={
            !furnished && furnished !== null ? "formButtonActive" : "formButton"
          }
          type="button"
          id="furnished"
          value="false"
          onClick={onMutate}
        >
          No
        </button>
      </div>

      <label className="formLabel">Address</label>
      <textarea
        className="formInputAddress"
        id="address"
        value={address}
        onChange={onMutate}
        required
      />

      {!geolocationEnabled && (
        <div className="formLatLng flex">
          <div>
            <label className="formLabel">Latitude</label>
            <input
              className="formInputSmall"
              type="number"
              id="latitude"
              value={latitude}
              onChange={onMutate}
              required
            />
          </div>
          <div>
            <label className="formLabel">Longitude</label>
            <input
              className="formInputSmall"
              type="number"
              id="longitude"
              value={longitude}
              onChange={onMutate}
              required
            />
          </div>
        </div>
      )}

      <label className="formLabel">Offer</label>
      <div className="formButtons">
        <button
          className={offer ? "formButtonActive" : "formButton"}
          type="button"
          id="offer"
          value="true"
          onClick={onMutate}
        >
          Yes
        </button>
        <button
          className={
            !offer && offer !== null ? "formButtonActive" : "formButton"
          }
          type="button"
          id="offer"
          value="false"
          onClick={onMutate}
        >
          No
        </button>
      </div>

      <label className="formLabel">Regular Price</label>
      <div className="formPriceDiv">
        <input
          className="formInputSmall"
          type="number"
          id="regularPrice"
          value={regularPrice}
          onChange={onMutate}
          min="50"
          max="750000000"
          required
        />
        {type === "rent" && <p className="formPriceText">$ / Month</p>}
      </div>

      {offer && (
        <>
          <label className="formLabel">Discounted Price</label>
          <input
            className="formInputSmall"
            type="number"
            id="discountedPrice"
            value={discountedPrice}
            onChange={onMutate}
            min="50"
            max="750000000"
            required={offer}
          />
        </>
      )}

      <label className="formLabel">Images</label>
      <p className="imagesInfo">
        The first image will be the cover (max 6).
        <br />
        Each image must be under 2MB.
      </p>

      <input
        type="file"
        onChange={handleChange}
        max="6"
        accept=".jpg,.png,.jpeg"
        multiple
        ref={inputRef}
        hidden
      />
      <button
        type="button"
        onClick={handleUpload}
        style={{
          backgroundColor: "black",
          color: "white",
          fontSize: "16px",
          padding: "10px 60px",
          borderRadius: "5px",
          margin: "10px 0px",
          cursor: "pointer",
        }}
      >
        Upload files
      </button>
      {uploadedImages && (
        <ul
          style={{
            listStyle: "none",
            padding: "0px",
          }}
        >
          {uploadedImages.map((url, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "1em",
              }}
            >
              <img
                src={url}
                alt=""
                width="200"
                height="200"
                loading="lazy"
                style={{ objectFit: "cover" }}
              />
              <button
                type="button"
                onClick={handleDeleteImage}
                data-url={url}
                style={{
                  backgroundColor: "black",
                  color: "white",
                  fontSize: "13px",
                  padding: "10px",
                  borderRadius: "5px",
                  margin: "10px",
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      <button type="submit" className="primaryButton createListingButton">
        Submit Listing
      </button>
    </form>
  );
};
