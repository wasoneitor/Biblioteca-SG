// Open Library: API pública y gratuita, no necesita clave.
// Documentación: https://openlibrary.org/developers/api

const BASE = "https://openlibrary.org";
export const POR_PAGINA = 20;

// ---------- Los tipos de nuestra app ----------

export interface LibroOnline {
  key: string; // identificador de la obra en Open Library, ej: "/works/OL82563W"
  titulo: string;
  autor: string;
  anio: number | null;
  editorial: string | null;
  portadaUrl: string | null;
}

export interface PaginaBusqueda {
  libros: LibroOnline[];
  pagina: number;
  total: number; // cuántos resultados hay en total
}

export interface DetalleOnline {
  descripcion: string | null;
  temas: string[];
}

// ---------- Los tipos de la respuesta de la API (solo lo que usamos) ----------

interface RespuestaBusqueda {
  numFound: number;
  docs: {
    key: string;
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    publisher?: string[];
    cover_i?: number;
  }[];
}

interface RespuestaObra {
  description?: string | { value: string };
  subjects?: string[];
}

// ---------- Funciones ----------

async function pedir<T>(url: string): Promise<T> {
  const respuesta = await fetch(url);
  // Ojo: fetch NO lanza error con un 404 o un 500. Hay que revisarlo a mano,
  // así TanStack Query se entera de que algo salió mal y muestra el error.
  if (!respuesta.ok) {
    throw new Error(`Open Library respondió con el código ${respuesta.status}`);
  }
  return respuesta.json();
}

export async function buscarLibros(
  consulta: string,
  pagina: number,
): Promise<PaginaBusqueda> {
  const params = new URLSearchParams({
    q: consulta,
    page: String(pagina),
    limit: String(POR_PAGINA),
    fields: "key,title,author_name,first_publish_year,publisher,cover_i", // solo los campos que usamos
  });
  const datos = await pedir<RespuestaBusqueda>(`${BASE}/search.json?${params}`);

  // Transformamos cada resultado al formato de nuestra app.
  return {
    pagina,
    total: datos.numFound,
    libros: datos.docs.map((doc) => ({
      key: doc.key,
      titulo: doc.title,
      autor: doc.author_name?.join(", ") ?? "Autor desconocido",
      anio: doc.first_publish_year ?? null,
      editorial: doc.publisher?.[0] ?? null,
      portadaUrl: doc.cover_i
        ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
        : null,
    })),
  };
}

export async function obtenerDetalle(key: string): Promise<DetalleOnline> {
  const datos = await pedir<RespuestaObra>(`${BASE}${key}.json`);

  // La descripción a veces viene como texto y a veces como objeto { value: "..." }.
  const descripcion =
    typeof datos.description === "string"
      ? datos.description
      : (datos.description?.value ?? null);

  return {
    descripcion,
    temas: datos.subjects?.slice(0, 6) ?? [],
  };
}
