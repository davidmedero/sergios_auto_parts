"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
  useEffect,
} from "react";
import {
  storefront,
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CartPayload,
  CartLine,
} from "@/lib/shopify";

export interface CartContextType {
  cartId: string | null;
  checkoutUrl: string | null;
  lines: CartLine[];
  addLine: (variantId: string, quantity: number) => Promise<void>;
  updateLine: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  cartOpen: { right: boolean };
  setCartOpen: React.Dispatch<React.SetStateAction<{ right: boolean }>>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within <CartProvider>");
  return ctx;
}

export function CartProvider({ children }: { children: ReactNode }) {
  // 1) Lazy-init from localStorage, if available:
  const [cartId, setCartId] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("cartId");
    }
    return null;
  });

  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("checkoutUrl");
    }
    return null;
  });

  const [lines, setLines] = useState<CartLine[]>(() => {
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("cartLines");
      if (raw) {
        try {
          return JSON.parse(raw);
        } catch {
          console.error("Failed to parse cartLines from localStorage");
        }
      }
    }
    return [];
  });

  const [cartOpen, setCartOpen] = useState<{ right: boolean }>({ right: false });

  // 2) Whenever cartId, checkoutUrl, or lines change, sync to localStorage:
  useEffect(() => {
    if (typeof window === "undefined") return;

    if (cartId === null) {
      // No cart: remove everything
      localStorage.removeItem("cartId");
      localStorage.removeItem("checkoutUrl");
      localStorage.removeItem("cartLines");
    } else {
      // Save current values
      localStorage.setItem("cartId", cartId);
      if (checkoutUrl) {
        localStorage.setItem("checkoutUrl", checkoutUrl);
      } else {
        localStorage.removeItem("checkoutUrl");
      }
      localStorage.setItem("cartLines", JSON.stringify(lines));
    }
  }, [cartId, checkoutUrl, lines]);

  // 3) Mutations (add, update, remove) remain largely the same,
  //    but now state changes propagate to localStorage automatically via the useEffect above.

  async function addLine(variantId: string, quantity: number) {
    // If no cartId, CREATE (and ADD the line in one shot).
    if (!cartId) {
      try {
        const variables = {
          input: {
            lines: [{ merchandiseId: variantId, quantity }],
          },
        };
        const resp = await storefront<{ cartCreate: CartPayload }>(
          CART_CREATE_MUTATION,
          variables
        );
        const payload = resp.cartCreate;
        if (payload && payload.cart) {
          setCartId(payload.cart.id);
          setCheckoutUrl(payload.cart.checkoutUrl);
          setLines(payload.cart.lines.edges.map((edge) => edge.node));
        } else {
          console.error("cartCreate errors:", payload?.userErrors);
        }
      } catch (error) {
        console.error("Error calling cartCreate:", error);
      }

      return;
    }

    // 3) Otherwise, we already have cartId → just do cartLinesAdd
    const existingCartId = cartId; // read from state
    try {
      const variables = {
        cartId: existingCartId,
        lines: [{ merchandiseId: variantId, quantity }],
      };
      const resp = await storefront<{ cartLinesAdd: CartPayload }>(
        CART_LINES_ADD_MUTATION,
        variables
      );
      const payload = resp.cartLinesAdd;
      if (payload && payload.cart) {
        setCartId(payload.cart.id);
        setCheckoutUrl(payload.cart.checkoutUrl);
        setLines(payload.cart.lines.edges.map((edge) => edge.node));
      } else {
        console.error("cartLinesAdd errors:", payload?.userErrors);
      }
    } catch (error) {
      console.error("Error calling cartLinesAdd:", error);
    }
  }

  async function updateLine(lineId: string, quantity: number) {
    if (!cartId) {
      console.warn("No cartId; cannot update line");
      return;
    }

    // 1) Immediately update local state so UI shows the new quantity at once:
    setLines((prev) =>
      prev.map((ln) => (ln.id === lineId ? { ...ln, quantity } : ln))
    );

    // 2) Fire off the GraphQL mutation in the background:
    try {
      const variables = {
        cartId,
        lines: [{ id: lineId, quantity }],
      };
      const resp = await storefront<{ cartLinesUpdate: CartPayload }>(
        CART_LINES_UPDATE_MUTATION,
        variables
      );
      const payload = resp.cartLinesUpdate;
      if (payload && payload.cart) {
        setCheckoutUrl(payload.cart.checkoutUrl);
      } else {
        console.error("cartLinesUpdate errors:", payload?.userErrors);
      }
    } catch (error) {
      console.error("Error calling cartLinesUpdate:", error);
    }
  }

  async function removeLine(lineId: string) {
    if (!cartId) {
      console.warn("No cartId; cannot remove line");
      return;
    }

    // 1) Immediately remove from local state for instant UI feedback
    const oldLines = lines;
    setLines((prev) => prev.filter((ln) => ln.id !== lineId));

    // 2) Fire off the GraphQL call:
    try {
      const variables = {
        cartId,
        lineIds: [lineId],
      };
      const resp = await storefront<{ cartLinesRemove: CartPayload }>(
        CART_LINES_REMOVE_MUTATION,
        variables
      );
      const payload = resp.cartLinesRemove;
      if (payload && payload.cart) {
        setCheckoutUrl(payload.cart.checkoutUrl);
      } else {
        console.error("cartLinesRemove errors:", payload?.userErrors);
        setLines(oldLines);
      }
    } catch (error) {
      console.error("Error calling cartLinesRemove:", error);
      setLines(oldLines);
    }
  }

  return (
    <CartContext.Provider
      value={{
        cartId,
        checkoutUrl,
        lines,
        addLine,
        updateLine,
        removeLine,
        cartOpen,
        setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}