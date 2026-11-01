import { useEffect, useRef, type ReactNode } from "react";
import { Animated, Easing } from "react-native";

interface LatidoProps {
  activo: boolean; // true = late; false = se queda quieto
  children: ReactNode; // lo que va a latir (por ejemplo, una tarjeta)
}

// Hace "latir" a lo que tenga adentro: crece un poquito y vuelve, una y otra vez.
// Lo usamos para que los préstamos vencidos llamen la atención.
export function Latido({ activo, children }: LatidoProps) {
  // 1) El valor animado: arranca en 1 (tamaño normal).
  //    useRef hace que no se cree uno nuevo en cada render (igual que escalaSello en la clase 9).
  const escala = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!activo) {
      escala.setValue(1); // si deja de estar vencido, vuelve a su tamaño
      return;
    }

    // 2) La animación: una secuencia que se repite para siempre.
    const animacion = Animated.loop(
      Animated.sequence([
        // crece un 3 % en 500 ms...
        Animated.timing(escala, {
          toValue: 1.03,
          duration: 500,
          easing: Easing.inOut(Easing.ease), // arranca y frena suave
          useNativeDriver: true, // la anima el celular directamente: más fluida
        }),
        // ...vuelve a su tamaño en 500 ms...
        Animated.timing(escala, {
          toValue: 1,
          duration: 500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        // ...y descansa un segundo antes del próximo latido.
        Animated.delay(1000),
      ]),
    );

    animacion.start();

    // 3) Limpieza: al salir de la pantalla se frena la animación.
    return () => animacion.stop();
  }, [activo, escala]);

  // 4) Animated.View: una View que sabe leer valores animados.
  //    "scale" agranda o achica lo que tiene adentro.
  return (
    <Animated.View style={{ transform: [{ scale: escala }] }}>
      {children}
    </Animated.View>
  );
}
