import { colores } from "./colores";

// El tema que reparte el ThemeProvider a toda la app.
// Por ahora solo tiene colores; más adelante se pueden sumar
// tamaños de letra, espaciados, radios de borde, etc.
export const tema = {
  colores,
};

export type Tema = typeof tema;
