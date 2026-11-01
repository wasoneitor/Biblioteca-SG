import { Ionicons } from "@expo/vector-icons";
import * as Speech from "expo-speech";
import { useEffect, useState } from "react";
import styled, { useTheme } from "styled-components/native";

interface BotonEscucharProps {
  texto: string; // lo que se va a leer en voz alta
  etiqueta?: string; // el texto del botón
}

// Un botón que lee un texto en voz alta con expo-speech (la voz del celular).
// Si se toca mientras habla, se detiene.
export function BotonEscuchar({
  texto,
  etiqueta = "Escuchar",
}: BotonEscucharProps) {
  const { colores } = useTheme();
  const [hablando, setHablando] = useState(false);

  // Si el usuario sale de la pantalla mientras habla, se corta la lectura.
  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  function alternar() {
    if (hablando) {
      Speech.stop(); // dispara onStopped, que pone hablando en false
      return;
    }
    setHablando(true);
    Speech.speak(texto, {
      language: "es-AR", // si el celular no tiene voz argentina, usa otra en español
      rate: 0.95, // un poquito más lento que lo normal, para que se entienda bien
      // Estas funciones avisan cuándo terminó de hablar, para volver el botón a "Escuchar".
      onDone: () => setHablando(false),
      onStopped: () => setHablando(false),
      onError: () => setHablando(false),
    });
  }

  return (
    <Boton
      onPress={alternar}
      activeOpacity={0.7}
      accessibilityLabel={hablando ? "Detener lectura" : etiqueta}
    >
      <Ionicons
        name={hablando ? "stop-circle-outline" : "volume-high-outline"}
        size={20}
        color={colores.azulTexto}
      />
      <Texto>{hablando ? "Detener" : etiqueta}</Texto>
    </Boton>
  );
}

const Boton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 16px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colores.azulClaro};
`;

const Texto = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colores.azulTexto};
`;
