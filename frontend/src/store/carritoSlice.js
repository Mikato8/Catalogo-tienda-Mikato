import { createSlice } from '@reduxjs/toolkit';

const carritoSlice = createSlice({
  name: 'carrito',
  initialState: JSON.parse(localStorage.getItem('mikato-carrito') || '[]'),
  reducers: {
    agregar: (state, action) => {
      const item = state.find((producto) => producto.id === action.payload.id);

      if (item) {
        item.cantidad += action.payload.cantidad || 1;
      } else {
        state.push({
          ...action.payload,
          cantidad: action.payload.cantidad || 1,
        });
      }
    },
    quitar: (state, action) => state.filter((item) => item.id !== action.payload),
    actualizar: (state, action) => {
      const item = state.find((producto) => producto.id === action.payload.id);

      if (item) {
        item.cantidad = Math.max(1, action.payload.cantidad);
      }
    },
    vaciar: () => [],
  },
});

export const {
  agregar,
  quitar,
  actualizar,
  vaciar,
} = carritoSlice.actions;

export default carritoSlice.reducer;
