import { colores } from "@/constants/colores";
import { PLAZOS, useAlquileres, type Plazo } from "@/store/alquileres";
import { useClientes } from "@/store/clientes";
import { copiasDisponibles, useLibros } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

export default function NuevoPrestamo() {
  const router = useRouter();
  // Si venimos desde la ficha de un libro o de un cliente, llega ya elegido.
  const params = useLocalSearchParams<{
    clienteId?: string;
    libroId?: string;
  }>();

  const clientes = useClientes((s) => s.clientes);
  const libros = useLibros((s) => s.libros);
  const registrarAlquiler = useAlquileres((s) => s.registrarAlquiler);

  const [clienteId, setClienteId] = useState<string | null>(
    params.clienteId ?? null,
  );
  const [libroId, setLibroId] = useState<string | null>(params.libroId ?? null);
  const [plazo, setPlazo] = useState<Plazo>(14);
  const [buscarCliente, setBuscarCliente] = useState("");
  const [buscarLibro, setBuscarLibro] = useState("");

  const cliente = clientes.find((c) => c.id === clienteId);
  const libro = libros.find((l) => l.id === libroId);

  const textoCliente = buscarCliente.trim().toLowerCase();
  const clientesFiltrados = clientes
    .filter((c) =>
      `${c.nombre} ${c.apellido} ${c.dni}`.toLowerCase().includes(textoCliente),
    )
    .sort((a, b) => a.apellido.localeCompare(b.apellido));

  // Solo se ofrecen libros con copias libres.
  const textoLibro = buscarLibro.trim().toLowerCase();
  const librosFiltrados = libros
    .filter((l) => copiasDisponibles(l) > 0)
    .filter((l) => `${l.titulo} ${l.autor}`.toLowerCase().includes(textoLibro))
    .sort((a, b) => a.titulo.localeCompare(b.titulo));

  // La fecha de vencimiento se calcula en vivo según el plazo elegido.
  const vencimiento = new Date();
  vencimiento.setDate(vencimiento.getDate() + plazo);
  const textoVencimiento = vencimiento.toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  function avisar(titulo: string, mensaje: string) {
    if (Platform.OS === "web") window.alert(mensaje);
    else Alert.alert(titulo, mensaje);
  }

  function confirmar() {
    if (!clienteId || !libroId) return;
    const resultado = registrarAlquiler(clienteId, libroId, plazo);
    if (!resultado.ok) {
      avisar("No se pudo prestar", resultado.error);
      return;
    }
    router.back();
  }

  const iniciales = (nombre: string, apellido: string) =>
    `${nombre[0] ?? ""}${apellido[0] ?? ""}`.toUpperCase();

  return (
    <Contenedor edges={["top", "bottom"]}>
      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 22 }}
        keyboardShouldPersistTaps="handled"
      >
        <Encabezado>
          <BotonVolver
            onPress={() => router.back()}
            accessibilityLabel="Volver"
          >
            <Ionicons name="chevron-back" size={22} color={colores.tinta} />
          </BotonVolver>
          <TituloPantalla>Nuevo préstamo</TituloPantalla>
        </Encabezado>

        {/* ---------- Cliente ---------- */}
        <Seccion>
          <TituloSeccion>Cliente</TituloSeccion>
          {cliente ? (
            <Elegido>
              {cliente.foto ? (
                <Foto source={{ uri: cliente.foto }} />
              ) : (
                <Avatar>
                  <Iniciales>
                    {iniciales(cliente.nombre, cliente.apellido)}
                  </Iniciales>
                </Avatar>
              )}
              <DatosElegido>
                <Nombre>
                  {cliente.nombre} {cliente.apellido}
                </Nombre>
                <Detalle>DNI {cliente.dni}</Detalle>
              </DatosElegido>
              <BotonCambiar onPress={() => setClienteId(null)}>
                <TextoCambiar>Cambiar</TextoCambiar>
              </BotonCambiar>
            </Elegido>
          ) : (
            <>
              <Buscador>
                <Ionicons name="search" size={18} color={colores.tintaSuave} />
                <InputBuscador
                  placeholder="Nombre o DNI"
                  placeholderTextColor={colores.tintaSuave}
                  value={buscarCliente}
                  onChangeText={setBuscarCliente}
                  autoCapitalize="none"
                />
              </Buscador>
              <Lista>
                {clientesFiltrados.length === 0 ? (
                  <SinResultados>
                    {clientes.length === 0
                      ? "No hay clientes registrados."
                      : "Nadie coincide con la búsqueda."}
                  </SinResultados>
                ) : (
                  clientesFiltrados.map((c) => (
                    <Opcion key={c.id} onPress={() => setClienteId(c.id)}>
                      <AvatarChico>
                        <InicialesChicas>
                          {iniciales(c.nombre, c.apellido)}
                        </InicialesChicas>
                      </AvatarChico>
                      <DatosElegido>
                        <Nombre>
                          {c.nombre} {c.apellido}
                        </Nombre>
                        <Detalle>DNI {c.dni}</Detalle>
                      </DatosElegido>
                    </Opcion>
                  ))
                )}
              </Lista>
            </>
          )}
        </Seccion>

        {/* ---------- Libro ---------- */}
        <Seccion>
          <TituloSeccion>Libro</TituloSeccion>
          {libro ? (
            <Elegido>
              {libro.portada ? (
                <Portada source={libro.portada} resizeMode="cover" />
              ) : (
                <TapaGenerica>
                  <TituloTapa numberOfLines={4}>{libro.titulo}</TituloTapa>
                </TapaGenerica>
              )}
              <DatosElegido>
                <Nombre>{libro.titulo}</Nombre>
                <Detalle>{libro.autor}</Detalle>
                <Disponibles>
                  {copiasDisponibles(libro)} de {libro.copias} disponibles
                </Disponibles>
              </DatosElegido>
              <BotonCambiar onPress={() => setLibroId(null)}>
                <TextoCambiar>Cambiar</TextoCambiar>
              </BotonCambiar>
            </Elegido>
          ) : (
            <>
              <Buscador>
                <Ionicons name="search" size={18} color={colores.tintaSuave} />
                <InputBuscador
                  placeholder="Título o autor"
                  placeholderTextColor={colores.tintaSuave}
                  value={buscarLibro}
                  onChangeText={setBuscarLibro}
                  autoCapitalize="none"
                />
              </Buscador>
              <Lista>
                {librosFiltrados.length === 0 ? (
                  <SinResultados>
                    No hay libros disponibles que coincidan.
                  </SinResultados>
                ) : (
                  librosFiltrados.map((l) => (
                    <Opcion key={l.id} onPress={() => setLibroId(l.id)}>
                      {l.portada ? (
                        <PortadaChica source={l.portada} resizeMode="cover" />
                      ) : (
                        <TapaChica />
                      )}
                      <DatosElegido>
                        <Nombre numberOfLines={1}>{l.titulo}</Nombre>
                        <Detalle numberOfLines={1}>{l.autor}</Detalle>
                      </DatosElegido>
                      <Disponibles>{copiasDisponibles(l)} libres</Disponibles>
                    </Opcion>
                  ))
                )}
              </Lista>
            </>
          )}
        </Seccion>

        {/* ---------- Plazo ---------- */}
        <Seccion>
          <TituloSeccion>Plazo de devolución</TituloSeccion>
          <FilaPlazos>
            {PLAZOS.map((p) => {
              const activo = p === plazo;
              return (
                <BotonPlazo
                  key={p}
                  onPress={() => setPlazo(p)}
                  style={{
                    backgroundColor: activo
                      ? colores.tinta
                      : colores.superficie,
                    borderColor: activo ? colores.tinta : colores.borde,
                  }}
                >
                  <TextoPlazo
                    style={{ color: activo ? "#FFFFFF" : colores.tinta }}
                  >
                    {p} días
                  </TextoPlazo>
                </BotonPlazo>
              );
            })}
          </FilaPlazos>
          <FilaFecha>
            <Ionicons
              name="calendar-outline"
              size={18}
              color={colores.tintaSuave}
            />
            <Detalle>Tiene que devolverlo el {textoVencimiento}</Detalle>
          </FilaFecha>
        </Seccion>
      </ScrollView>

      {/* Barra fija: resume qué se va a registrar */}
      <BarraInferior>
        <Resumen>
          {cliente && libro
            ? `${cliente.nombre} se lleva "${libro.titulo}" por ${plazo} días`
            : !cliente
              ? "Elegí un cliente"
              : "Elegí un libro"}
        </Resumen>
        <BotonConfirmar
          onPress={confirmar}
          disabled={!cliente || !libro}
          style={{ opacity: cliente && libro ? 1 : 0.4 }}
          activeOpacity={0.8}
        >
          <TextoConfirmar>Confirmar préstamo</TextoConfirmar>
        </BotonConfirmar>
      </BarraInferior>
    </Contenedor>
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
`;

const BotonVolver = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.superficie};
`;

const TituloPantalla = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const Seccion = styled.View`
  gap: 8px;
`;

const TituloSeccion = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colores.tintaSuave};
`;

const Elegido = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 14px;
  border-radius: 16px;
  border-width: 2px;
  border-color: ${colores.azul};
  background-color: ${colores.superficie};
`;

const Avatar = styled.View`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azulClaro};
`;

const Foto = styled.Image`
  width: 44px;
  height: 44px;
  border-radius: 22px;
`;

const Iniciales = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.azulTexto};
`;

const DatosElegido = styled.View`
  flex: 1;
`;

const Nombre = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const Detalle = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
`;

const Disponibles = styled.Text`
  font-size: 13px;
  font-weight: 600;
  color: ${colores.azulTexto};
  margin-top: 2px;
`;

const BotonCambiar = styled.TouchableOpacity`
  padding: 10px 4px;
`;

const TextoCambiar = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colores.azul};
`;

const Portada = styled.Image`
  width: 52px;
  height: 72px;
  border-radius: 4px;
`;

const TapaGenerica = styled.View`
  width: 52px;
  height: 72px;
  padding: 6px;
  border-radius: 4px;
  background-color: ${colores.tinta};
`;

const TituloTapa = styled.Text`
  color: #ffffff;
  font-size: 9px;
  font-weight: bold;
`;

const Buscador = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  background-color: ${colores.superficie};
`;

const InputBuscador = styled.TextInput`
  flex: 1;
  min-width: 0;
  font-size: 15px;
  color: ${colores.tinta};
`;

const Lista = styled.View`
  border-radius: 16px;
  overflow: hidden;
  background-color: ${colores.superficie};
`;

const Opcion = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom-width: 1px;
  border-bottom-color: ${colores.borde};
`;

const AvatarChico = styled.View`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azulClaro};
`;

const InicialesChicas = styled.Text`
  font-size: 13px;
  font-weight: bold;
  color: ${colores.azulTexto};
`;

const PortadaChica = styled.Image`
  width: 32px;
  height: 44px;
  border-radius: 3px;
`;

const TapaChica = styled.View`
  width: 32px;
  height: 44px;
  border-radius: 3px;
  background-color: ${colores.tinta};
`;

const SinResultados = styled.Text`
  padding: 16px;
  font-size: 14px;
  text-align: center;
  color: ${colores.tintaSuave};
`;

const FilaPlazos = styled.View`
  flex-direction: row;
  gap: 8px;
`;

const BotonPlazo = styled.TouchableOpacity`
  flex: 1;
  height: 48px;
  border-radius: 14px;
  border-width: 1px;
  align-items: center;
  justify-content: center;
`;

const TextoPlazo = styled.Text`
  font-size: 15px;
  font-weight: bold;
`;

const FilaFecha = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 8px;
`;

const BarraInferior = styled.View`
  gap: 10px;
  padding: 14px 20px;
  border-top-width: 1px;
  border-top-color: ${colores.borde};
  background-color: ${colores.superficie};
`;

const Resumen = styled.Text`
  font-size: 14px;
  text-align: center;
  color: ${colores.tintaSuave};
`;

const BotonConfirmar = styled.TouchableOpacity`
  height: 54px;
  border-radius: 16px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azul};
`;

const TextoConfirmar = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: #ffffff;
`;
