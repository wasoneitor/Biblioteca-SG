import type { ImageSourcePropType } from "react-native";
import { create } from "zustand";

export const GENEROS = [
  "Educativo",
  "Divulgación",
  "Idiomas",
  "Ciencia",
  "Ficción",
  "Otros",
] as const;
export type Genero = (typeof GENEROS)[number];

export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  editorial: string;
  genero: Genero;
  copias: number; // total de copias de la biblioteca
  prestadas: number; // cuántas están prestadas ahora
  portada: ImageSourcePropType | null; // require(...) para las locales, { uri } para las elegidas
}

// Lo que se carga en el formulario: sin id ni prestadas, que los maneja el store.
export type DatosLibro = Omit<Libro, "id" | "prestadas">;

type Resultado = { ok: true } | { ok: false; error: string };

// Las disponibles no se guardan: se calculan.
export function copiasDisponibles(libro: Libro) {
  return libro.copias - libro.prestadas;
}

interface LibrosStore {
  libros: Libro[];
  agregarLibro: (datos: DatosLibro) => void;
  editarLibro: (id: string, datos: DatosLibro) => Resultado;
  eliminarLibro: (id: string) => Resultado;
  prestarLibro: (id: string) => Resultado;
  devolverLibro: (id: string) => void;
}

export const useLibros = create<LibrosStore>((set, get) => ({
  libros: [
    {
      id: "1",
      titulo: "Lengua y Literatura",
      autor: "Edgar A.P.",
      editorial: "Santillana",
      genero: "Educativo",
      copias: 2,
      prestadas: 0,
      portada: require("../../assets/covers/lengua-y-literatura.png"),
    },
    {
      id: "2",
      titulo: "Los Simpson y las matemáticas",
      autor: "Simon Singh",
      editorial: "Planeta",
      genero: "Divulgación",
      copias: 1,
      prestadas: 0,
      portada: require("../../assets/covers/los-simpson-y-las-matematicas.png"),
    },
    {
      id: "3",
      titulo: "I Learn English",
      autor: "Varios Autores",
      editorial: "Richmond",
      genero: "Idiomas",
      copias: 3,
      prestadas: 0,
      portada: require("../../assets/covers/i-learn-english.png"),
    },
    {
      id: "4",
      titulo: "Biología para Dummies",
      autor: "Rene Fester Kratz",
      editorial: "Wiley",
      genero: "Ciencia",
      copias: 0,
      prestadas: 0,
      portada: require("../../assets/covers/biologia-para-dummies.png"),
    },
    {
      id: "5",
      titulo: "Orgullo y Prejuicio",
      autor: "Jane Austen",
      editorial: "Alma Clásicos Ilustrados",
      genero: "Ficción",
      copias: 2,
      prestadas: 0,
      portada: require("../../assets/covers/orgullo-y-prejuicio.png"),
    },
    {
      id: "6",
      titulo: "Don Quijote de la Mancha",
      autor: "Miguel de Cervantes Saavedra",
      editorial: "Susaeta",
      genero: "Ficción",
      copias: 1,
      prestadas: 0,
      portada: require("../../assets/covers/don-quijote-de-la-mancha.png"),
    },
    {
      id: "7",
      titulo: "Harry Potter y la piedra filosofal",
      autor: "J.K. Rowling",
      editorial: "Salamandra",
      genero: "Ficción",
      copias: 4,
      prestadas: 0,
      portada: require("../../assets/covers/harry-potter-piedra-filosofal.png"),
    },
  ],

  // ALTA
  agregarLibro: (datos) => {
    const nuevo: Libro = { ...datos, id: Date.now().toString(), prestadas: 0 };
    set((state) => ({ libros: [...state.libros, nuevo] }));
  },

  // MODIFICACIÓN
  editarLibro: (id, datos) => {
    const libro = get().libros.find((l) => l.id === id);
    if (!libro) return { ok: false, error: "No se encontró el libro." };
    // No se puede bajar el total por debajo de las copias que están prestadas.
    if (datos.copias < libro.prestadas) {
      return {
        ok: false,
        error: `Hay ${libro.prestadas} copias prestadas: no puede tener menos que eso.`,
      };
    }
    set((state) => ({
      libros: state.libros.map((l) => (l.id === id ? { ...l, ...datos } : l)),
    }));
    return { ok: true };
  },

  // BAJA
  eliminarLibro: (id) => {
    const libro = get().libros.find((l) => l.id === id);
    if (libro && libro.prestadas > 0) {
      return {
        ok: false,
        error: "No se puede eliminar un libro que tiene copias prestadas.",
      };
    }
    set((state) => ({ libros: state.libros.filter((l) => l.id !== id) }));
    return { ok: true };
  },

  // PRÉSTAMO Y DEVOLUCIÓN (los usa el módulo de alquileres)
  prestarLibro: (id) => {
    const libro = get().libros.find((l) => l.id === id);
    if (!libro) return { ok: false, error: "No se encontró el libro." };
    if (copiasDisponibles(libro) <= 0) {
      return {
        ok: false,
        error: "No quedan copias disponibles de este libro.",
      };
    }
    set((state) => ({
      libros: state.libros.map((l) =>
        l.id === id ? { ...l, prestadas: l.prestadas + 1 } : l,
      ),
    }));
    return { ok: true };
  },

  devolverLibro: (id) => {
    set((state) => ({
      libros: state.libros.map((l) =>
        l.id === id ? { ...l, prestadas: Math.max(0, l.prestadas - 1) } : l,
      ),
    }));
  },
}));
