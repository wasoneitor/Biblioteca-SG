import type { ImageSourcePropType } from "react-native";

export interface Cliente {
  id: string;
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;
  correo: string;
  foto: ImageSourcePropType | null;
}

const clientes: Cliente[] = [];

export function getClientes(): Cliente[] {
  return clientes;
}

export function addCliente(nuevo: Omit<Cliente, "id">): Cliente {
  const cliente: Cliente = {
    ...nuevo,
    id: Date.now().toString(),
  };

  clientes.push(cliente);
  return cliente;
}