import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import TryOnModal from "../components/TryOnModal";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
const { productId } = useParams();
const { products, currency, addToCart } = useContext(ShopContext);

const [productData, setProductData] = useState(null);
const [image, setImage] = useState("");
const [size, setSize] = useState("");
const [showTryOn, setShowTryOn] = useState(false);

// 🔹 Load product dynamically
useEffect(() => {
if (products && products.length > 0) {
const product = products.find((p) => p._id === productId);
if (product) {
setProductData(product);
setImage(product.image?.[0] || "");
}
}
}, [productId, products]);

if (!productData) return null;

return (
<div className="border-t-2 pt-10">

  {/* ================= PRODUCT INFO ================= */}
  <div className="flex gap-12 flex-col sm:flex-row">

    {/* Product Image */}
    <div className="flex-1">
      <img src={image || "/placeholder.png" } alt="product" className="w-full rounded-md" />
    </div>

    {/* Product Details */}
    <div className="flex-1">
      <h1 className="text-2xl font-medium">
        {productData.name}
      </h1>

      <p className="mt-5 text-3xl">
        {currency}{productData.price}
      </p>

      <p className="mt-5 text-gray-500">
        {productData.description}
      </p>

      {/* ================= SIZE SELECTOR ================= */}
      <div className="flex gap-2 my-6 flex-wrap">
        {productData.sizes?.map((item, index) => (
        <button key={index} onClick={()=> setSize(item)}
          className={`border px-4 py-2 rounded-md ${
          item === size ? "border-orange-500" : "border-gray-300"
          }`}
          >
          {item}
        </button>
        ))}
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex gap-4 flex-wrap">
        <button onClick={()=> addToCart(productData._id, size)}
          className="bg-black text-white px-8 py-3 rounded-md"
          disabled={!size}
          >
          ADD TO CART
        </button>

        <button onClick={()=> setShowTryOn(true)}
          className="bg-orange-600 text-white px-8 py-3 rounded-md"
          disabled={!image}
          >
          TRY ON
        </button>
      </div>
    </div>
  </div>

  {/* ================= TRY-ON MODAL ================= */}
  {showTryOn && (
  <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
    <div className="bg-white rounded-lg relative" style={{
              width: "900px",
              maxWidth: "95vw",
              padding: "16px"
            }}>
      {/* Close Button */}
      <button onClick={()=> setShowTryOn(false)}
        className="absolute top-2 right-3 text-xl font-bold"
        >
        ✕
      </button>

      <h2 className="text-center font-semibold mb-3">
        Virtual Try-On
      </h2>

      <TryOnModal productImage={productData.image?.[0]} productType={productData.subCategory} />


    </div>
  </div>
  )}

  {/* ================= RELATED PRODUCTS ================= */}
  <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
</div>
);
};

export default Product;