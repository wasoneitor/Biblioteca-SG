import { create } from "zustand";
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

export const useClientes = create<ClientesStore>((set, get) => ({
  clientes: [],

  // ALTA
  agregarCliente: (datos) => {
    const dniRepetido = get().clientes.some((c) => c.dni === datos.dni);
    if (dniRepetido) {
      return { ok: false, error: "Ya hay un cliente registrado con ese DNI." };
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
    set((state) => ({ clientes: state.clientes.filter((c) => c.id !== id) }));
    return { ok: true };
  },
}));
