import { colores } from "@/constants/colores";
import { useClientes, type Cliente } from "@/store/clientes";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import styled from "styled-components/native";

export default function ListaClientes() {
  const router = useRouter();
  const clientes = useClientes((s) => s.clientes);
  const [busqueda, setBusqueda] = useState("");

  // Filtra por nombre, apellido o DNI, sin importar mayúsculas, y ordena por apellido.
  const texto = busqueda.trim().toLowerCase();
  const filtrados = clientes
    .filter((c) =>
      `${c.nombre} ${c.apellido} ${c.dni}`.toLowerCase().includes(texto),
    )
    .sort((a, b) => a.apellido.localeCompare(b.apellido));

  function renderCliente({ item }: { item: Cliente }) {
    const iniciales =
      `${item.nombre[0] ?? ""}${item.apellido[0] ?? ""}`.toUpperCase();
    return (
      <Fila
        onPress={() =>
          router.push({
            pathname: "/clientes/detalle",
            params: { id: item.id },
          })
        }
        activeOpacity={0.6}
      >
        {item.foto ? (
          <Foto source={{ uri: item.foto }} />
        ) : (
          <Avatar>
            <Iniciales>{iniciales}</Iniciales>
          </Avatar>
        )}
        <Datos>
          <Nombre>
            {item.nombre} {item.apellido}
          </Nombre>
          <Dni>DNI {item.dni}</Dni>
        </Datos>
        <Ionicons name="chevron-forward" size={18} color={colores.tintaSuave} />
      </Fila>
    );
  }

  return (
    <Contenedor edges={["top"]}>
      <Encabezado>
        <Textos>
          <Titulo>Clientes</Titulo>
          <Subtitulo>
            {clientes.length}{" "}
            {clientes.length === 1 ? "registrado" : "registrados"}
          </Subtitulo>
        </Textos>
        <BotonAgregar
          onPress={() => router.push("/clientes/formulario")}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color="#FFFFFF" />
          <TextoBoton>Agregar</TextoBoton>
        </BotonAgregar>
      </Encabezado>

      <Buscador>
        <Ionicons name="search" size={20} color={colores.tintaSuave} />
        <InputBuscador
          placeholder="Nombre o DNI"
          placeholderTextColor={colores.tintaSuave}
          value={busqueda}
          onChangeText={setBusqueda}
          autoCapitalize="none"
        />
      </Buscador>

      {filtrados.length === 0 ? (
        <Vacio>
          <Ionicons name="people-outline" size={44} color={colores.borde} />
          <TituloVacio>
            {texto
              ? `Nadie coincide con "${busqueda}"`
              : "Todavía no hay clientes"}
          </TituloVacio>
          <TextoVacio>
            {texto
              ? "Revisá el nombre o probá con el DNI."
              : "Agregá el primero con el botón de arriba."}
          </TextoVacio>
        </Vacio>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={(item) => item.id}
          renderItem={renderCliente}
          ItemSeparatorComponent={Separador}
          style={{
            flexGrow: 0,
            flexShrink: 1,
            marginHorizontal: 20,
            borderRadius: 16,
            backgroundColor: colores.superficie,
          }}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </Contenedor>
  );
}

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

const Titulo = styled.Text`
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
  margin: 0 20px 16px 20px;
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

const Fila = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
`;

const Avatar = styled.View`
  width: 46px;
  height: 46px;
  border-radius: 23px;
  align-items: center;
  justify-content: center;
  background-color: ${colores.azulClaro};
`;

const Foto = styled.Image`
  width: 46px;
  height: 46px;
  border-radius: 23px;
`;

const Iniciales = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.azulTexto};
`;

const Datos = styled.View`
  flex: 1;
`;

const Nombre = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: ${colores.tinta};
`;

const Dni = styled.Text`
  font-size: 13px;
  color: ${colores.tintaSuave};
  margin-top: 2px;
`;

const Separador = styled.View`
  height: 1px;
  margin-left: 74px;
  background-color: ${colores.borde};
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
