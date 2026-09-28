import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const fetchCart = createAsyncThunk("cart/fetchCart", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get("/cart");
    return data.cart;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Failed to load cart"));
  }
});

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, size, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/cart/items", { productId, size, quantity });
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to add item to cart"));
    }
  }
);

export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ productId, size, quantity }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/cart/items/${productId}`, { size, quantity });
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update cart item"));
    }
  }
);

export const removeCartItem = createAsyncThunk(
  "cart/removeCartItem",
  async ({ productId, size }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.delete(`/cart/items/${productId}`, { data: { size } });
      return data.cart;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to remove cart item"));
    }
  }
);

export const clearCart = createAsyncThunk("cart/clearCart", async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.delete("/cart");
    return data.cart;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, "Failed to clear cart"));
  }
});

const initialState = {
  cart: null, // { _id, items: [{product, size, quantity}] }
  status: "idle",
  error: null,
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    resetCart: (state) => {
      state.cart = null;
    },
  },
  extraReducers: (builder) => {
    // Every thunk here returns the whole updated cart on success, so they
    // all share the same fulfilled/rejected handling.
    const setCart = (state, action) => {
      state.status = "succeeded";
      state.cart = action.payload;
    };
    const setError = (state, action) => {
      state.status = "failed";
      state.error = action.payload;
    };

    builder
      .addCase(fetchCart.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, setError)
      .addCase(addToCart.fulfilled, setCart)
      .addCase(addToCart.rejected, setError)
      .addCase(updateCartItem.fulfilled, setCart)
      .addCase(updateCartItem.rejected, setError)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(removeCartItem.rejected, setError)
      .addCase(clearCart.fulfilled, setCart)
      .addCase(clearCart.rejected, setError);
  },
});

export const { resetCart } = cartSlice.actions;
export default cartSlice.reducer;
