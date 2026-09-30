import { create } from "zustand";
import { useLibros } from "./libros";

export interface Alquiler {
  id: string;
  clienteId: string;
  libroId: string;
  fechaPrestamo: string; // fechas en formato ISO: "2026-09-30T14:00:00.000Z"
  fechaVencimiento: string;
  fechaDevolucion: string | null; // null = todavía lo tiene
}

export const PLAZOS = [7, 14, 21] as const;
export type Plazo = (typeof PLAZOS)[number];

type Resultado = { ok: true } | { ok: false; error: string };

// ---------- Funciones de ayuda: calculan, no modifican ----------

export function estaEnCurso(alquiler: Alquiler) {
  return alquiler.fechaDevolucion === null;
}

export function estaVencido(alquiler: Alquiler) {
  return (
    estaEnCurso(alquiler) && new Date(alquiler.fechaVencimiento) < new Date()
  );
}

// Días que faltan para el vencimiento. Si es negativo, son días de atraso.
export function diasRestantes(alquiler: Alquiler) {
  const unDia = 1000 * 60 * 60 * 24;
  const diferencia = new Date(alquiler.fechaVencimiento).getTime() - Date.now();
  return Math.ceil(diferencia / unDia);
}

// Texto de la etiqueta: "Vence en 5 días", "Vence hoy", "Venció hace 2 días"...
export function textoVencimiento(alquiler: Alquiler) {
  const dias = diasRestantes(alquiler);
  if (dias < 0) return `Venció hace ${-dias} ${dias === -1 ? "día" : "días"}`;
  if (dias === 0) return "Vence hoy";
  if (dias === 1) return "Vence mañana";
  return `Vence en ${dias} días`;
}

export function formatearFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
  });
}

// ---------- El store ----------

interface AlquileresStore {
  alquileres: Alquiler[];
  registrarAlquiler: (
    clienteId: string,
    libroId: string,
    plazo: Plazo,
  ) => Resultado;
  devolverAlquiler: (id: string) => void;
}

export const useAlquileres = create<AlquileresStore>((set, get) => ({
  alquileres: [],

  registrarAlquiler: (clienteId, libroId, plazo) => {
    // Regla: el mismo cliente no puede tener dos copias del mismo libro a la vez.
    const yaLoTiene = get().alquileres.some(
      (a) =>
        a.clienteId === clienteId && a.libroId === libroId && estaEnCurso(a),
    );
    if (yaLoTiene) {
      return {
        ok: false,
        error: "Este cliente ya tiene una copia de este libro.",
      };
    }

    // Le pedimos al store de libros que descuente una copia.
    // Si no quedan copias, devuelve el error y no registramos nada.
    const resultado = useLibros.getState().prestarLibro(libroId);
    if (!resultado.ok) return resultado;

    const hoy = new Date();
    const vencimiento = new Date(hoy);
    vencimiento.setDate(hoy.getDate() + plazo);

    const nuevo: Alquiler = {
      id: Date.now().toString(),
      clienteId,
      libroId,
      fechaPrestamo: hoy.toISOString(),
      fechaVencimiento: vencimiento.toISOString(),
      fechaDevolucion: null,
    };
    set((state) => ({ alquileres: [nuevo, ...state.alquileres] }));
    return { ok: true };
  },

  devolverAlquiler: (id) => {
    const alquiler = get().alquileres.find((a) => a.id === id);
    if (!alquiler || !estaEnCurso(alquiler)) return; // ya estaba devuelto

    set((state) => ({
      alquileres: state.alquileres.map((a) =>
        a.id === id ? { ...a, fechaDevolucion: new Date().toISOString() } : a,
      ),
    }));
    // La copia vuelve a estar disponible.
    useLibros.getState().devolverLibro(alquiler.libroId);
  },
}));
