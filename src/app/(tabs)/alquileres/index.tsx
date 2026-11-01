import {
  estaEnCurso,
  estaVencido,
  formatearFecha,
  textoVencimiento,
  useAlquileres,
  type Alquiler,
} from "@/store/alquileres";
import { Latido } from "@/components/Latido";
import { useClientes } from "@/store/clientes";
import { useLibros } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, SectionList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled, { useTheme } from "styled-components/native";

type Pestania = "enCurso" | "devueltos";

// Una sección de la SectionList: un título y los préstamos que van debajo.
// SectionList exige que los ítems de cada sección estén en "data".
interface Seccion {
  titulo: string;
  alerta: boolean; // true = el título se pinta en naranja (los vencidos)
  data: Alquiler[];
}

// "octubre de 2026" → "Octubre de 2026"
function mesDe(iso: string) {
  const texto = new Date(iso).toLocaleDateString("es-AR", {
    month: "long",
    year: "numeric",
  });
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export default function ListaAlquileres() {
  const { colores } = useTheme();
  const router = useRouter();
  const alquileres = useAlquileres((s) => s.alquileres);
  const devolverAlquiler = useAlquileres((s) => s.devolverAlquiler);
  const libros = useLibros((s) => s.libros);
  const clientes = useClientes((s) => s.clientes);
  const [pestania, setPestania] = useState<Pestania>("enCurso");

  // En curso: los vencidos primero, después los que vencen antes.
  const enCurso = alquileres
    .filter(estaEnCurso)
    .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));

  // Devueltos: los más recientes primero.
  const devueltos = alquileres
    .filter((a) => !estaEnCurso(a))
    .sort((a, b) =>
      (b.fechaDevolucion ?? "").localeCompare(a.fechaDevolucion ?? ""),
    );

  // ---------- Armado de las secciones ----------

  // En curso: se separan en dos grupos.
  const seccionesEnCurso: Seccion[] = [
    {
      titulo: "Vencidos",
      alerta: true,
      data: enCurso.filter((a) => estaVencido(a)),
    },
    {
      titulo: "Al día",
      alerta: false,
      data: enCurso.filter((a) => !estaVencido(a)),
    },
  ];

  // Devueltos: un grupo por mes de devolución.
  // Como ya están ordenados del más nuevo al más viejo, los meses quedan en orden.
  const seccionesDevueltos: Seccion[] = [];
  for (const alquiler of devueltos) {
    const mes = mesDe(alquiler.fechaDevolucion!);
    const ultima = seccionesDevueltos[seccionesDevueltos.length - 1];
    if (ultima && ultima.titulo === mes) {
      ultima.data.push(alquiler); // mismo mes que el anterior: va al mismo grupo
    } else {
      seccionesDevueltos.push({ titulo: mes, alerta: false, data: [alquiler] });
    }
  }

  // Las secciones vacías no se muestran (no queremos un título "Vencidos" sin nada abajo).
  const secciones = (
    pestania === "enCurso" ? seccionesEnCurso : seccionesDevueltos
  ).filter((s) => s.data.length > 0);

  function confirmarDevolucion(
    alquiler: Alquiler,
    titulo: string,
    nombre: string,
  ) {
    const mensaje = `¿${nombre} devolvió "${titulo}"?`;
    if (Platform.OS === "web") {
      if (window.confirm(mensaje)) devolverAlquiler(alquiler.id);
      return;
    }
    Alert.alert("Registrar devolución", mensaje, [
      { text: "Cancelar", style: "cancel" },
      { text: "Devolver", onPress: () => devolverAlquiler(alquiler.id) },
    ]);
  }

  function renderAlquiler({ item }: { item: Alquiler }) {
    // El alquiler solo guarda los ids: buscamos el libro y el cliente en sus stores.
    const libro = libros.find((l) => l.id === item.libroId);
    const cliente = clientes.find((c) => c.id === item.clienteId);
    const titulo = libro?.titulo ?? "Libro eliminado";
    const nombre = cliente
      ? `${cliente.nombre} ${cliente.apellido}`
      : "Cliente eliminado";
    const vencido = estaVencido(item);
    const enCursoItem = estaEnCurso(item);

    // Si el préstamo está vencido, la tarjeta "late" para llamar la atención.
    return (
      <Latido activo={vencido}>
        <Tarjeta
          onPress={() => cliente && router.push(`/clientes/${cliente.id}`)}
          activeOpacity={0.7}
          style={
            vencido
              ? { borderWidth: 2, borderColor: colores.naranja }
              : undefined
          }
        >
          {libro?.portada ? (
            <Portada source={libro.portada} resizeMode="cover" />
          ) : (
            <TapaGenerica>
              <TituloTapa numberOfLines={4}>{titulo}</TituloTapa>
            </TapaGenerica>
          )}

          <Datos>
            <Titulo numberOfLines={2}>{titulo}</Titulo>
            <Cliente numberOfLines={1}>{nombre}</Cliente>

            <FilaInferior>
              {enCursoItem ? (
                <Etiqueta
                  style={{
                    backgroundColor: vencido
                      ? colores.naranjaClaro
                      : colores.azulClaro,
                  }}
                >
                  <TextoEtiqueta
                    style={{
                      color: vencido ? colores.naranjaTexto : colores.azulTexto,
                    }}
                  >
                    {textoVencimiento(item)}
                  </TextoEtiqueta>
                </Etiqueta>
              ) : (
                <TextoDevuelto>
                  Devuelto el {formatearFecha(item.fechaDevolucion!)}
                </TextoDevuelto>
              )}

              {enCursoItem && (
                <BotonDevolver
                  onPress={() =>
                    confirmarDevolucion(
                      item,
                      titulo,
                      cliente?.nombre ?? "El cliente",
                    )
                  }
                  style={
                    vencido
                      ? {
                          backgroundColor: colores.tinta,
                          borderColor: colores.tinta,
                        }
                      : undefined
                  }
                >
                  <TextoDevolver
                    style={vencido ? { color: "#FFFFFF" } : undefined}
                  >
                    Devolver
                  </TextoDevolver>
                </BotonDevolver>
              )}
            </FilaInferior>
          </Datos>
        </Tarjeta>
      </Latido>
    );
  }

  return (
    <Contenedor edges={["top"]}>
      <Encabezado>
        <Textos>
          <TituloPantalla>Alquileres</TituloPantalla>
          <Subtitulo>
            {enCurso.length}{" "}
            {enCurso.length === 1 ? "libro prestado" : "libros prestados"}
          </Subtitulo>
        </Textos>
        <BotonPrestar
          onPress={() => router.push("/alquileres/registrar")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <TextoBoton>Prestar</TextoBoton>
        </BotonPrestar>
      </Encabezado>

      {/* Control segmentado: dos pestañas dentro de una cápsula gris */}
      <Segmentado>
        {(
          [
            { id: "enCurso", texto: `En curso (${enCurso.length})` },
            { id: "devueltos", texto: `Devueltos (${devueltos.length})` },
          ] as const
        ).map((p) => {
          const activa = p.id === pestania;
          return (
            <OpcionSegmento
              key={p.id}
              onPress={() => setPestania(p.id)}
              style={
                activa ? { backgroundColor: colores.superficie } : undefined
              }
            >
              <TextoSegmento
                style={{ color: activa ? colores.tinta : colores.tintaSuave }}
              >
                {p.texto}
              </TextoSegmento>
            </OpcionSegmento>
          );
        })}
      </Segmentado>

      <SectionList
        sections={secciones} // en vez de data: la lista de grupos
        keyExtractor={(item) => item.id}
        renderItem={renderAlquiler} // cada tarjeta, igual que antes
        // El título de cada grupo
        renderSectionHeader={({ section }) => (
          <EncabezadoSeccion>
            <TituloSeccion
              style={
                section.alerta ? { color: colores.naranjaTexto } : undefined
              }
            >
              {section.titulo}
            </TituloSeccion>
            <ContadorSeccion>{section.data.length}</ContadorSeccion>
          </EncabezadoSeccion>
        )}
        // En iOS los títulos quedan "pegados" arriba al scrollear; lo apagamos
        // para que se vea igual en Android y en iOS.
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{ padding: 20, gap: 12 }}
        ListEmptyComponent={
          <Vacio>
            <Ionicons
              name={pestania === "enCurso" ? "book-outline" : "time-outline"}
              size={44}
              color={colores.borde}
            />
            <TituloVacio>
              {pestania === "enCurso"
                ? "No hay libros prestados"
                : "Todavía no hay devoluciones"}
            </TituloVacio>
            <TextoVacio>
              {pestania === "enCurso"
                ? "Cuando prestes un libro, va a aparecer acá."
                : "Los libros devueltos quedan registrados en esta pestaña."}
            </TextoVacio>
          </Vacio>
        }
      />
    </Contenedor>
  );
}

// ---------- Estilos ----------

const Contenedor = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colores.fondo};
`;

const Volver = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  padding: 8px 14px;
`;

const TextoVolver = styled.Text`
  color: ${({ theme }) => theme.colores.azul};
  font-size: 15px;
  font-weight: 600;
`;

const Encabezado = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 16px;
`;

const Textos = styled.View``;

const TituloPantalla = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${({ theme }) => theme.colores.tinta};
`;

const Subtitulo = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colores.tintaSuave};
`;

const BotonPrestar = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background-color: ${({ theme }) => theme.colores.azul};
`;

const TextoBoton = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: bold;
`;

const Segmentado = styled.View`
  flex-direction: row;
  gap: 4px;
  margin: 0 20px;
  padding: 4px;
  border-radius: 14px;
  background-color: #dde3ec;
`;

const OpcionSegmento = styled.TouchableOpacity`
  flex: 1;
  height: 40px;
  border-radius: 11px;
  align-items: center;
  justify-content: center;
`;

const TextoSegmento = styled.Text`
  font-size: 15px;
  font-weight: bold;
`;

const EncabezadoSeccion = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  padding-top: 8px;
`;

const TituloSeccion = styled.Text`
  font-size: 13px;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: ${({ theme }) => theme.colores.tintaSuave};
`;

const ContadorSeccion = styled.Text`
  font-size: 12px;
  font-weight: bold;
  padding: 1px 8px;
  border-radius: 10px;
  overflow: hidden;
  color: ${({ theme }) => theme.colores.tintaSuave};
  background-color: ${({ theme }) => theme.colores.borde};
`;

const Tarjeta = styled.TouchableOpacity`
  flex-direction: row;
  gap: 14px;
  padding: 14px;
  border-radius: 16px;
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const Portada = styled.Image`
  width: 56px;
  height: 76px;
  border-radius: 4px;
`;

const TapaGenerica = styled.View`
  width: 56px;
  height: 76px;
  padding: 6px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colores.tinta};
`;

const TituloTapa = styled.Text`
  color: #ffffff;
  font-size: 9px;
  font-weight: bold;
`;

const Datos = styled.View`
  flex: 1;
`;

const Titulo = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) => theme.colores.tinta};
`;

const Cliente = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colores.tintaSuave};
  margin-top: 2px;
`;

const FilaInferior = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 10px;
`;

const Etiqueta = styled.View`
  padding: 4px 10px;
  border-radius: 12px;
`;

const TextoEtiqueta = styled.Text`
  font-size: 13px;
  font-weight: bold;
`;

const TextoDevuelto = styled.Text`
  font-size: 13px;
  color: ${({ theme }) => theme.colores.tintaSuave};
`;

const BotonDevolver = styled.TouchableOpacity`
  height: 36px;
  padding: 0 14px;
  border-radius: 18px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.colores.borde};
  justify-content: center;
  background-color: ${({ theme }) => theme.colores.superficie};
`;

const TextoDevolver = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colores.tinta};
`;

const Vacio = styled.View`
  align-items: center;
  padding: 48px 32px;
  gap: 6px;
`;

const TituloVacio = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${({ theme }) => theme.colores.tinta};
  text-align: center;
`;

const TextoVacio = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colores.tintaSuave};
  text-align: center;
`;
