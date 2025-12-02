import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'agrolink_cart_v1';

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]); // [{productId, name, pricePerUnit, unitOfMeasure, quantity, availableStock}]

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      setItems([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems((prev) => {
      const idx = prev.findIndex((p) => p.productId === (product.productId || product.id));
      const q = Math.max(1, Number(quantity) || 1);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: Math.min((next[idx].quantity + q), product.availableStock ?? Infinity) };
        return next;
      }
      return [
        ...prev,
        {
          productId: product.productId || product.id,
          name: product.name,
          pricePerUnit: product.pricePerUnit,
          unitOfMeasure: product.unitOfMeasure,
          availableStock: product.availableStock,
          farmerEmail: product?.farmer?.email || null,
          quantity: Math.min(q, product.availableStock ?? q),
        },
      ];
    });
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId));

  const updateQty = (productId, quantity) => {
    const q = Math.max(1, Number(quantity) || 1);
    setItems((prev) => prev.map((i) => (i.productId === productId ? { ...i, quantity: q } : i)));
  };

  const clear = () => setItems([]);

  const total = useMemo(() => items.reduce((acc, i) => acc + (Number(i.pricePerUnit || 0) * Number(i.quantity || 0)), 0), [items]);

  const value = useMemo(() => ({ items, addItem, removeItem, updateQty, clear, total, count: items.reduce((a, i) => a + i.quantity, 0) }), [items, total]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => useContext(CartContext);

export default CartContext;
