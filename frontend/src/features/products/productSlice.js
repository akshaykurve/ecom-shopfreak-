import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";
import { getErrorMessage } from "../../utils/getErrorMessage";

export const fetchProducts = createAsyncThunk(
  "products/fetchProducts",
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/products", { params });
      return { products: data.products, pagination: data.pagination };
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load products"));
    }
  }
);

export const fetchProductById = createAsyncThunk(
  "products/fetchProductById",
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get(`/products/${id}`);
      return data.product;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Product not found"));
    }
  }
);

export const fetchMyProducts = createAsyncThunk(
  "products/fetchMyProducts",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.get("/products/seller/mine");
      return data.products;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to load your products"));
    }
  }
);

export const createProduct = createAsyncThunk(
  "products/createProduct",
  async (productData, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.post("/products", productData);
      return data.product;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to create product"));
    }
  }
);

export const updateProduct = createAsyncThunk(
  "products/updateProduct",
  async ({ id, productData }, { rejectWithValue }) => {
    try {
      const { data } = await axiosInstance.put(`/products/${id}`, productData);
      return data.product;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to update product"));
    }
  }
);

export const deleteProduct = createAsyncThunk(
  "products/deleteProduct",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/products/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(getErrorMessage(error, "Failed to delete product"));
    }
  }
);

const initialState = {
  items: [], // public listing
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  myItems: [], // seller dashboard
  current: null, // single product detail
  status: "idle",
  error: null,
};

const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.current = action.payload;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.myItems = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.myItems.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.myItems = state.myItems.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
        if (state.current?._id === action.payload._id) {
          state.current = action.payload;
        }
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.myItems = state.myItems.filter((p) => p._id !== action.payload);
      });
  },
});

export default productSlice.reducer;
