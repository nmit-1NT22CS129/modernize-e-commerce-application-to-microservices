import { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {

    const currency = 'Rs ';
    const delivery_fee = 10;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState({});
    const [products, setProducts] = useState([]);
    const [token, setToken] = useState('');
    const [lastViewedProductId, setLastViewedProductId] = useState(null);

    const navigate = useNavigate();

    // ========== ADD TO CART ==========
    const addToCart = async (itemId, size) => {

        if (!size) {
            toast.error('Select Product Size');
            return;
        }

        let cartData = structuredClone(cartItems);

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] += 1;
            } else {
                cartData[itemId][size] = 1;
            }
        } else {
            cartData[itemId] = {};
            cartData[itemId][size] = 1;
        }

        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(
                    backendUrl + '/api/cart/add',
                    { itemId, size },
                    { headers: { token } }
                );
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    };

    // ========== REMOVE FROM CART (NEW - FOR VOICE) ==========
    const removeFromCart = async (itemId, size) => {

        let cartData = structuredClone(cartItems);

        if (cartData[itemId] && cartData[itemId][size]) {
            delete cartData[itemId][size];

            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        }

        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(
                    backendUrl + '/api/cart/remove',
                    { itemId, size },
                    { headers: { token } }
                );
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    };

    // ========== UPDATE QUANTITY (INCREASE / DECREASE) ==========
    const updateQuantity = async (itemId, size, quantity) => {

        let cartData = structuredClone(cartItems);

        if (quantity <= 0) {
            delete cartData[itemId][size];

            if (Object.keys(cartData[itemId]).length === 0) {
                delete cartData[itemId];
            }
        } else {
            cartData[itemId][size] = quantity;
        }

        setCartItems(cartData);

        if (token) {
            try {
                await axios.post(
                    backendUrl + '/api/cart/update',
                    { itemId, size, quantity },
                    { headers: { token } }
                );
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    };

    // ========== GET CART COUNT ==========
    const getCartCount = () => {
        let totalCount = 0;
        for (const itemId in cartItems) {
            for (const size in cartItems[itemId]) {
                totalCount += cartItems[itemId][size];
            }
        }
        return totalCount;
    };

    // ========== GET CART AMOUNT ==========
    const getCartAmount = () => {
        let totalAmount = 0;

        for (const itemId in cartItems) {
            const itemInfo = products.find(p => p._id === itemId);

            if (!itemInfo) continue;

            for (const size in cartItems[itemId]) {
                totalAmount += itemInfo.price * cartItems[itemId][size];
            }
        }

        return totalAmount;
    };

    // ========== FETCH PRODUCTS ==========
    const getProductsData = async () => {
        try {
            const response = await axios.get(backendUrl + '/api/product/list');

            if (response.data.success) {
                setProducts(response.data.products.reverse());
            } else {
                toast.error(response.data.message);
            }

        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // ========== GET USER CART ==========
    const getUserCart = async (token) => {
        try {
            const response = await axios.post(
                backendUrl + '/api/cart/get',
                {},
                { headers: { token } }
            );

            if (response.data.success) {
                setCartItems(response.data.cartData);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    // ========== INITIAL LOAD ==========
    useEffect(() => {
        getProductsData();
    }, []);

    useEffect(() => {
        const savedToken = localStorage.getItem('token');

        if (!token && savedToken) {
            setToken(savedToken);
            getUserCart(savedToken);
        }

        if (token) {
            getUserCart(token);
        }
    }, [token]);

    const value = {
        products,
        currency,
        delivery_fee,

        search,
        setSearch,
        showSearch,
        setShowSearch,

        cartItems,
        setCartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        getCartCount,
        getCartAmount,

        lastViewedProductId,
        setLastViewedProductId,

        navigate,
        backendUrl,
        token,
        setToken
    };

    return (
        <ShopContext.Provider value={value}>
            {props.children}
        </ShopContext.Provider>
    );
};

export default ShopContextProvider;
