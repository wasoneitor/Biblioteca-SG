import { colores } from "@/constants/colores";
import type { TextInputProps } from "react-native";
import styled from "styled-components/native";

interface CampoProps extends TextInputProps {
  etiqueta: string;
  error?: string;
}

export function Campo({ etiqueta, error, ...inputProps }: CampoProps) {
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

const GrupoCampo = styled.View`
  margin-bottom: 14px;
`;

// Exportamos la etiqueta y el error para usarlos también en campos que no son inputs
// (como los chips de género o el contador de copias).
export const Etiqueta = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${colores.tinta};
  margin-bottom: 6px;
`;

export const TextoError = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${colores.naranjaTexto};
  margin-top: 4px;
`;

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
