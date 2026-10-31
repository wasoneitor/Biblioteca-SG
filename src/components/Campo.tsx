import type { TextInputProps } from "react-native";
import styled, { useTheme } from "styled-components/native";

interface CampoProps extends TextInputProps {
  etiqueta: string;
  error?: string;
}

export function Campo({ etiqueta, error, ...inputProps }: CampoProps) {
  // Fuera de los styled components, el tema se lee con el hook useTheme().
  const { colores } = useTheme();

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
// Dentro de un styled component, el tema llega como prop: ({ theme }) => ...
export const Etiqueta = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colores.tinta};
  margin-bottom: 6px;
`;

export const TextoError = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colores.naranjaTexto};
  margin-top: 4px;
`;

const Input = styled.TextInput<{ $error: boolean }>`
  height: 48px;
  padding: 0 14px;
  border-radius: 12px;
  font-size: 16px;
  color: ${({ theme }) => theme.colores.tinta};
  background-color: ${({ theme }) => theme.colores.superficie};
  border-width: ${({ $error }) => ($error ? "2px" : "1px")};
  border-color: ${({ $error, theme }) =>
    $error ? theme.colores.naranja : theme.colores.borde};
`;
