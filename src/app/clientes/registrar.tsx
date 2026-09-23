import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { router } from "expo-router";
import { Alert, Platform, ScrollView } from "react-native";
import styled from "styled-components/native";
import { addCliente, getClientes } from "@/data/cliente";


export default function RegistrarCliente() {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dni, setDni] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [imagen, setImagen] = useState<string | null>(null);


   async function seleccionarImagen() {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          "Permiso necesario",
          "Necesitamos acceso a tus fotos para elegir una foto del cliente."
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
        setNombre("");
        setApellido("");
        setDni("");
        setTelefono("");
        setCorreo("");
        setImagen(null);
  }

 function handleRegistrar() {
  // Comprobar los campos obligatorios.
  if (
    !nombre.trim() ||
    !apellido.trim() ||
    !dni.trim() ||
    !telefono.trim() ||
    !correo.trim()
  ) {
    if (Platform.OS === "web") {
      window.alert("Completá todos los campos del cliente.");
    } else {
      Alert.alert(
        "Faltan datos",
        "Completá todos los campos del cliente."
      );
    }

    return;
  }

  // Agregar el cliente después de validar.
  addCliente({
    nombre: nombre.trim(),
    apellido: apellido.trim(),
    dni: dni.trim(),
    telefono: telefono.trim(),
    correo: correo.trim(),
    foto: imagen ? { uri: imagen } : null,
  });

  // Confirmar el registro según la plataforma.
  if (Platform.OS === "web") {
    window.alert("El cliente se registró con éxito.");
    limpiarFormulario();
    router.back();
  } else {
    Alert.alert("¡Listo!", "El cliente se registró con éxito.", [
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
        <Titulo>Registrar Cliente</Titulo>
      </Header>

      <ScrollView contentContainerStyle={{ padding: 24 }}>
        <SelectorImagen onPress={seleccionarImagen} activeOpacity={0.7}>
          {imagen ? (
            <ImagenPreview source={{ uri: imagen }} resizeMode="cover" />
          ) : (
            <>
              <Ionicons name="image-outline" size={36} color="#5B7085" />
              <TextoSelector>Agregar Foto</TextoSelector>
            </>
          )}
        </SelectorImagen>

        <Etiqueta>Nombre</Etiqueta>
        <Input
          placeholder="Ej: Juan"
          value={nombre}
          onChangeText={setNombre}
        />

        <Etiqueta>Apellido</Etiqueta>
        <Input
          placeholder="Ej: Pérez"
          value={apellido}
          onChangeText={setApellido}
        />

          <ChipsRow>
          <Etiqueta>DNI</Etiqueta>
          <Input
            placeholder="Ej: 12345678"
            value={dni}
            onChangeText={setDni}
            keyboardType="numeric"
          />
          {/* resto de los campos */}
        </ChipsRow>

        <Etiqueta>Teléfono</Etiqueta>
        <Input
          placeholder="Ej: 123456789"
          value={telefono}
          onChangeText={setTelefono}
          keyboardType="numeric"
        />

        <Etiqueta>Correo Electrónico</Etiqueta>
        <Input
          placeholder="Ej: juan.perez@example.com"
          value={correo}
          onChangeText={setCorreo}
          keyboardType="email-address"
        />

      


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

