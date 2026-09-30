import { colores } from "@/constants/colores";
import {
  estaEnCurso,
  estaVencido,
  textoVencimiento,
  useAlquileres,
} from "@/store/alquileres";
import { useClientes } from "@/store/clientes";
import { copiasDisponibles, useLibros } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

export default function DetalleLibro() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const libro = useLibros((s) => s.libros.find((l) => l.id === id));
  const eliminarLibro = useLibros((s) => s.eliminarLibro);
  const alquileres = useAlquileres((s) => s.alquileres);
  const clientes = useClientes((s) => s.clientes);

  if (!libro) {
    return (
      <Contenedor edges={["top"]}>
        <Vacio>
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={colores.tintaSuave}
          />
          <TituloVacio>No encontramos este libro</TituloVacio>
          <BotonClaro onPress={() => router.back()}>
            <TextoBotonClaro>Volver al catálogo</TextoBotonClaro>
          </BotonClaro>
        </Vacio>
      </Contenedor>
    );
  }

  const disponibles = copiasDisponibles(libro);
  const hayCopias = disponibles > 0;

  // Una barrita por copia: azul si está libre, gris si está prestada.
  const segmentos = Array.from(
    { length: libro.copias },
    (_, i) => i < disponibles,
  );

  // Los préstamos en curso de este libro, el que vence primero arriba.
  const prestamos = alquileres
    .filter((a) => a.libroId === libro.id && estaEnCurso(a))
    .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));

  const avisar = (titulo: string, mensaje: string) => {
    if (Platform.OS === "web") window.alert(mensaje);
    else Alert.alert(titulo, mensaje);
  };

  const confirmarEliminacion = () => {
    const eliminar = () => {
      const resultado = eliminarLibro(libro.id);
      // El store lo rechaza si tiene copias prestadas.
      if (!resultado.ok) {
        avisar("No se puede eliminar", resultado.error);
        return;
      }
      router.back();
    };

    const mensaje = `¿Eliminar "${libro.titulo}" del catálogo? Esta acción no se puede deshacer.`;
    if (Platform.OS === "web") {
      if (window.confirm(mensaje)) eliminar();
      return;
    }
    Alert.alert("Eliminar libro", mensaje, [
      { text: "Cancelar", style: "cancel" },
      { text: "Eliminar", style: "destructive", onPress: eliminar },
    ]);
  };

  return (
    <Fondo>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <Cabecera edges={["top"]}>
          <FilaSuperior>
            <BotonRedondo
              onPress={() => router.back()}
              accessibilityLabel="Volver"
            >
              <Ionicons name="chevron-back" size={22} color={colores.tinta} />
            </BotonRedondo>
            <BotonEditar
              onPress={() =>
                router.push({
                  pathname: "/libros/formulario",
                  params: { id: libro.id },
                })
              }
            >
              <Ionicons name="create-outline" size={18} color={colores.tinta} />
              <TextoEditar>Editar</TextoEditar>
            </BotonEditar>
          </FilaSuperior>

          {libro.portada ? (
            <Portada source={libro.portada} resizeMode="cover" />
          ) : (
            <TapaGenerica>
              <TituloTapa numberOfLines={6}>{libro.titulo}</TituloTapa>
            </TapaGenerica>
          )}
        </Cabecera>

        <Contenido>
          <Titulo>{libro.titulo}</Titulo>
          <Autor>{libro.autor}</Autor>
          <FilaEtiquetas>
            <Etiqueta>
              <TextoEtiqueta>{libro.genero}</TextoEtiqueta>
            </Etiqueta>
            <Etiqueta>
              <TextoEtiqueta>{libro.editorial}</TextoEtiqueta>
            </Etiqueta>
          </FilaEtiquetas>

          <Tarjeta>
            <FilaDisponibilidad>
              <TextoFuerte>Disponibilidad</TextoFuerte>
              <TextoCopias
                style={{
                  color: hayCopias ? colores.azulTexto : colores.naranjaTexto,
                }}
              >
                {hayCopias
                  ? `${disponibles} de ${libro.copias} copias`
                  : "Sin copias libres"}
              </TextoCopias>
            </FilaDisponibilidad>
            <Barra>
              {segmentos.map((libre, i) => (
                <Segmento
                  key={i}
                  style={{
                    backgroundColor: libre ? colores.azul : colores.borde,
                  }}
                />
              ))}
            </Barra>
          </Tarjeta>
          <BotonPrestar
            onPress={() =>
              router.push({
                pathname: "/alquileres/registrar",
                params: { libroId: libro.id },
              })
            }
            disabled={!hayCopias}
            style={{ opacity: hayCopias ? 1 : 0.4 }}
            activeOpacity={0.8}
          >
            <TextoPrestar>
              {hayCopias ? "Prestar este libro" : "Sin copias para prestar"}
            </TextoPrestar>
          </BotonPrestar>

          <TituloSeccion>
            {prestamos.length === 0
              ? "Nadie lo tiene ahora"
              : "Lo tienen ahora"}
          </TituloSeccion>
          {prestamos.map((a) => {
            const cliente = clientes.find((c) => c.id === a.clienteId);
            const vencido = estaVencido(a);
            const iniciales = cliente
              ? `${cliente.nombre[0]}${cliente.apellido[0]}`.toUpperCase()
              : "?";
            return (
              <FilaPersona
                key={a.id}
                onPress={() =>
                  cliente &&
                  router.push({
                    pathname: "/clientes/detalle",
                    params: { id: cliente.id },
                  })
                }
                style={
                  vencido
                    ? { borderWidth: 2, borderColor: colores.naranja }
                    : undefined
                }
              >
                <AvatarChico>
                  <InicialesChicas>{iniciales}</InicialesChicas>
                </AvatarChico>
                <DatosPersona>
                  <NombrePersona>
                    {cliente
                      ? `${cliente.nombre} ${cliente.apellido}`
                      : "Cliente eliminado"}
                  </NombrePersona>
                  <TextoVence
                    style={{
                      color: vencido
                        ? colores.naranjaTexto
                        : colores.tintaSuave,
                    }}
                  >
                    {textoVencimiento(a)}
                  </TextoVence>
                </DatosPersona>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colores.tintaSuave}
                />
              </FilaPersona>
            );
          })}

          <BotonEliminar onPress={confirmarEliminacion} activeOpacity={0.7}>
            <Ionicons
              name="trash-outline"
              size={20}
              color={colores.naranjaTexto}
            />
            <TextoEliminar>Eliminar libro</TextoEliminar>
          </BotonEliminar>
        </Contenido>
      </ScrollView>
    </Fondo>
  );
}

// ---------- Estilos ----------

const Fondo = styled.View`
  flex: 1;
  background-color: ${colores.fondo};
`;

const Contenedor = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colores.fondo};
`;

// El bloque celeste de arriba; la portada "sale" por debajo con un margen negativo.
const Cabecera = styled(SafeAreaView)`
  background-color: #d9e4f3;
  align-items: center;
  padding: 8px 16px 0 16px;
  margin-bottom: 52px;
`;

const FilaSuperior = styled.View`
  width: 100%;
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const BotonRedondo = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.superficie};
`;

const BotonEditar = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background-color: ${colores.superficie};
`;

const TextoEditar = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${colores.tinta};
`;

const Portada = styled.Image`
  width: 150px;
  height: 222px;
  border-radius: 6px;
  margin-bottom: -36px;
`;

const TapaGenerica = styled.View`
  width: 150px;
  height: 222px;
  padding: 14px;
  border-radius: 6px;
  margin-bottom: -36px;
  background-color: ${colores.tinta};
`;

const TituloTapa = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
`;

const Contenido = styled.View`
  padding: 0 20px;
`;

const Titulo = styled.Text`
  font-size: 26px;
  font-weight: bold;
  text-align: center;
  color: ${colores.tinta};
`;

const Autor = styled.Text`
  font-size: 16px;
  text-align: center;
  color: ${colores.tintaSuave};
  margin-top: 4px;
`;

const FilaEtiquetas = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 6px;
  margin: 12px 0 20px 0;
`;

const Etiqueta = styled.View`
  padding: 5px 12px;
  border-radius: 14px;
  background-color: ${colores.superficie};
`;

const TextoEtiqueta = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${colores.tinta};
`;

const Tarjeta = styled.View`
  padding: 16px;
  border-radius: 16px;
  gap: 10px;
  background-color: ${colores.superficie};
`;

const FilaDisponibilidad = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;
`;

const TextoFuerte = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const TextoCopias = styled.Text`
  font-size: 14px;
  font-weight: 600;
`;

const Barra = styled.View`
  flex-direction: row;
  gap: 6px;
`;

const Segmento = styled.View`
  flex: 1;
  height: 8px;
  border-radius: 4px;
`;

const BotonEliminar = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  margin-top: 28px;
  border-radius: 16px;
  background-color: ${colores.naranjaClaro};
`;

const TextoEliminar = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.naranjaTexto};
`;

const Vacio = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 32px;
`;

const TituloVacio = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const BotonClaro = styled.TouchableOpacity`
  height: 44px;
  padding: 0 18px;
  border-radius: 22px;
  justify-content: center;
  background-color: ${colores.azulClaro};
`;

const TextoBotonClaro = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${colores.azulTexto};
`;

const BotonPrestar = styled.TouchableOpacity`
  height: 54px;
  margin-top: 16px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azul};
`;

const TextoPrestar = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: #ffffff;
`;

const TituloSeccion = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${colores.tinta};
  margin: 24px 0 10px 0;
`;

const FilaPersona = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 10px;
  border-radius: 16px;
  background-color: ${colores.superficie};
`;

const AvatarChico = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azulClaro};
`;

const InicialesChicas = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.azulTexto};
`;

const DatosPersona = styled.View`
  flex: 1;
`;

const NombrePersona = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${colores.tinta};
`;

const TextoVence = styled.Text`
  font-size: 13px;
  margin-top: 2px;
`;
