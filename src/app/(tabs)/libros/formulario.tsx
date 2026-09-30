import { Campo, Etiqueta, TextoError } from "@/components/Campo";
import { colores } from "@/constants/colores";
import { GENEROS, useLibros, type Genero } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  type ImageSourcePropType,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

type Errores = Partial<
  Record<"titulo" | "autor" | "editorial" | "genero" | "copias", string>
>;

export default function FormularioLibro() {
  const router = useRouter();
  const agregarLibro = useLibros((s) => s.agregarLibro);
  const editarLibro = useLibros((s) => s.editarLibro);

  // Mismo patrón que clientes: si llega un id, editamos.
  const { id } = useLocalSearchParams<{ id?: string }>();
  const libroExistente = useLibros((s) => s.libros.find((l) => l.id === id));
  const modoEdicion = libroExistente !== undefined;

  const [titulo, setTitulo] = useState(libroExistente?.titulo ?? "");
  const [autor, setAutor] = useState(libroExistente?.autor ?? "");
  const [editorial, setEditorial] = useState(libroExistente?.editorial ?? "");
  const [genero, setGenero] = useState<Genero | null>(
    libroExistente?.genero ?? null,
  );
  const [copias, setCopias] = useState(libroExistente?.copias ?? 1);
  const [portada, setPortada] = useState<ImageSourcePropType | null>(
    libroExistente?.portada ?? null,
  );
  const [errores, setErrores] = useState<Errores>({});

  function validar(): Errores {
    const e: Errores = {};
    if (!titulo.trim()) e.titulo = "Escribí el título.";
    if (!autor.trim()) e.autor = "Escribí el autor.";
    if (!editorial.trim()) e.editorial = "Escribí la editorial.";
    if (!genero) e.genero = "Elegí un género.";
    return e;
  }

  function guardar() {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0 || !genero) return;

    const datos = {
      titulo: titulo.trim(),
      autor: autor.trim(),
      editorial: editorial.trim(),
      genero,
      copias,
      portada,
    };

    if (modoEdicion) {
      const resultado = editarLibro(libroExistente.id, datos);
      // El único rechazo posible: menos copias que las que están prestadas.
      if (!resultado.ok) {
        setErrores({ copias: resultado.error });
        return;
      }
    } else {
      agregarLibro(datos);
    }
    router.back();
  }

  async function elegirDeGaleria() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [3, 4], // proporción de tapa de libro
      quality: 0.7,
    });
    if (!resultado.canceled) setPortada({ uri: resultado.assets[0].uri });
  }

  async function sacarFoto() {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) return;
    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });
    if (!resultado.canceled) setPortada({ uri: resultado.assets[0].uri });
  }

  return (
    <Contenedor edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ padding: 20 }}
          keyboardShouldPersistTaps="handled"
        >
          <Encabezado>
            <BotonVolver
              onPress={() => router.back()}
              accessibilityLabel="Volver"
            >
              <Ionicons name="chevron-back" size={22} color={colores.tinta} />
            </BotonVolver>
            <TituloPantalla>
              {modoEdicion ? "Editar libro" : "Nuevo libro"}
            </TituloPantalla>
          </Encabezado>

          <FilaPortada>
            {portada ? (
              <Portada source={portada} resizeMode="cover" />
            ) : (
              <SinPortada>
                <Ionicons
                  name="book-outline"
                  size={30}
                  color={colores.tintaSuave}
                />
                <TextoSinPortada>Sin portada</TextoSinPortada>
              </SinPortada>
            )}
            <BotonesPortada>
              <BotonChico onPress={elegirDeGaleria}>
                <Ionicons
                  name="images-outline"
                  size={17}
                  color={colores.tinta}
                />
                <TextoChico>Galería</TextoChico>
              </BotonChico>
              {Platform.OS !== "web" && (
                <BotonChico onPress={sacarFoto}>
                  <Ionicons
                    name="camera-outline"
                    size={17}
                    color={colores.tinta}
                  />
                  <TextoChico>Cámara</TextoChico>
                </BotonChico>
              )}
              {portada && (
                <BotonChico onPress={() => setPortada(null)}>
                  <Ionicons
                    name="trash-outline"
                    size={17}
                    color={colores.naranjaTexto}
                  />
                  <TextoChico style={{ color: colores.naranjaTexto }}>
                    Quitar
                  </TextoChico>
                </BotonChico>
              )}
            </BotonesPortada>
          </FilaPortada>

          <Campo
            etiqueta="Título"
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Ej: Rayuela"
            error={errores.titulo}
          />
          <Campo
            etiqueta="Autor"
            value={autor}
            onChangeText={setAutor}
            placeholder="Ej: Julio Cortázar"
            error={errores.autor}
          />
          <Campo
            etiqueta="Editorial"
            value={editorial}
            onChangeText={setEditorial}
            placeholder="Ej: Alfaguara"
            error={errores.editorial}
          />

          <Grupo>
            <Etiqueta>Género</Etiqueta>
            <FilaChips>
              {GENEROS.map((g) => {
                const activo = g === genero;
                return (
                  <Chip
                    key={g}
                    onPress={() => setGenero(g)}
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
            {errores.genero ? <TextoError>{errores.genero}</TextoError> : null}
          </Grupo>

          <Grupo>
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
            {errores.copias ? <TextoError>{errores.copias}</TextoError> : null}
          </Grupo>
        </ScrollView>

        <BarraInferior>
          <BotonGuardar onPress={guardar} activeOpacity={0.8}>
            <TextoGuardar>
              {modoEdicion ? "Guardar cambios" : "Agregar libro"}
            </TextoGuardar>
          </BotonGuardar>
        </BarraInferior>
      </KeyboardAvoidingView>
    </Contenedor>
  );
}

// ---------- Estilos ----------

const Contenedor = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colores.fondo};
`;

const Encabezado = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
`;

const BotonVolver = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.superficie};
`;

const TituloPantalla = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const FilaPortada = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

// Proporción 3:4, como una tapa de libro.
const SinPortada = styled.View`
  width: 96px;
  height: 128px;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background-color: ${colores.superficie};
  border-width: 2px;
  border-style: dashed;
  border-color: ${colores.borde};
`;

const TextoSinPortada = styled.Text`
  font-size: 12px;
  color: ${colores.tintaSuave};
`;

const Portada = styled.Image`
  width: 96px;
  height: 128px;
  border-radius: 6px;
`;

const BotonesPortada = styled.View`
  flex: 1;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 8px;
`;

const BotonChico = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px;
  border-radius: 20px;
  border-width: 1px;
  border-color: ${colores.borde};
  background-color: ${colores.superficie};
`;

const TextoChico = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${colores.tinta};
`;

const Grupo = styled.View`
  margin-bottom: 16px;
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

const BarraInferior = styled.View`
  padding: 12px 20px;
  background-color: ${colores.fondo};
`;

const BotonGuardar = styled.TouchableOpacity`
  height: 54px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azul};
`;

const TextoGuardar = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: #ffffff;
`;
