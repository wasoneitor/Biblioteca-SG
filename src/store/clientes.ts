import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { estaEnCurso, useAlquileres } from "./alquileres";

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  correo: string;
  foto: string | null; // la uri de la imagen, o null si no tiene
}

// Los datos del formulario: todo menos el id, que lo genera el store.
export type DatosCliente = Omit<Cliente, "id">;

// Las acciones que pueden fallar devuelven si salió bien o el motivo del error.
type Resultado = { ok: true } | { ok: false; error: string };

interface ClientesStore {
  clientes: Cliente[];
  agregarCliente: (datos: DatosCliente) => Resultado;
  editarCliente: (id: string, datos: DatosCliente) => Resultado;
  eliminarCliente: (id: string) => Resultado;
}

// persist guarda los clientes en el celular y los recupera al abrir la app.
export const useClientes = create<ClientesStore>()(
  persist(
    (set, get) => ({
      clientes: [],

      // ALTA
      agregarCliente: (datos) => {
        const dniRepetido = get().clientes.some((c) => c.dni === datos.dni);
        if (dniRepetido) {
          return {
            ok: false,
            error: "Ya hay un cliente registrado con ese DNI.",
          };
        }
        const nuevo: Cliente = { ...datos, id: Date.now().toString() };
        set((state) => ({ clientes: [...state.clientes, nuevo] }));
        return { ok: true };
      },

      // MODIFICACIÓN
      editarCliente: (id, datos) => {
        // El DNI puede repetirse solo si es el del mismo cliente que estamos editando.
        const dniRepetido = get().clientes.some(
          (c) => c.dni === datos.dni && c.id !== id,
        );
        if (dniRepetido) {
          return { ok: false, error: "Ya hay otro cliente con ese DNI." };
        }
        set((state) => ({
          clientes: state.clientes.map((c) =>
            c.id === id ? { ...c, ...datos } : c,
          ),
        }));
        return { ok: true };
      },

      // BAJA
      eliminarCliente: (id) => {
        const tienePrestamos = useAlquileres
          .getState()
          .alquileres.some((a) => a.clienteId === id && estaEnCurso(a));
        if (tienePrestamos) {
          return {
            ok: false,
            error: "Tiene libros prestados. Primero registrá las devoluciones.",
          };
        }
        set((state) => ({
          clientes: state.clientes.filter((c) => c.id !== id),
        }));
        return { ok: true };
      },
    }),
    {
      name: "biblioteca-clientes", // la "etiqueta" con la que se guarda en AsyncStorage
      storage: createJSONStorage(() => AsyncStorage), // dónde se guarda
      partialize: (state) => ({ clientes: state.clientes }), // qué se guarda: solo los datos
    },
  ),
);
