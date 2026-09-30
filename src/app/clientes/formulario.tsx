import { colores } from "@/constants/colores";
import { useClientes } from "@/store/clientes";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

// Un error posible por cada campo del formulario.
type Errores = Partial<
  Record<"nombre" | "apellido" | "dni" | "telefono" | "correo", string>
>;

const CORREO_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function FormularioCliente() {
  const router = useRouter();
  const agregarCliente = useClientes((s) => s.agregarCliente);
  const editarCliente = useClientes((s) => s.editarCliente);

  // Si llega un id, buscamos a ese cliente: estamos editando.
  const { id } = useLocalSearchParams<{ id?: string }>();
  const clienteExistente = useClientes((s) =>
    s.clientes.find((c) => c.id === id),
  );
  const modoEdicion = clienteExistente !== undefined;

  // Cada campo arranca con el dato del cliente, o vacío si es un alta.
  const [nombre, setNombre] = useState(clienteExistente?.nombre ?? "");
  const [apellido, setApellido] = useState(clienteExistente?.apellido ?? "");
  const [dni, setDni] = useState(clienteExistente?.dni ?? "");
  const [telefono, setTelefono] = useState(clienteExistente?.telefono ?? "");
  const [correo, setCorreo] = useState(clienteExistente?.correo ?? "");
  const [foto, setFoto] = useState<string | null>(
    clienteExistente?.foto ?? null,
  );
  const [errores, setErrores] = useState<Errores>({});

  // Revisa todos los campos y devuelve todos los errores juntos,
  // así el usuario ve de una vez todo lo que tiene que corregir.
  function validar(): Errores {
    const e: Errores = {};
    if (!nombre.trim()) e.nombre = "Escribí el nombre.";
    if (!apellido.trim()) e.apellido = "Escribí el apellido.";
    if (!/^\d{7,8}$/.test(dni.trim()))
      e.dni = "Tiene que tener 7 u 8 números, sin puntos.";
    if (telefono.replace(/\D/g, "").length < 8)
      e.telefono = "Escribí el teléfono con código de área.";
    if (!CORREO_VALIDO.test(correo.trim()))
      e.correo = "Escribí un correo válido, como nombre@mail.com.";
    return e;
  }

  function guardar() {
    const e = validar();
    setErrores(e);
    if (Object.keys(e).length > 0) return;

    const datos = {
      nombre: nombre.trim(),
      apellido: apellido.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
      correo: correo.trim().toLowerCase(),
      foto,
    };

    // Misma pantalla, dos acciones distintas del store.
    const resultado = modoEdicion
      ? editarCliente(clienteExistente.id, datos)
      : agregarCliente(datos);

    if (!resultado.ok) {
      setErrores({ dni: resultado.error });
      return;
    }
    router.back();
  }

  async function elegirDeGaleria() {
    const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permiso.granted) return;
    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!resultado.canceled) setFoto(resultado.assets[0].uri);
  }

  async function sacarFoto() {
    const permiso = await ImagePicker.requestCameraPermissionsAsync();
    if (!permiso.granted) return;
    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!resultado.canceled) setFoto(resultado.assets[0].uri);
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
            <Titulo>{modoEdicion ? "Editar cliente" : "Nuevo cliente"}</Titulo>
          </Encabezado>

          <FilaFoto>
            {foto ? (
              <Foto source={{ uri: foto }} />
            ) : (
              <SinFoto>
                <Ionicons
                  name="person-outline"
                  size={30}
                  color={colores.tintaSuave}
                />
              </SinFoto>
            )}
            <BotonesFoto>
              <BotonChico onPress={elegirDeGaleria}>
                <Ionicons
                  name="images-outline"
                  size={17}
                  color={colores.tinta}
                />
                <TextoChico>Galería</TextoChico>
              </BotonChico>
              {/* La cámara no está disponible en la versión web */}
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
              {foto && (
                <BotonChico onPress={() => setFoto(null)}>
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
            </BotonesFoto>
          </FilaFoto>

          <FilaDoble>
            <Mitad>
              <Campo
                etiqueta="Nombre"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
                error={errores.nombre}
              />
            </Mitad>
            <Mitad>
              <Campo
                etiqueta="Apellido"
                value={apellido}
                onChangeText={setApellido}
                autoCapitalize="words"
                error={errores.apellido}
              />
            </Mitad>
          </FilaDoble>
          <Campo
            etiqueta="DNI"
            value={dni}
            onChangeText={setDni}
            keyboardType="number-pad"
            maxLength={8}
            placeholder="Sin puntos"
            error={errores.dni}
          />
          <Campo
            etiqueta="Teléfono"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
            placeholder="Ej: 351 555-1234"
            error={errores.telefono}
          />
          <Campo
            etiqueta="Correo electrónico"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="nombre@mail.com"
            error={errores.correo}
          />
        </ScrollView>

        <BarraInferior>
          <BotonGuardar onPress={guardar} activeOpacity={0.8}>
            <TextoGuardar>
              {modoEdicion ? "Guardar cambios" : "Registrar cliente"}
            </TextoGuardar>
          </BotonGuardar>
        </BarraInferior>
      </KeyboardAvoidingView>
    </Contenedor>
  );
}

// ---------- Componente Campo: etiqueta + input + mensaje de error ----------

interface CampoProps extends TextInputProps {
  etiqueta: string;
  error?: string;
}

function Campo({ etiqueta, error, ...inputProps }: CampoProps) {
  return (
    <GrupoCampo>
      <Etiqueta>{etiqueta}</Etiqueta>
      <Input
        $error={!!error}
        placeholderTextColor={colores.tintaSuave}
        {...inputProps}
      />
      {error ? <TextoError>{error}</TextoError> : null}
    </GrupoCampo>
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

const Titulo = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const FilaFoto = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
`;

const SinFoto = styled.View`
  width: 76px;
  height: 76px;
  border-radius: 38px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.superficie};
  border-width: 2px;
  border-style: dashed;
  border-color: ${colores.borde};
`;

const Foto = styled.Image`
  width: 76px;
  height: 76px;
  border-radius: 38px;
`;

const BotonesFoto = styled.View`
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

const FilaDoble = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const Mitad = styled.View`
  flex: 1;
`;

const GrupoCampo = styled.View`
  margin-bottom: 14px;
`;

const Etiqueta = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${colores.tinta};
  margin-bottom: 6px;
`;

// $error es una "transient prop": la usa el estilo, pero no llega al TextInput.
const Input = styled.TextInput<{ $error: boolean }>`
  height: 48px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 16px;
  color: ${colores.tinta};
  background-color: ${colores.superficie};
  border-width: ${({ $error }) => ($error ? "2px" : "1px")};
  border-color: ${({ $error }) => ($error ? colores.naranja : colores.borde)};
`;

const TextoError = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${colores.naranjaTexto};
  margin-top: 4px;
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
