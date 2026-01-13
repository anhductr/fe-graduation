import React, { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cartApi } from "../services/cartApi";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
};

export const CartProvider = ({ children }) => {
    const queryClient = useQueryClient();
    const { token } = useAuth();

    // Fetch cart data
    const {
        data: cartData,
        isLoading: isCartLoading,
        error: cartError,
        refetch: refetchCart
    } = useQuery({
        queryKey: ["cart"],
        queryFn: async () => {
            const response = await cartApi.getMyCart();
            return response.data.result;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
        enabled: !!token,
    });

    // Add to cart mutation
    const addToCartMutation = useMutation({
        mutationFn: cartApi.addToCart,
        onSuccess: () => {
            queryClient.invalidateQueries(["cart"]);
        },
        onError: (error) => {
            console.error("Add to cart failed:", error);
        },
    });

    // Update cart mutation
    const updateCartMutation = useMutation({
        mutationFn: cartApi.updateCart,
        onSuccess: () => {
            queryClient.invalidateQueries(["cart"]);
        },
        onError: (error) => {
            console.error("Update cart failed:", error);
        },
    });

    // Delete items mutation
    const deleteItemsMutation = useMutation({
        mutationFn: cartApi.deleteItems,
        onSuccess: () => {
            queryClient.invalidateQueries(["cart"]);
        },
        onError: (error) => {
            console.error("Delete items failed:", error);
        },
    });

    const value = {
        // Cart data
        cart: cartData,
        items: cartData?.items || [],
        totalPrice: cartData?.totalPrice || 0,
        itemCount: cartData?.items?.length || 0,

        // Loading states
        isCartLoading,
        isAddingToCart: addToCartMutation.isPending,
        isUpdatingCart: updateCartMutation.isPending,
        isDeletingItems: deleteItemsMutation.isPending,

        // Errors
        cartError,

        // Actions
        addToCart: (data) => addToCartMutation.mutateAsync(data),
        updateCart: (data) => updateCartMutation.mutateAsync(data),
        deleteItems: (cartItemIds) => deleteItemsMutation.mutateAsync(cartItemIds),
        refetchCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export default CartContext;
