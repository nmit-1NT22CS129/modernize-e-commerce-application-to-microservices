import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { assets } from "../assets/assets";
import Title from "../components/Title";
import ProductItem from "../components/ProductItem";
import { useLocation, useNavigate } from "react-router-dom";
import { onVoiceCommand } from "../utils/voiceBus";

const Collection = () => {
  const { products, search, showSearch } = useContext(ShopContext);
  const location = useLocation();
  const navigate = useNavigate();
  const productRefs = useRef([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showFilter, setShowFilter] = useState(false);

  /* ================= URL PARAMS ================= */
  const query = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const category = query.get("category");          // men | women | kids | null
  const subCategory = query.get("subCategory");    // topwear | bottomwear | winterwear | null
  const price_lte = query.get("price_lte");
  const price_gte = query.get("price_gte");
  const sort = query.get("sort");                  // low-high | high-low

  /* ================= APPLY FILTERS ================= */
  useEffect(() => {
    let list = [...products];

    if (category) {
      list = list.filter(p => p.category.toLowerCase() === category.toLowerCase());
    }

    if (subCategory) {
      list = list.filter(p => p.subCategory.toLowerCase() === subCategory.toLowerCase());
    }

    if (price_lte) {
      list = list.filter(p => p.price <= Number(price_lte));
    }

    if (price_gte) {
      list = list.filter(p => p.price >= Number(price_gte));
    }

    if (showSearch && search) {
      list = list.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (sort === "low-high") list.sort((a, b) => a.price - b.price);
    if (sort === "high-low") list.sort((a, b) => b.price - a.price);

    setFilteredProducts(list);
  }, [products, search, showSearch, location.search]);

  /* ================= URL UPDATE HELPERS ================= */
  const updateParam = (key, value) => {
    const params = new URLSearchParams(location.search);
    value ? params.set(key, value) : params.delete(key);
    navigate(`/collection?${params.toString()}`, { replace: true });
  };

  /* ================= VOICE LIST CONTROL ================= */
  useEffect(() => {
    const unsubscribe = onVoiceCommand(cmd => {
      cmd = cmd.toLowerCase();

      if (cmd.includes("scroll down")) {
        window.scrollBy({ top: 400, behavior: "smooth" });
        return;
      }

      if (cmd.includes("scroll up")) {
        window.scrollBy({ top: -400, behavior: "smooth" });
        return;
      }

      const openMatch = cmd.match(/open product (\d+)/);
      if (openMatch) {
        const idx = Number(openMatch[1]) - 1;
        productRefs.current[idx]?.querySelector("a")?.click();
      }
    });

    return unsubscribe;
  }, []);

  /* ================= RENDER ================= */
  return (
    <div className="flex flex-col sm:flex-row gap-1 sm:gap-10 pt-10 border-t">

      {/* FILTERS */}
      <div className="min-w-60">
        <p onClick={() => setShowFilter(!showFilter)}
          className="my-2 text-xl flex items-center cursor-pointer gap-2">
          FILTERS
          <img className={`h-3 sm:hidden ${showFilter ? "rotate-90" : ""}`}
            src={assets.dropdown_icon} alt="" />
        </p>

        {/* CATEGORY */}
        <div className={`border pl-5 py-3 mt-6 ${showFilter ? "" : "hidden"} sm:block`}>
          <p className="mb-3 text-sm font-medium">CATEGORIES</p>
          {["men", "women", "kids"].map(c => (
            <label key={c} className="flex gap-2 text-sm">
              <input
                type="radio"
                checked={category === c}
                onChange={() => updateParam("category", c)}
              /> {c}
            </label>
          ))}
        </div>

        {/* SUBCATEGORY */}
        <div className={`border pl-5 py-3 my-5 ${showFilter ? "" : "hidden"} sm:block`}>
          <p className="mb-3 text-sm font-medium">TYPE</p>
          {["topwear", "bottomwear", "winterwear"].map(s => (
            <label key={s} className="flex gap-2 text-sm">
              <input
                type="radio"
                checked={subCategory === s}
                onChange={() => updateParam("subCategory", s)}
              /> {s}
            </label>
          ))}
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="flex-1">
        <div className="flex justify-between mb-4">
          <Title text1="ALL" text2="COLLECTIONS" />
          <select
            value={sort || "relavent"}
            onChange={e => updateParam("sort", e.target.value === "relavent" ? null : e.target.value)}
            className="border px-2"
          >
            <option value="relavent">Sort by: Relevant</option>
            <option value="low-high">Low to High</option>
            <option value="high-low">High to Low</option>
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map((item, i) => (
            <div key={item._id} ref={el => productRefs.current[i] = el}>
              <ProductItem {...item} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Collection;
