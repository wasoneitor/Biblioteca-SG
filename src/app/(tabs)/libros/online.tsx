import { Campo, Etiqueta } from "@/components/Campo";
import { colores } from "@/constants/colores";
import { obtenerDetalle } from "@/services/openLibrary";
import { GENEROS, useLibros, type Genero } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

// Sugiere un género a partir de los temas de la API, que vienen en inglés.
function sugerirGenero(temas: string[]): Genero | null {
  const t = temas.join(" ").toLowerCase();
  if (t.includes("fiction") || t.includes("novel")) return "Ficción";
  if (t.includes("science") || t.includes("biology")) return "Ciencia";
  if (t.includes("language") || t.includes("english")) return "Idiomas";
  if (t.includes("textbook") || t.includes("education")) return "Educativo";
  return null;
}

export default function LibroOnline() {
  const router = useRouter();
  // Los datos llegan desde la búsqueda, todos como texto.
  const params = useLocalSearchParams<{
    key: string;
    titulo: string;
    autor: string;
    anio: string;
    editorial: string;
    portadaUrl: string;
  }>();

  const agregarLibro = useLibros((s) => s.agregarLibro);
  const existente = useLibros((s) =>
    s.libros.find((l) => l.claveOnline === params.key),
  );

  // useQuery reemplaza al combo useState + useEffect + fetch que vieron en clase.
  // Si se vuelve a abrir el mismo libro, la descripción sale de la caché.
  const {
    data: detalle,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["openlibrary", "obra", params.key],
    queryFn: () => obtenerDetalle(params.key),
  });

  const [generoElegido, setGeneroElegido] = useState<Genero | null>(null);
  const [editorial, setEditorial] = useState(params.editorial ?? "");
  const [copias, setCopias] = useState(1);

  // Si no eligieron un género, usamos la sugerencia (cuando llega el detalle).
  const genero = generoElegido ?? sugerirGenero(detalle?.temas ?? []);

  // Para la vista grande pedimos la portada en tamaño L en lugar de M.
  const portadaGrande = params.portadaUrl
    ? params.portadaUrl.replace("-M.jpg", "-L.jpg")
    : null;

  function agregar() {
    if (!genero) return;
    agregarLibro({
      titulo: params.titulo,
      autor: params.autor,
      editorial: editorial.trim() || "Sin datos",
      genero,
      copias,
      portada: portadaGrande ? { uri: portadaGrande } : null,
      claveOnline: params.key, // para reconocerlo después como "ya importado"
    });

    const mensaje = `"${params.titulo}" ya está en el catálogo.`;
    if (Platform.OS === "web") window.alert(mensaje);
    else Alert.alert("Libro agregado", mensaje);
    router.back();
  }

  return (
    <Contenedor edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 18 }}
        keyboardShouldPersistTaps="handled"
      >
        <BotonVolver onPress={() => router.back()} accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={22} color={colores.tinta} />
        </BotonVolver>

        <Cabecera>
          {portadaGrande ? (
            <Portada source={{ uri: portadaGrande }} resizeMode="cover" />
          ) : (
            <TapaGenerica>
              <TituloTapa numberOfLines={6}>{params.titulo}</TituloTapa>
            </TapaGenerica>
          )}
          <DatosCabecera>
            <Titulo>{params.titulo}</Titulo>
            <Autor>{params.autor}</Autor>
            {params.anio ? <Dato>Publicado en {params.anio}</Dato> : null}
          </DatosCabecera>
        </Cabecera>

        {/* ---------- La descripción que llega de la API ---------- */}
        {isLoading && <ActivityIndicator color={colores.azul} />}
        {isError && (
          <Dato>
            No se pudo cargar la descripción, pero igual podés agregar el libro.
          </Dato>
        )}
        {detalle?.descripcion ? (
          <Descripcion numberOfLines={8}>{detalle.descripcion}</Descripcion>
        ) : null}
        {detalle && detalle.temas.length > 0 && (
          <FilaTemas>
            {detalle.temas.map((tema) => (
              <Tema key={tema}>
                <TextoTema>{tema}</TextoTema>
              </Tema>
            ))}
          </FilaTemas>
        )}

        <Separador />

        {existente ? (
          // ---------- Ya lo tienen: no dejamos agregarlo dos veces ----------
          <>
            <Subtitulo>Este libro ya está en tu catálogo</Subtitulo>
            <BotonClaro
              onPress={() =>
                router.push({
                  pathname: "/libros/detalle",
                  params: { id: existente.id },
                })
              }
            >
              <TextoBotonClaro>Ver la ficha del libro</TextoBotonClaro>
            </BotonClaro>
          </>
        ) : (
          // ---------- El formulario para agregarlo ----------
          <>
            <Subtitulo>Agregar al catálogo</Subtitulo>

            <Grupo>
              <Etiqueta>
                Género{" "}
                {!generoElegido && genero ? (
                  <TextoSugerido>(sugerido por la API)</TextoSugerido>
                ) : null}
              </Etiqueta>
              <FilaChips>
                {GENEROS.map((g) => {
                  const activo = g === genero;
                  return (
                    <Chip
                      key={g}
                      onPress={() => setGeneroElegido(g)}
                      style={{
                        backgroundColor: activo
                          ? colores.tinta
                          : colores.superficie,
                        borderColor: activo ? colores.tinta : colores.borde,
                      }}
                    >
                      <TextoChip
                        style={{ color: activo ? "#FFFFFF" : colores.tinta }}
                      >
                        {g}
                      </TextoChip>
                    </Chip>
                  );
                })}
              </FilaChips>
            </Grupo>

            <Campo
              etiqueta="Editorial"
              value={editorial}
              onChangeText={setEditorial}
              placeholder="Ej: Planeta"
            />

            <FilaCopias>
              <Etiqueta style={{ marginBottom: 0 }}>
                Cantidad de copias
              </Etiqueta>
              <Contador>
                <BotonContador
                  onPress={() => setCopias((c) => Math.max(1, c - 1))}
                  disabled={copias <= 1}
                  style={{ opacity: copias <= 1 ? 0.4 : 1 }}
                  accessibilityLabel="Una copia menos"
                >
                  <Ionicons name="remove" size={20} color={colores.tinta} />
                </BotonContador>
                <NumeroCopias>{copias}</NumeroCopias>
                <BotonContador
                  onPress={() => setCopias((c) => c + 1)}
                  accessibilityLabel="Una copia más"
                >
                  <Ionicons name="add" size={20} color={colores.tinta} />
                </BotonContador>
              </Contador>
            </FilaCopias>
          </>
        )}
      </ScrollView>

      {!existente && (
        <BarraInferior>
          <BotonAgregar
            onPress={agregar}
            disabled={!genero}
            style={{ opacity: genero ? 1 : 0.4 }}
            activeOpacity={0.8}
          >
            <TextoAgregar>
              {genero ? "Agregar al catálogo" : "Elegí un género"}
            </TextoAgregar>
          </BotonAgregar>
        </BarraInferior>
      )}
    </Contenedor>
  );
}

// ---------- Estilos ----------

const Contenedor = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colores.fondo};
`;

const BotonVolver = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.superficie};
`;

const Cabecera = styled.View`
  flex-direction: row;
  align-items: flex-end;
  gap: 16px;
`;

const Portada = styled.Image`
  width: 104px;
  height: 152px;
  border-radius: 6px;
  background-color: ${colores.fondoPortada};
`;

const TapaGenerica = styled.View`
  width: 104px;
  height: 152px;
  padding: 12px;
  border-radius: 6px;
  background-color: ${colores.tinta};
`;

const TituloTapa = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: #ffffff;
`;

const DatosCabecera = styled.View`
  flex: 1;
  gap: 4px;
`;

const Titulo = styled.Text`
  font-size: 22px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const Autor = styled.Text`
  font-size: 15px;
  color: ${colores.tintaSuave};
`;

const Dato = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
`;

const Descripcion = styled.Text`
  font-size: 15px;
  line-height: 22px;
  color: ${colores.tinta};
`;

const FilaTemas = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
`;

const Tema = styled.View`
  padding: 4px 10px;
  border-radius: 12px;
  background-color: ${colores.azulClaro};
`;

const TextoTema = styled.Text`
  font-size: 12px;
  color: ${colores.azulTexto};
`;

const Separador = styled.View`
  height: 1px;
  background-color: ${colores.borde};
`;

const Subtitulo = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const Grupo = styled.View``;

const TextoSugerido = styled.Text`
  font-weight: normal;
  color: ${colores.tintaSuave};
`;

const FilaChips = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const Chip = styled.TouchableOpacity`
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border-width: 1px;
  justify-content: center;
`;

const TextoChip = styled.Text`
  font-size: 14px;
  font-weight: 600;
`;

const FilaCopias = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const Contador = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 4px;
  padding: 4px;
  border-radius: 14px;
  background-color: ${colores.superficie};
`;

const BotonContador = styled.TouchableOpacity`
  width: 44px;
  height: 40px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.fondo};
`;

const NumeroCopias = styled.Text`
  width: 40px;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const BotonClaro = styled.TouchableOpacity`
  height: 48px;
  border-radius: 14px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azulClaro};
`;

const TextoBotonClaro = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.azulTexto};
`;

const BarraInferior = styled.View`
  padding: 12px 20px;
  background-color: ${colores.fondo};
`;

const BotonAgregar = styled.TouchableOpacity`
  height: 54px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azul};
`;

const TextoAgregar = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: #ffffff;
`;
