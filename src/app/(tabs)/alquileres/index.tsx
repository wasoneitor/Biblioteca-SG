import { colores } from "@/constants/colores";
import {
  estaEnCurso,
  estaVencido,
  formatearFecha,
  textoVencimiento,
  useAlquileres,
  type Alquiler,
} from "@/store/alquileres";
import { useClientes } from "@/store/clientes";
import { useLibros } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, FlatList, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

type Pestania = "enCurso" | "devueltos";

export default function ListaAlquileres() {
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

  const lista = pestania === "enCurso" ? enCurso : devueltos;

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

    return (
      <Tarjeta
        onPress={() =>
          cliente &&
          router.push({
            pathname: "/clientes/detalle",
            params: { id: cliente.id },
          })
        }
        activeOpacity={0.7}
        style={
          vencido ? { borderWidth: 2, borderColor: colores.naranja } : undefined
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

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        renderItem={renderAlquiler}
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
  background-color: ${colores.fondo};
`;

const Volver = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  padding: 8px 14px;
`;

const TextoVolver = styled.Text`
  color: ${colores.azul};
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
  color: ${colores.tinta};
`;

const Subtitulo = styled.Text`
  font-size: 14px;
  color: ${colores.tintaSuave};
`;

const BotonPrestar = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background-color: ${colores.azul};
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

const Tarjeta = styled.TouchableOpacity`
  flex-direction: row;
  gap: 14px;
  padding: 14px;
  border-radius: 16px;
  background-color: ${colores.superficie};
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
  background-color: ${colores.tinta};
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
  color: ${colores.tinta};
`;

const Cliente = styled.Text`
  font-size: 14px;
  color: ${colores.tintaSuave};
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
  color: ${colores.tintaSuave};
`;

const BotonDevolver = styled.TouchableOpacity`
  height: 36px;
  padding: 0 14px;
  border-radius: 18px;
  border-width: 1px;
  border-color: ${colores.borde};
  justify-content: center;
  background-color: ${colores.superficie};
`;

const TextoDevolver = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${colores.tinta};
`;

const Vacio = styled.View`
  align-items: center;
  padding: 48px 32px;
  gap: 6px;
`;

const TituloVacio = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${colores.tinta};
  text-align: center;
`;

const TextoVacio = styled.Text`
  font-size: 14px;
  color: ${colores.tintaSuave};
  text-align: center;
`;
