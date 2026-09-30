import { colores } from "@/constants/colores";
import {
  estaEnCurso,
  estaVencido,
  formatearFecha,
  textoVencimiento,
  useAlquileres,
  type Alquiler,
} from "@/store/alquileres";
import { useClientes } from "@/store/clientes";
import { useLibros, type Libro } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Alert, Linking, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

export default function DetalleCliente() {
  const router = useRouter();
  // El id llega desde la lista: router.push({ pathname: "/clientes/detalle", params: { id } })
  const { id } = useLocalSearchParams<{ id: string }>();

  // Buscamos al cliente en el store. Si sus datos cambian, la ficha se actualiza sola.
  const cliente = useClientes((s) => s.clientes.find((c) => c.id === id));

  const eliminarCliente = useClientes((s) => s.eliminarCliente);
  const alquileres = useAlquileres((s) => s.alquileres);
  const devolverAlquiler = useAlquileres((s) => s.devolverAlquiler);
  const libros = useLibros((s) => s.libros);

  // Si el cliente no existe (por ejemplo, porque se eliminó), mostramos un aviso.
  if (!cliente) {
    return (
      <Contenedor edges={["top"]}>
        <Vacio>
          <Ionicons
            name="alert-circle-outline"
            size={44}
            color={colores.tintaSuave}
          />
          <TituloVacio>No encontramos este cliente</TituloVacio>
          <BotonClaro onPress={() => router.back()}>
            <TextoBotonClaro>Volver a la lista</TextoBotonClaro>
          </BotonClaro>
        </Vacio>
      </Contenedor>
    );
  }

  const iniciales =
    `${cliente.nombre[0] ?? ""}${cliente.apellido[0] ?? ""}`.toUpperCase();

  // Linking abre la app de teléfono o de correo del celular.
  const llamar = () =>
    Linking.openURL(`tel:${cliente.telefono.replace(/\s/g, "")}`);
  const escribir = () => Linking.openURL(`mailto:${cliente.correo}`);
  // Los préstamos de este cliente, separados en activos e historial.
  const suyos = alquileres.filter((a) => a.clienteId === cliente.id);
  const activos = suyos
    .filter(estaEnCurso)
    .sort((a, b) => a.fechaVencimiento.localeCompare(b.fechaVencimiento));
  const historial = suyos
    .filter((a) => !estaEnCurso(a))
    .sort((a, b) =>
      (b.fechaDevolucion ?? "").localeCompare(a.fechaDevolucion ?? ""),
    );

  const avisar = (titulo: string, mensaje: string) => {
    if (Platform.OS === "web") window.alert(mensaje);
    else Alert.alert(titulo, mensaje);
  };

  const confirmarDevolucion = (alquiler: Alquiler, titulo: string) => {
    const mensaje = `¿${cliente.nombre} devolvió "${titulo}"?`;
    if (Platform.OS === "web") {
      if (window.confirm(mensaje)) devolverAlquiler(alquiler.id);
      return;
    }
    Alert.alert("Registrar devolución", mensaje, [
      { text: "Cancelar", style: "cancel" },
      { text: "Devolver", onPress: () => devolverAlquiler(alquiler.id) },
    ]);
  };

  const confirmarEliminacion = () => {
    // Si tiene préstamos, avisamos y ni siquiera preguntamos.
    if (activos.length > 0) {
      avisar(
        "No se puede eliminar",
        "Tiene libros prestados. Primero registrá las devoluciones.",
      );
      return;
    }
    const nombreCompleto = `${cliente.nombre} ${cliente.apellido}`;

    const eliminar = () => {
      // Primero volvemos a la lista y después borramos.
      // Si lo hiciéramos al revés, la ficha mostraría un instante el aviso de "no encontrado".
      router.back();
      eliminarCliente(cliente.id);
    };

    // Alert con botones no funciona en la web, ahí usamos window.confirm.
    if (Platform.OS === "web") {
      if (
        window.confirm(
          `¿Eliminar a ${nombreCompleto}? Esta acción no se puede deshacer.`,
        )
      )
        eliminar();
      return;
    }
    Alert.alert(
      "Eliminar cliente",
      `¿Eliminar a ${nombreCompleto}? Esta acción no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Eliminar", style: "destructive", onPress: eliminar },
      ],
    );
  };

  return (
    <Fondo>
      <Cabecera edges={["top"]}>
        <FilaSuperior>
          <BotonRedondo
            onPress={() => router.back()}
            accessibilityLabel="Volver"
          >
            <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
          </BotonRedondo>
          <BotonEditar
            onPress={() =>
              router.push({
                pathname: "/clientes/formulario",
                params: { id: cliente.id },
              })
            }
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <TextoEditar>Editar</TextoEditar>
          </BotonEditar>
        </FilaSuperior>

        <FilaPerfil>
          {cliente.foto ? (
            <Foto source={{ uri: cliente.foto }} />
          ) : (
            <Avatar>
              <Iniciales>{iniciales}</Iniciales>
            </Avatar>
          )}
          <DatosPerfil>
            <Nombre>
              {cliente.nombre} {cliente.apellido}
            </Nombre>
            <Dni>DNI {cliente.dni}</Dni>
          </DatosPerfil>
        </FilaPerfil>

        <FilaAcciones>
          <BotonAccion onPress={llamar}>
            <Ionicons name="call-outline" size={18} color="#FFFFFF" />
            <TextoAccion>Llamar</TextoAccion>
          </BotonAccion>
          <BotonAccion onPress={escribir}>
            <Ionicons name="mail-outline" size={18} color="#FFFFFF" />
            <TextoAccion>Correo</TextoAccion>
          </BotonAccion>
        </FilaAcciones>
      </Cabecera>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <TituloSeccion>Datos de contacto</TituloSeccion>
        <Tarjeta>
          <FilaDato>
            <Ionicons name="call-outline" size={20} color={colores.azul} />
            <TextosDato>
              <EtiquetaDato>Teléfono</EtiquetaDato>
              <ValorDato>{cliente.telefono}</ValorDato>
            </TextosDato>
          </FilaDato>
          <Separador />
          <FilaDato>
            <Ionicons name="mail-outline" size={20} color={colores.azul} />
            <TextosDato>
              <EtiquetaDato>Correo electrónico</EtiquetaDato>
              <ValorDato>{cliente.correo}</ValorDato>
            </TextosDato>
          </FilaDato>
        </Tarjeta>
        <BotonPrestar
          onPress={() =>
            router.push({
              pathname: "/alquileres/registrar",
              params: { clienteId: cliente.id },
            })
          }
          activeOpacity={0.8}
        >
          <Ionicons name="book-outline" size={20} color="#FFFFFF" />
          <TextoPrestar>Prestarle un libro</TextoPrestar>
        </BotonPrestar>

        <TituloSeccion style={{ marginTop: 24 }}>
          Libros que tiene ahora
        </TituloSeccion>
        {activos.length === 0 ? (
          <TextoSuave>No tiene libros prestados.</TextoSuave>
        ) : (
          activos.map((a) => {
            const libro = libros.find((l) => l.id === a.libroId);
            return (
              <FilaPrestamo
                key={a.id}
                alquiler={a}
                libro={libro}
                onDevolver={() =>
                  confirmarDevolucion(a, libro?.titulo ?? "el libro")
                }
              />
            );
          })
        )}

        {historial.length > 0 && (
          <>
            <TituloSeccion style={{ marginTop: 24 }}>Historial</TituloSeccion>
            {historial.map((a) => (
              <FilaPrestamo
                key={a.id}
                alquiler={a}
                libro={libros.find((l) => l.id === a.libroId)}
              />
            ))}
          </>
        )}
        <BotonEliminar onPress={confirmarEliminacion} activeOpacity={0.7}>
          <Ionicons
            name="trash-outline"
            size={20}
            color={colores.naranjaTexto}
          />
          <TextoEliminar>Eliminar cliente</TextoEliminar>
        </BotonEliminar>
      </ScrollView>
    </Fondo>
  );
}
// Una fila de préstamo. Si recibe onDevolver, muestra el botón.
function FilaPrestamo({
  alquiler,
  libro,
  onDevolver,
}: {
  alquiler: Alquiler;
  libro?: Libro;
  onDevolver?: () => void;
}) {
  const vencido = estaVencido(alquiler);
  const enCurso = estaEnCurso(alquiler);
  return (
    <TarjetaPrestamo
      style={
        vencido ? { borderWidth: 2, borderColor: colores.naranja } : undefined
      }
    >
      {libro?.portada ? (
        <PortadaChica source={libro.portada} resizeMode="cover" />
      ) : (
        <TapaChica />
      )}
      <DatosPrestamo>
        <TituloLibro numberOfLines={2}>
          {libro?.titulo ?? "Libro eliminado"}
        </TituloLibro>
        {enCurso ? (
          <EtiquetaVence
            style={{
              backgroundColor: vencido
                ? colores.naranjaClaro
                : colores.azulClaro,
            }}
          >
            <TextoVence
              style={{
                color: vencido ? colores.naranjaTexto : colores.azulTexto,
              }}
            >
              {textoVencimiento(alquiler)}
            </TextoVence>
          </EtiquetaVence>
        ) : (
          <TextoSuave>
            Devuelto el {formatearFecha(alquiler.fechaDevolucion!)}
          </TextoSuave>
        )}
      </DatosPrestamo>
      {onDevolver && (
        <BotonDevolver
          onPress={onDevolver}
          style={
            vencido
              ? { backgroundColor: colores.tinta, borderColor: colores.tinta }
              : undefined
          }
        >
          <TextoDevolver style={vencido ? { color: "#FFFFFF" } : undefined}>
            Devolver
          </TextoDevolver>
        </BotonDevolver>
      )}
    </TarjetaPrestamo>
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

// La cabecera azul marino. SafeAreaView deja el espacio de la barra de estado.
const Cabecera = styled(SafeAreaView)`
  background-color: ${colores.tinta};
  padding: 8px 20px 24px 20px;
  gap: 18px;
`;

const FilaSuperior = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const BotonRedondo = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: #24345a;
`;

const BotonEditar = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background-color: #24345a;
`;

const TextoEditar = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
`;

const FilaPerfil = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 16px;
`;

const Avatar = styled.View`
  width: 72px;
  height: 72px;
  border-radius: 36px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azulClaro};
`;

const Foto = styled.Image`
  width: 72px;
  height: 72px;
  border-radius: 36px;
`;

const Iniciales = styled.Text`
  font-size: 26px;
  font-weight: bold;
  color: ${colores.azulTexto};
`;

const DatosPerfil = styled.View`
  flex: 1;
`;

const Nombre = styled.Text`
  font-size: 26px;
  font-weight: bold;
  color: #ffffff;
`;

const Dni = styled.Text`
  font-size: 14px;
  color: #afc0de;
  margin-top: 3px;
`;

const FilaAcciones = styled.View`
  flex-direction: row;
  gap: 10px;
`;

const BotonAccion = styled.TouchableOpacity`
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 44px;
  border-radius: 12px;
  background-color: #24345a;
`;

const TextoAccion = styled.Text`
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
`;

const TituloSeccion = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${colores.tinta};
  margin-bottom: 10px;
`;

const Tarjeta = styled.View`
  border-radius: 16px;
  background-color: ${colores.superficie};
`;

const FilaDato = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
`;

const TextosDato = styled.View`
  flex: 1;
`;

const EtiquetaDato = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
`;

const ValorDato = styled.Text`
  font-size: 16px;
  color: ${colores.tinta};
  margin-top: 2px;
`;

const Separador = styled.View`
  height: 1px;
  margin-left: 50px;
  background-color: ${colores.borde};
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
const BotonPrestar = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 52px;
  margin-top: 20px;
  border-radius: 16px;
  background-color: ${colores.azul};
`;

const TextoPrestar = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #ffffff;
`;

const TextoSuave = styled.Text`
  font-size: 14px;
  color: ${colores.tintaSuave};
`;

const TarjetaPrestamo = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 12px 14px;
  margin-bottom: 10px;
  border-radius: 16px;
  background-color: ${colores.superficie};
`;

const PortadaChica = styled.Image`
  width: 46px;
  height: 62px;
  border-radius: 4px;
`;

const TapaChica = styled.View`
  width: 46px;
  height: 62px;
  border-radius: 4px;
  background-color: ${colores.tinta};
`;

const DatosPrestamo = styled.View`
  flex: 1;
  gap: 4px;
`;

const TituloLibro = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const EtiquetaVence = styled.View`
  align-self: flex-start;
  padding: 3px 9px;
  border-radius: 12px;
`;

const TextoVence = styled.Text`
  font-size: 12px;
  font-weight: bold;
`;

const BotonDevolver = styled.TouchableOpacity`
  height: 36px;
  padding: 0 14px;
  border-radius: 18px;
  border-width: 1px;
  border-color: ${colores.borde};
  justify-content: center;
  background-color: ${colores.superficie};
`;

const TextoDevolver = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: ${colores.tinta};
`;
