export interface Alquiler {
  id: string;
  clienteId: string;
  libroId: string;
  fechaAlquiler: string;
}

const alquileres: Alquiler[] = [];

export function getAlquileres(): Alquiler[] {
  return alquileres;
}

export function addAlquiler(
  nuevo: Omit<Alquiler, "id">
): Alquiler {
  const alquiler: Alquiler = {
    ...nuevo,
    id: Date.now().toString(),
  };

  alquileres.push(alquiler);
  return alquiler;
}