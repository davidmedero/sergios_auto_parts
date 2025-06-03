"use client";

import React, {
  createContext,
  ReactNode,
  useContext,
  useState,
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
  const [cartId, setCartId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [cartOpen, setCartOpen] = useState<{ right: boolean }>({ right: false });

  // ─── ADD LINE (Optmistic, single‐call on first add) ─────────────────────────────
  //
  // If there is no cartId yet, we call cartCreate({ lines: [...] }) in one shot.
  // If there is already a cartId, we call cartLinesAdd.
  //
  // In both cases:
  //   1. We immediately push a “temporary line” into state so the UI moves instantly.
  //   2. We fire off the mutation.  When Shopify returns, we replace state with the canonical data.
  //
  async function addLine(variantId: string, quantity: number) {
    // 2) If no cartId, CREATE (and ADD the line in one shot).
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
          // Replace our “temp line” with Shopify’s actual data:
          setCartId(payload.cart.id);
          setCheckoutUrl(payload.cart.checkoutUrl);
          setLines(payload.cart.lines.edges.map((edge) => edge.node));
        } else {
          // If creation failed, roll back our temp line
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
        // Roll back the temp line on error:
      }
    } catch (error) {
      console.error("Error calling cartLinesAdd:", error);
    }
  }

  // ─── UPDATE LINE QUANTITY (Optimistic, no re‐sync on success) ──────────────────
  //
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
        // Update the checkoutUrl in case it changed:
        setCheckoutUrl(payload.cart.checkoutUrl);
        // We do NOT re‐set the entire lines array here (that causes flicker).
        // We trust our optimistic quantity.  Only if you detect a mismatch,
        // you could re‐sync by calling setLines(...) with payload.cart.lines.
      } else {
        console.error("cartLinesUpdate errors:", payload?.userErrors);
        // (Optional) Roll back to the old quantity if you store it first.
      }
    } catch (error) {
      console.error("Error calling cartLinesUpdate:", error);
      // (Optional) Roll back local state here if you captured the old value.
    }
  }

  // ─── REMOVE LINE (Optimistic) ─────────────────────────────────────────────────
  //
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
        // No need to re‐set lines(...) again; we trust our optimistic removal
      } else {
        console.error("cartLinesRemove errors:", payload?.userErrors);
        // Roll back if removal failed:
        setLines(oldLines);
      }
    } catch (error) {
      console.error("Error calling cartLinesRemove:", error);
      // Roll back on network / server error:
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