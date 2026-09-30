import { colores } from "@/constants/colores";
import {
  copiasDisponibles,
  GENEROS,
  useLibros,
  type Genero,
  type Libro,
} from "@/store/libros";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

// "Todos" más los seis géneros del store: los chips salen de la misma lista.
type Filtro = Genero | "Todos";
const FILTROS: Filtro[] = ["Todos", ...GENEROS];

export default function CatalogoLibros() {
  const router = useRouter();
  const libros = useLibros((s) => s.libros);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("Todos");

  // Dos filtros encadenados: primero el género, después el texto.
  const texto = busqueda.trim().toLowerCase();
  const filtrados = libros
    .filter((l) => filtro === "Todos" || l.genero === filtro)
    .filter((l) => `${l.titulo} ${l.autor}`.toLowerCase().includes(texto))
    .sort((a, b) => a.titulo.localeCompare(b.titulo));

  function renderLibro({ item }: { item: Libro }) {
    const disponibles = copiasDisponibles(item);
    const hayCopias = disponibles > 0;
    return (
      <Tarjeta
        onPress={() =>
          router.push({ pathname: "/libros/detalle", params: { id: item.id } })
        }
        activeOpacity={0.7}
      >
        <FondoPortada>
          {item.portada ? (
            <Portada source={item.portada} resizeMode="cover" />
          ) : (
            // Sin imagen: dibujamos una tapa con el título.
            <TapaGenerica>
              <TituloTapa numberOfLines={5}>{item.titulo}</TituloTapa>
            </TapaGenerica>
          )}
        </FondoPortada>
        <Titulo numberOfLines={2}>{item.titulo}</Titulo>
        <Autor numberOfLines={1}>{item.autor}</Autor>
        <FilaEstado>
          <Punto
            style={{
              backgroundColor: hayCopias ? colores.azul : colores.naranja,
            }}
          />
          <TextoEstado
            style={{
              color: hayCopias ? colores.azulTexto : colores.naranjaTexto,
            }}
          >
            {hayCopias
              ? `${disponibles} de ${item.copias} disponibles`
              : "Sin copias"}
          </TextoEstado>
        </FilaEstado>
      </Tarjeta>
    );
  }

  return (
    <Contenedor edges={["top"]}>
      <Encabezado>
        <Textos>
          <TituloPantalla>Libros</TituloPantalla>
          <Subtitulo>
            {libros.length} {libros.length === 1 ? "título" : "títulos"} en el
            catálogo
          </Subtitulo>
        </Textos>
        <BotonAgregar
          onPress={() => router.push("/libros/formulario")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <TextoBoton>Agregar</TextoBoton>
        </BotonAgregar>
      </Encabezado>

      <Buscador>
        <Ionicons name="search" size={20} color={colores.tintaSuave} />
        <InputBuscador
          placeholder="Título o autor"
          placeholderTextColor={colores.tintaSuave}
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
        />
      </Buscador>

      {/* flexGrow: 0 evita que el ScrollView horizontal ocupe toda la altura */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0, marginBottom: 4 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {FILTROS.map((f) => {
          const activo = f === filtro;
          return (
            <Chip
              key={f}
              onPress={() => setFiltro(f)}
              style={{
                backgroundColor: activo ? colores.tinta : colores.superficie,
                borderColor: activo ? colores.tinta : colores.borde,
              }}
            >
              <TextoChip style={{ color: activo ? "#FFFFFF" : colores.tinta }}>
                {f}
              </TextoChip>
            </Chip>
          );
        })}
      </ScrollView>

      <FlatList
        data={filtrados}
        keyExtractor={(item) => item.id}
        renderItem={renderLibro}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{ padding: 20 }}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Vacio>
            <Ionicons name="book-outline" size={44} color={colores.borde} />
            <TituloVacio>
              {libros.length === 0
                ? "Todavía no hay libros"
                : "No hay libros que coincidan"}
            </TituloVacio>
            <TextoVacio>
              {libros.length === 0
                ? "Agregá el primero con el botón de arriba."
                : "Probá con otro título, autor o género."}
            </TextoVacio>
          </Vacio>
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

const Volver = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  padding: 8px 14px;
`;

const TextoVolver = styled.Text`
  color: ${colores.azul};
  font-size: 15px;
  font-weight: 600;
`;

const Encabezado = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  margin-bottom: 14px;
`;

const Textos = styled.View``;

const TituloPantalla = styled.Text`
  font-size: 32px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const Subtitulo = styled.Text`
  font-size: 14px;
  color: ${colores.tintaSuave};
`;

const BotonAgregar = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background-color: ${colores.azul};
`;

const TextoBoton = styled.Text`
  color: #ffffff;
  font-size: 15px;
  font-weight: bold;
`;

const Buscador = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 10px;
  height: 48px;
  margin: 0 20px 14px 20px;
  padding: 0 14px;
  border-radius: 14px;
  background-color: ${colores.superficie};
`;

const InputBuscador = styled.TextInput`
  flex: 1;
  min-width: 0;
  font-size: 16px;
  color: ${colores.tinta};
`;

const Chip = styled.TouchableOpacity`
  height: 36px;
  padding: 0 16px;
  border-radius: 18px;
  border-width: 1px;
  justify-content: center;
`;

const TextoChip = styled.Text`
  font-size: 14px;
  font-weight: 600;
`;

// Cada tarjeta ocupa casi la mitad del ancho; el espacio entre columnas
// lo reparte justifyContent: "space-between" del columnWrapperStyle.
const Tarjeta = styled.TouchableOpacity`
  width: 48%;
  margin-bottom: 14px;
  padding: 10px 10px 14px 10px;
  border-radius: 16px;
  background-color: ${colores.superficie};
`;

const FondoPortada = styled.View`
  height: 168px;
  border-radius: 10px;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
  background-color: ${colores.fondoPortada};
`;

const Portada = styled.Image`
  width: 98px;
  height: 144px;
  border-radius: 4px;
`;

const TapaGenerica = styled.View`
  width: 98px;
  height: 144px;
  padding: 10px;
  border-radius: 4px;
  background-color: ${colores.tinta};
`;

const TituloTapa = styled.Text`
  color: #ffffff;
  font-size: 13px;
  font-weight: bold;
`;

const Titulo = styled.Text`
  font-size: 15px;
  font-weight: bold;
  color: ${colores.tinta};
  padding: 0 4px;
`;

const Autor = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
  margin-top: 2px;
  padding: 0 4px;
`;

const FilaEstado = styled.View`
  flex-direction: row;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 0 4px;
`;

const Punto = styled.View`
  width: 8px;
  height: 8px;
  border-radius: 4px;
`;

const TextoEstado = styled.Text`
  font-size: 13px;
  font-weight: 600;
`;

const Vacio = styled.View`
  align-items: center;
  padding: 48px 32px;
  gap: 6px;
`;

const TituloVacio = styled.Text`
  font-size: 17px;
  font-weight: bold;
  color: ${colores.tinta};
  text-align: center;
`;

const TextoVacio = styled.Text`
  font-size: 14px;
  color: ${colores.tintaSuave};
  text-align: center;
`;
