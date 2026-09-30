import { colores } from "@/constants/colores";
import {
    buscarLibros,
    POR_PAGINA,
    type LibroOnline,
} from "@/services/openLibrary";
import { useLibros } from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

export default function BuscarOnline() {
  const router = useRouter();
  const libros = useLibros((s) => s.libros);

  // "texto" es lo que se escribe; "consulta" es lo que se busca al tocar "Buscar".
  // Así no se hace un pedido a internet por cada letra.
  const [texto, setTexto] = useState("");
  const [consulta, setConsulta] = useState("");

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    // La consulta es parte de la key: cada búsqueda tiene su propia caché.
    queryKey: ["openlibrary", "buscar", consulta],
    queryFn: ({ pageParam }) => buscarLibros(consulta, pageParam),
    initialPageParam: 1,
    // ¿Hay más páginas? Si ya trajimos todos los resultados, devolvemos undefined.
    getNextPageParam: (ultima) =>
      ultima.pagina * POR_PAGINA < ultima.total ? ultima.pagina + 1 : undefined,
    enabled: consulta.length >= 2, // no busca hasta que haya algo para buscar
  });

  // Cada página trae 20 libros: las unimos en una sola lista.
  const resultados = data?.pages.flatMap((p) => p.libros) ?? [];
  const total = data?.pages[0]?.total ?? 0;

  // Las keys de los libros que ya están en el catálogo.
  const yaImportados = libros.map((l) => l.claveOnline);

  function buscar() {
    setConsulta(texto.trim());
  }

  function abrir(libro: LibroOnline) {
    // Los parámetros de una ruta siempre viajan como texto.
    router.push({
      pathname: "/libros/online",
      params: {
        key: libro.key,
        titulo: libro.titulo,
        autor: libro.autor,
        anio: libro.anio ? String(libro.anio) : "",
        editorial: libro.editorial ?? "",
        portadaUrl: libro.portadaUrl ?? "",
      },
    });
  }

  // Lo que se muestra cuando la lista está vacía depende del momento.
  function contenidoVacio() {
    if (consulta.length < 2) {
      return (
        <Vacio>
          <Ionicons name="globe-outline" size={44} color={colores.borde} />
          <TituloVacio>Buscá en Open Library</TituloVacio>
          <TextoVacio>
            Escribí un título, un autor o un tema, y después agregalo a tu
            catálogo.
          </TextoVacio>
        </Vacio>
      );
    }
    if (isLoading) {
      return (
        <ActivityIndicator
          size="large"
          color={colores.azul}
          style={{ marginTop: 48 }}
        />
      );
    }
    if (isError) {
      return (
        <Vacio>
          <Ionicons
            name="cloud-offline-outline"
            size={44}
            color={colores.borde}
          />
          <TituloVacio>No se pudo conectar</TituloVacio>
          <TextoVacio>
            Revisá tu conexión a internet. ({error.message})
          </TextoVacio>
          <BotonClaro onPress={() => refetch()}>
            <TextoBotonClaro>Reintentar</TextoBotonClaro>
          </BotonClaro>
        </Vacio>
      );
    }
    return (
      <Vacio>
        <Ionicons name="search-outline" size={44} color={colores.borde} />
        <TituloVacio>Sin resultados para "{consulta}"</TituloVacio>
        <TextoVacio>
          Probá con menos palabras o revisá cómo está escrito.
        </TextoVacio>
      </Vacio>
    );
  }

  function renderResultado({ item }: { item: LibroOnline }) {
    const importado = yaImportados.includes(item.key);
    return (
      <Fila onPress={() => abrir(item)} activeOpacity={0.6}>
        {item.portadaUrl ? (
          <Portada source={{ uri: item.portadaUrl }} resizeMode="cover" />
        ) : (
          <TapaGenerica>
            <TituloTapa numberOfLines={4}>{item.titulo}</TituloTapa>
          </TapaGenerica>
        )}
        <Datos>
          <Titulo numberOfLines={2}>{item.titulo}</Titulo>
          <Detalle numberOfLines={1}>
            {item.autor}
            {item.anio ? `, ${item.anio}` : ""}
          </Detalle>
          {importado && (
            <Etiqueta>
              <TextoEtiqueta>Ya está en tu catálogo</TextoEtiqueta>
            </Etiqueta>
          )}
        </Datos>
        <Ionicons name="chevron-forward" size={18} color={colores.tintaSuave} />
      </Fila>
    );
  }

  return (
    <Contenedor edges={["top"]}>
      <Encabezado>
        <BotonVolver onPress={() => router.back()} accessibilityLabel="Volver">
          <Ionicons name="chevron-back" size={22} color={colores.tinta} />
        </BotonVolver>
        <Textos>
          <TituloPantalla>Open Library</TituloPantalla>
          <Subtitulo>Buscá libros y sumalos al catálogo</Subtitulo>
        </Textos>
      </Encabezado>

      <FilaBusqueda>
        <Buscador>
          <Ionicons name="search" size={20} color={colores.tintaSuave} />
          <InputBuscador
            placeholder="Título, autor o tema"
            placeholderTextColor={colores.tintaSuave}
            value={texto}
            onChangeText={setTexto}
            onSubmitEditing={buscar} // la tecla "Enter" del teclado también busca
            returnKeyType="search"
            autoCapitalize="none"
          />
        </Buscador>
        <BotonBuscar
          onPress={buscar}
          disabled={texto.trim().length < 2}
          style={{ opacity: texto.trim().length < 2 ? 0.4 : 1 }}
        >
          <TextoBuscar>Buscar</TextoBuscar>
        </BotonBuscar>
      </FilaBusqueda>

      {resultados.length > 0 && (
        <Conteo>
          {total.toLocaleString("es-AR")} resultados para "{consulta}"
        </Conteo>
      )}

      <FlatList
        data={resultados}
        keyExtractor={(item, index) => `${item.key}-${index}`}
        renderItem={renderResultado}
        ListEmptyComponent={contenidoVacio()}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
        keyboardShouldPersistTaps="handled"
        // Scroll infinito: cuando falta medio largo de pantalla para el final, pide la próxima página.
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) fetchNextPage();
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={
          isFetchingNextPage ? (
            <FilaCargando>
              <ActivityIndicator color={colores.azul} />
              <TextoCargando>Cargando más resultados</TextoCargando>
            </FilaCargando>
          ) : null
        }
      />
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
  padding: 12px 20px 16px 20px;
`;

const BotonVolver = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  border-radius: 22px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.superficie};
`;

const Textos = styled.View`
  flex: 1;
`;

const TituloPantalla = styled.Text`
  font-size: 28px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const Subtitulo = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
`;

const FilaBusqueda = styled.View`
  flex-direction: row;
  gap: 8px;
  padding: 0 20px;
  margin-bottom: 10px;
`;

const Buscador = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  height: 50px;
  padding: 0 14px;
  border-radius: 14px;
  border-width: 2px;
  border-color: ${colores.azul};
  background-color: ${colores.superficie};
`;

const InputBuscador = styled.TextInput`
  flex: 1;
  min-width: 0;
  font-size: 16px;
  color: ${colores.tinta};
`;

const BotonBuscar = styled.TouchableOpacity`
  height: 50px;
  padding: 0 16px;
  border-radius: 14px;
  justify-content: center;
  background-color: ${colores.azul};
`;

const TextoBuscar = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: #ffffff;
`;

const Conteo = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
  padding: 0 20px 8px 20px;
`;

const Fila = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${colores.borde};
`;

const Portada = styled.Image`
  width: 50px;
  height: 72px;
  border-radius: 4px;
  background-color: ${colores.fondoPortada};
`;

const TapaGenerica = styled.View`
  width: 50px;
  height: 72px;
  padding: 6px;
  border-radius: 4px;
  background-color: ${colores.tinta};
`;

const TituloTapa = styled.Text`
  font-size: 9px;
  font-weight: bold;
  color: #ffffff;
`;

const Datos = styled.View`
  flex: 1;
  gap: 2px;
`;

const Titulo = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const Detalle = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
`;

const Etiqueta = styled.View`
  align-self: flex-start;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 10px;
  background-color: ${colores.azulClaro};
`;

const TextoEtiqueta = styled.Text`
  font-size: 12px;
  font-weight: bold;
  color: ${colores.azulTexto};
`;

const FilaCargando = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 20px;
`;

const TextoCargando = styled.Text`
  font-size: 14px;
  color: ${colores.tintaSuave};
`;

const Vacio = styled.View`
  align-items: center;
  padding: 48px 24px;
  gap: 8px;
`;

const TituloVacio = styled.Text`
  font-size: 17px;
  font-weight: bold;
  text-align: center;
  color: ${colores.tinta};
`;

const TextoVacio = styled.Text`
  font-size: 14px;
  text-align: center;
  color: ${colores.tintaSuave};
`;

const BotonClaro = styled.TouchableOpacity`
  height: 44px;
  padding: 0 18px;
  margin-top: 8px;
  border-radius: 22px;
  justify-content: center;
  background-color: ${colores.azulClaro};
`;

const TextoBotonClaro = styled.Text`
  font-size: 15px;
  font-weight: 600;
  color: ${colores.azulTexto};
`;
