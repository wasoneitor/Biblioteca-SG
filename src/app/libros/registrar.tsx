import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ScrollView } from "react-native";
import styled from "styled-components/native";
import type { Estado } from "../../data/libros";
import { addLibro } from "../../data/libros";

const GENEROS = ["Educativo", "Divulgación", "Idiomas", "Ciencia", "Ficción"];
const ESTADOS: Estado[] = ["Disponible", "Prestado"];

export default function RegistrarLibro() {
  const router = useRouter();

  const [titulo, setTitulo] = useState("");
  const [autor, setAutor] = useState("");
  const [editorial, setEditorial] = useState("");
  const [copias, setCopias] = useState("");
  const [genero, setGenero] = useState<string | null>(null);
  const [estado, setEstado] = useState<Estado | null>(null);
  const [imagen, setImagen] = useState<string | null>(null);

  async function seleccionarImagen() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) {
      Alert.alert(
        "Permiso necesario",
        "Necesitamos acceso a tus fotos para elegir una portada.",
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.7,
    });

    if (!resultado.canceled) {
      setImagen(resultado.assets[0].uri);
    }
  }

  function limpiarFormulario() {
    setTitulo("");
    setAutor("");
    setEditorial("");
    setCopias("");
    setGenero(null);
    setEstado(null);
    setImagen(null);
  }

  function handleRegistrar() {
    if (
      !titulo.trim() ||
      !autor.trim() ||
      !editorial.trim() ||
      !copias.trim()
    ) {
      Alert.alert("Faltan datos", "Completá todos los campos del libro.");
      return;
    }
    if (!genero) {
      Alert.alert("Faltan datos", "Seleccioná un género.");
      return;
    }
    if (!estado) {
      Alert.alert("Faltan datos", "Seleccioná el estado del libro.");
      return;
    }
    if (isNaN(Number(copias)) || Number(copias) < 0) {
      Alert.alert(
        "Dato inválido",
        "La cantidad de copias debe ser un número válido.",
      );
      return;
    }

    addLibro({
      titulo: titulo.trim(),
      autor: autor.trim(),
      editorial: editorial.trim(),
      genero,
      estado,
      copias: Number(copias),
      portada: imagen
        ? { uri: imagen }
        : {
          uri: `https://placehold.co/200x280/2E9AD1/ffffff?text=${encodeURIComponent(
            titulo.trim().slice(0, 10),
          )}`,
        },
    });

    if (Platform.OS === "web") {
      window.alert("El libro se registró con éxito.");
      limpiarFormulario();
      router.back();
    } else {
      Alert.alert("¡Listo!", "El libro se registró con éxito.", [
        {
          text: "Entendido",
          onPress: () => {
            limpiarFormulario();
            router.back();
          },
        },
      ]);
    }
  }

  return (
    <Container>
      {/* Botón para volver atrás */}
      <BotonVolver onPress={() => router.back()}>
        <TextoVolver>← Volver</TextoVolver>
      </BotonVolver>
      <Header>
        <Titulo>Registrar Libro</Titulo>
      </Header>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <SelectorImagen onPress={seleccionarImagen} activeOpacity={0.7}>
          {imagen ? (
            <ImagenPreview source={{ uri: imagen }} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="image-outline" size={36} color="#5B7085" />
              <TextoSelector>Agregar portada</TextoSelector>
            </>
          )}
        </SelectorImagen>

        <Etiqueta>Título</Etiqueta>
        <Input
          placeholder="Ej: Lengua y Literatura"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Etiqueta>Género</Etiqueta>
        <ChipsRow>
          {GENEROS.map((g) => (
            <Chip
              key={g}
              selected={genero === g}
              onPress={() => setGenero(g)}
              activeOpacity={0.7}
            >
              <ChipTexto selected={genero === g}>{g}</ChipTexto>
            </Chip>
          ))}
        </ChipsRow>

        <Etiqueta>Autor</Etiqueta>
        <Input
          placeholder="Ej: Edgar A.P."
          value={autor}
          onChangeText={setAutor}
        />

        <Etiqueta>Editorial</Etiqueta>
        <Input
          placeholder="Ej: Santillana"
          value={editorial}
          onChangeText={setEditorial}
        />

        <Etiqueta>Cantidad de Copias</Etiqueta>
        <Input
          placeholder="Ej: 2"
          value={copias}
          onChangeText={setCopias}
          keyboardType="numeric"
        />

        <Etiqueta>Estado</Etiqueta>
        <ChipsRow>
          {ESTADOS.map((e) => (
            <Chip
              key={e}
              selected={estado === e}
              onPress={() => setEstado(e)}
              activeOpacity={0.7}
            >
              <ChipTexto selected={estado === e}>{e}</ChipTexto>
            </Chip>
          ))}
        </ChipsRow>

        <Botones>
          <BotonRegistrar onPress={handleRegistrar} activeOpacity={0.8}>
            <TextoBoton>Registrar</TextoBoton>
          </BotonRegistrar>
          <BotonCancelar onPress={() => router.back()} activeOpacity={0.8}>
            <TextoBoton>Cancelar</TextoBoton>
          </BotonCancelar>
        </Botones>
      </ScrollView>
    </Container>
  );
}
// Estilos agregados para el botón volver
const BotonVolver = styled.TouchableOpacity`
  align-self: flex-start;
  padding: 8px 12px;
  background-color: #e2e8f0;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const TextoVolver = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #164e63;
`;
const Container = styled.View`
  flex: 1;
  background-color: #f5f8fa;
`;

const Header = styled.View`
  background-color: #2e9ad1;
  padding: 18px 12px;
  padding-top: 50px;
`;

const Titulo = styled.Text`
  color: #fff;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
`;

const SelectorImagen = styled.TouchableOpacity`
  align-self: center;
  width: 120px;
  height: 160px;
  border-radius: 10px;
  border-width: 1.5px;
  border-color: #d7e0e6;
  border-style: dashed;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  margin-bottom: 10px;
  overflow: hidden;
`;

const ImagenPreview = styled.Image`
  width: 100%;
  height: 100%;
`;

const TextoSelector = styled.Text`
  color: #5b7085;
  font-size: 12px;
  margin-top: 6px;
  text-align: center;
`;

const Etiqueta = styled.Text`
  color: #5b7085;
  font-size: 13px;
  margin-top: 14px;
  margin-bottom: 6px;
`;

const Input = styled.TextInput`
  background-color: #fff;
  border-width: 1px;
  border-color: #d7e0e6;
  border-radius: 8px;
  padding: 12px 14px;
  font-size: 15px;
  color: #12314d;
`;

const ChipsRow = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

const Chip = styled.TouchableOpacity<{ selected: boolean }>`
  padding: 8px 14px;
  border-radius: 20px;
  border-width: 1.5px;
  border-color: #2e9ad1;
  background-color: ${(props: any) => (props.selected ? "#2e9ad1" : "#fff")};
  margin-right: 8px;
  margin-bottom: 8px;
`;

const ChipTexto = styled.Text<{ selected: boolean }>`
  color: ${(props: any) => (props.selected ? "#fff" : "#1b6fa8")};
  font-weight: bold;
  font-size: 13px;
`;

const Botones = styled.View`
  flex-direction: row;
  gap: 14px;
  margin-top: 30px;
`;

const BotonRegistrar = styled.TouchableOpacity`
  flex: 1;
  background-color: #2e9ad1;
  padding: 14px;
  border-radius: 10px;
  align-items: center;
`;

const BotonCancelar = styled.TouchableOpacity`
  flex: 1;
  background-color: #ff7a45;
  padding: 14px;
  border-radius: 10px;
  align-items: center;
`;

const TextoBoton = styled.Text`
  color: #fff;
  font-weight: bold;
  font-size: 16px;
`;
