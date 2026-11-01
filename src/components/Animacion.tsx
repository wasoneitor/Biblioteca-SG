import LottieView from "lottie-react-native";
import styled from "styled-components/native";

// Las animaciones Lottie son archivos .json que describen formas y movimientos.
// require() necesita rutas fijas, por eso armamos un "catálogo" con un nombre para cada una.
const ANIMACIONES = {
  cargando: require("../../assets/animations/cargando.json"), // libro abierto con estrellitas (LottieFiles)
  exito: require("../../assets/animations/exito.json"), // ficha que entra a la carpeta + tilde (LottieFiles)
  error: require("../../assets/animations/error.json"), // círculo naranja con "!" (hecha a mano)
};

export type NombreAnimacion = keyof typeof ANIMACIONES;

interface AnimacionProps {
  nombre: NombreAnimacion; // cuál de las animaciones del catálogo
  tamanio?: number; // ancho y alto en píxeles (las tres animaciones son cuadradas)
  enBucle?: boolean; // true = se repite siempre; false = se reproduce una vez
  alTerminar?: () => void; // qué hacer cuando termina (solo si no está en bucle)
}

export function Animacion({
  nombre,
  tamanio = 160,
  enBucle = true,
  alTerminar,
}: AnimacionProps) {
  return (
    <Caja>
      <LottieView
        source={ANIMACIONES[nombre]}
        autoPlay // arranca sola apenas aparece
        loop={enBucle}
        // Algunas animaciones de LottieFiles (como "exito") combinan formas con
        // "merge paths"; en Android hay que activarlo para que se dibujen bien.
        enableMergePathsAndroidForKitKatAndAbove
        onAnimationFinish={(cancelada) => {
          // "cancelada" es true si la animación se cortó antes de terminar
          // (por ejemplo, porque el usuario salió de la pantalla).
          if (!cancelada) alTerminar?.();
        }}
        style={{ width: tamanio, height: tamanio }}
      />
    </Caja>
  );
}

const Caja = styled.View`
  align-items: center;
  justify-content: center;
`;
