import "styled-components/native";
import type { Tema } from "@/constants/tema";

// Le avisa a TypeScript cómo es nuestro tema. Así, al escribir
// ${({ theme }) => theme.colores.} el editor autocompleta los colores
// y marca error si escribimos uno que no existe.
declare module "styled-components/native" {
  export interface DefaultTheme extends Tema {}
}
