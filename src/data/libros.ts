import type { ImageSourcePropType } from "react-native";

export type Estado = "Disponible" | "Prestado";

export interface Libro {
  id: string;
  titulo: string;
  autor: string;
  editorial: string;
  genero: string;
  copias: number;
  estado: Estado;
  portada: ImageSourcePropType;
}

const libros: Libro[] = [
  {
    id: "1",
    titulo: "Lengua y Literatura",
    autor: "Edgar A.P.",
    editorial: "Santillana",
    genero: "Educativo",
    copias: 2,
    estado: "Disponible",
    portada: require("../../assets/covers/lengua-y-literatura.png"),
  },
  {
    id: "2",
    titulo: "Los Simpson y las matemáticas",
    autor: "Simon Singh",
    editorial: "Planeta",
    genero: "Divulgación",
    copias: 1,
    estado: "Disponible",
    portada: require("../../assets/covers/los-simpson-y-las-matematicas.png"),
  },
  {
    id: "3",
    titulo: "I Learn English",
    autor: "Varios Autores",
    editorial: "Richmond",
    genero: "Idiomas",
    copias: 3,
    estado: "Disponible",
    portada: require("../../assets/covers/i-learn-english.png"),
  },
  {
    id: "4",
    titulo: "Biología para Dummies",
    autor: "Rene Fester Kratz",
    editorial: "Wiley",
    genero: "Ciencia",
    copias: 0,
    estado: "Prestado",
    portada: require("../../assets/covers/biologia-para-dummies.png"),
  },
  {
    id: "5",
    titulo: "Orgullo y Prejuicio",
    autor: "Jane Austen",
    editorial: "Alma Clásicos Ilustrados",
    genero: "Ficción",
    copias: 2,
    estado: "Disponible",
    portada: require("../../assets/covers/orgullo-y-prejuicio.png"),
  },
  {
    id: "6",
    titulo: "Don Quijote de la Mancha",
    autor: "Miguel de Cervantes Saavedra",
    editorial: "Susaeta",
    genero: "Ficción",
    copias: 1,
    estado: "Disponible",
    portada: require("../../assets/covers/don-quijote-de-la-mancha.png"),
  },
  {
    id: "7",
    titulo: "Harry Potter y la piedra filosofal",
    autor: "J.K. Rowling",
    editorial: "Salamandra",
    genero: "Ficción",
    copias: 4,
    estado: "Prestado",
    portada: require("../../assets/covers/harry-potter-piedra-filosofal.png"),
  },
];

export function getLibros(): Libro[] {
  return libros;
}

export function addLibro(nuevo: Omit<Libro, "id">): Libro {
  const libro: Libro = {
    ...nuevo,
    id: Date.now().toString(),
  };
  libros.push(libro);
  return libro;
}
export function prestarLibro(id: string): boolean {
  const libro = libros.find((libro) => libro.id === id);

  if (!libro || libro.copias <= 0 || libro.estado !== "Disponible") {
    return false;
  }

  libro.copias -= 1;

  if (libro.copias === 0) {
    libro.estado = "Prestado";
  }

  return true;
}