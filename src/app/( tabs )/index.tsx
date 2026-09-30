import { colores } from "@/constants/colores";
import { estaEnCurso, estaVencido, useAlquileres } from "@/store/alquileres";
import { useClientes } from "@/store/clientes";
import { useLibros } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { useCallback, useState, type ComponentProps } from "react";
import { FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

type NombreIcono = ComponentProps<typeof Ionicons>["name"];

export default function Inicio() {
  const router = useRouter();
  const libros = useLibros((s) => s.libros);
  const clientes = useClientes((s) => s.clientes);
  const alquileres = useAlquileres((s) => s.alquileres);

  // La barra de estado (hora, batería) en blanco sobre el azul marino,
  // y de vuelta en oscuro al salir de esta pantalla.
  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, []),
  );

  const hoy = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
  const fecha = hoy.charAt(0).toUpperCase() + hoy.slice(1); // "martes 30 de septiembre" → "Martes..."

  // Los agregados más recientes están al final del array: los damos vuelta.
  const recientes = [...libros].reverse().slice(0, 8);

  const enCurso = alquileres.filter(estaEnCurso);
  const vencidos = enCurso.filter(estaVencido);
  const primerVencido = vencidos[0];
  const libroVencido = libros.find((l) => l.id === primerVencido?.libroId);
  const clienteVencido = clientes.find(
    (c) => c.id === primerVencido?.clienteId,
  );

  const totalCopias = libros.reduce((suma, l) => suma + l.copias, 0);
  const [busqueda, setBusqueda] = useState("");
  const texto = busqueda.trim().toLowerCase();
  const buscando = texto.length >= 2; // recién buscamos con 2 letras

  const librosEncontrados = libros
    .filter((l) => `${l.titulo} ${l.autor}`.toLowerCase().includes(texto))
    .slice(0, 5);
  const clientesEncontrados = clientes
    .filter((c) =>
      `${c.nombre} ${c.apellido} ${c.dni}`.toLowerCase().includes(texto),
    )
    .slice(0, 5);

  const modulos: {
    titulo: string;
    detalle: string;
    icono: NombreIcono;
    ruta?: "/libros" | "/clientes" | "/alquileres";
  }[] = [
    {
      titulo: "Libros",
      detalle: `${libros.length} títulos, ${totalCopias} copias`,
      icono: "book-outline",
      ruta: "/libros",
    },
    {
      titulo: "Clientes",
      detalle: `${clientes.length} ${clientes.length === 1 ? "registrado" : "registrados"}`,
      icono: "people-outline",
      ruta: "/clientes",
    },
    {
      titulo: "Alquileres",
      detalle: `${enCurso.length} en curso`,
      icono: "swap-horizontal-outline",
      ruta: "/alquileres",
    },
    { titulo: "Open Library", detalle: "Próximamente", icono: "globe-outline" },
  ];

  return (
    <ScrollView
      style={{ backgroundColor: colores.fondo }}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      {/* ---------- Encabezado azul marino con el estante ---------- */}
      <Cabecera>
        <SafeAreaView edges={["top"]}>
          <Fecha>{fecha}</Fecha>
          <Marca>Biblioteca SG</Marca>
          <CajaBusqueda>
            <Ionicons name="search" size={20} color="#9FB0CE" />
            <InputBusqueda
              placeholder="Buscar libros o clientes"
              placeholderTextColor="#9FB0CE"
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="none"
            />
            {busqueda.length > 0 && (
              <BotonLimpiar
                onPress={() => setBusqueda("")}
                accessibilityLabel="Borrar búsqueda"
              >
                <Ionicons name="close-circle" size={20} color="#9FB0CE" />
              </BotonLimpiar>
            )}
          </CajaBusqueda>

          <FilaEstante>
            <TituloEstante>Recién agregados</TituloEstante>
            <VerTodos onPress={() => router.push("/libros")}>
              <TextoVerTodos>Ver todos</TextoVerTodos>
            </VerTodos>
          </FilaEstante>
        </SafeAreaView>

        {/* Las portadas "asoman" hacia abajo con un margen negativo */}
        <FlatList
          data={recientes}
          horizontal
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
          style={{ marginBottom: -44 }}
          renderItem={({ item }) => (
            <LibroEstante
              onPress={() =>
                router.push({
                  pathname: "/libros/detalle",
                  params: { id: item.id },
                })
              }
              activeOpacity={0.8}
            >
              {item.portada ? (
                <PortadaEstante source={item.portada} resizeMode="cover" />
              ) : (
                <TapaEstante>
                  <TituloTapa numberOfLines={5}>{item.titulo}</TituloTapa>
                </TapaEstante>
              )}
            </LibroEstante>
          )}
        />
      </Cabecera>

      <Contenido>
        {buscando ? (
          // ---------- Mientras se busca: los resultados ----------
          <>
            {librosEncontrados.length === 0 &&
              clientesEncontrados.length === 0 && (
                <SinResultados>
                  No encontramos nada con "{busqueda}".
                </SinResultados>
              )}

            {librosEncontrados.length > 0 && (
              <GrupoResultados>
                <TituloGrupo>Libros</TituloGrupo>
                <ListaResultados>
                  {librosEncontrados.map((l) => (
                    <FilaResultado
                      key={l.id}
                      onPress={() =>
                        router.push({
                          pathname: "/libros/detalle",
                          params: { id: l.id },
                        })
                      }
                    >
                      {l.portada ? (
                        <PortadaChica source={l.portada} resizeMode="cover" />
                      ) : (
                        <TapaChica />
                      )}
                      <TextosResultado>
                        <NombreResultado numberOfLines={1}>
                          {l.titulo}
                        </NombreResultado>
                        <DetalleResultado numberOfLines={1}>
                          {l.autor}
                        </DetalleResultado>
                      </TextosResultado>
                    </FilaResultado>
                  ))}
                </ListaResultados>
              </GrupoResultados>
            )}

            {clientesEncontrados.length > 0 && (
              <GrupoResultados>
                <TituloGrupo>Clientes</TituloGrupo>
                <ListaResultados>
                  {clientesEncontrados.map((c) => (
                    <FilaResultado
                      key={c.id}
                      onPress={() =>
                        router.push({
                          pathname: "/clientes/detalle",
                          params: { id: c.id },
                        })
                      }
                    >
                      <AvatarChico>
                        <InicialesChicas>
                          {`${c.nombre[0] ?? ""}${c.apellido[0] ?? ""}`.toUpperCase()}
                        </InicialesChicas>
                      </AvatarChico>
                      <TextosResultado>
                        <NombreResultado numberOfLines={1}>
                          {c.nombre} {c.apellido}
                        </NombreResultado>
                        <DetalleResultado>DNI {c.dni}</DetalleResultado>
                      </TextosResultado>
                    </FilaResultado>
                  ))}
                </ListaResultados>
              </GrupoResultados>
            )}
          </>
        ) : (
          // ---------- Sin búsqueda: el aviso y las tarjetas de siempre ----------
          <>
            {primerVencido && (
              <Aviso
                onPress={() => router.push("/alquileres")}
                activeOpacity={0.8}
              >
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={colores.naranjaTexto}
                />
                <TextosAviso>
                  <TituloAviso>
                    {vencidos.length}{" "}
                    {vencidos.length === 1
                      ? "préstamo vencido"
                      : "préstamos vencidos"}
                  </TituloAviso>
                  <DetalleAviso numberOfLines={1}>
                    {libroVencido?.titulo ?? "Libro"},{" "}
                    {clienteVencido?.nombre ?? ""}{" "}
                    {clienteVencido?.apellido ?? ""}
                  </DetalleAviso>
                </TextosAviso>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colores.naranjaTexto}
                />
              </Aviso>
            )}

            <Grilla>
              {modulos.map((m) => {
                const ruta = m.ruta;
                return (
                  <TarjetaModulo
                    key={m.titulo}
                    onPress={() => ruta && router.push(ruta)}
                    disabled={!ruta}
                    style={{ opacity: ruta ? 1 : 0.55 }}
                    activeOpacity={0.7}
                  >
                    <IconoModulo>
                      <Ionicons name={m.icono} size={22} color={colores.azul} />
                    </IconoModulo>
                    <TituloModulo>{m.titulo}</TituloModulo>
                    <DetalleModulo>{m.detalle}</DetalleModulo>
                  </TarjetaModulo>
                );
              })}
            </Grilla>
          </>
        )}
      </Contenido>
    </ScrollView>
  );
}

// ---------- Estilos ----------

const Cabecera = styled.View`
  background-color: ${colores.tinta};
`;

const Fecha = styled.Text`
  font-size: 14px;
  color: #afc0de;
  padding: 12px 20px 0 20px;
`;

const Marca = styled.Text`
  font-size: 36px;
  font-weight: bold;
  color: #ffffff;
  padding: 2px 20px 0 20px;
`;

const FilaEstante = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 22px 20px 10px 20px;
`;

const TituloEstante = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
`;

const VerTodos = styled.TouchableOpacity`
  padding: 6px 0;
`;

const TextoVerTodos = styled.Text`
  font-size: 14px;
  font-weight: 600;
  color: #afc0de;
`;

const LibroEstante = styled.TouchableOpacity`
  border-radius: 6px;
  elevation: 6;
  shadow-color: #14213d;
  shadow-opacity: 0.35;
  shadow-radius: 9px;
  shadow-offset: 0px 8px;
`;

const PortadaEstante = styled.Image`
  width: 82px;
  height: 118px;
  border-radius: 6px;
`;

const TapaEstante = styled.View`
  width: 82px;
  height: 118px;
  padding: 8px;
  border-radius: 6px;
  background-color: ${colores.azul};
`;

const TituloTapa = styled.Text`
  font-size: 11px;
  font-weight: bold;
  color: #ffffff;
`;

// El padding de arriba deja lugar a las portadas que asoman.
const Contenido = styled.View`
  padding: 64px 20px 0 20px;
  gap: 20px;
`;

const Aviso = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 16px;
  background-color: ${colores.naranjaClaro};
`;

const TextosAviso = styled.View`
  flex: 1;
`;

const TituloAviso = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.naranjaTexto};
`;

const DetalleAviso = styled.Text`
  font-size: 13px;
  color: ${colores.naranjaTexto};
  margin-top: 2px;
`;

const Grilla = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  row-gap: 12px;
`;

const TarjetaModulo = styled.TouchableOpacity`
  width: 48%;
  padding: 16px;
  border-radius: 16px;
  background-color: ${colores.superficie};
`;

const IconoModulo = styled.View`
  width: 42px;
  height: 42px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
  background-color: ${colores.azulClaro};
`;

const TituloModulo = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const DetalleModulo = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
  margin-top: 2px;
`;
const CajaBusqueda = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  height: 48px;
  margin: 16px 20px 0 20px;
  padding: 0 14px;
  border-radius: 14px;
  background-color: #24345a;
`;

const InputBusqueda = styled.TextInput`
  flex: 1;
  min-width: 0;
  font-size: 16px;
  color: #ffffff;
`;

const BotonLimpiar = styled.TouchableOpacity``;

const SinResultados = styled.Text`
  font-size: 15px;
  text-align: center;
  padding: 24px 0;
  color: ${colores.tintaSuave};
`;

const GrupoResultados = styled.View`
  gap: 8px;
`;

const TituloGrupo = styled.Text`
  font-size: 14px;
  font-weight: bold;
  color: ${colores.tintaSuave};
`;

const ListaResultados = styled.View`
  border-radius: 16px;
  overflow: hidden;
  background-color: ${colores.superficie};
`;

const FilaResultado = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-bottom-width: 1px;
  border-bottom-color: ${colores.borde};
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

const TextosResultado = styled.View`
  flex: 1;
`;

const NombreResultado = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const DetalleResultado = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
`;
