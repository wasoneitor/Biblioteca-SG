import styled from "styled-components/native";
import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { getClientes } from "@/data/cliente";
import type { Cliente } from "@/data/cliente";
import { getLibros, prestarLibro } from "@/data/libros";
import type { Libro } from "@/data/libros";
import { Alert, Platform } from "react-native";
import { useRouter } from "expo-router";
import { addAlquiler } from "@/data/alquileres";

export default function Alquileres() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [libros, setLibros] = useState<Libro[]>([]);
  const [libroId, setLibroId] = useState<string | null>(null);
  const router = useRouter();
  useFocusEffect(
    useCallback(() => {
      setClientes([...getClientes()]);
      setLibros([...getLibros()]);
    }, [])
  );
  function confirmarAlquiler() {
    if (!clienteId || !libroId) {
  if (Platform.OS === "web") {
    window.alert("Seleccioná un cliente y un libro.");
  } else {
    Alert.alert(
      "Faltan datos",
      "Seleccioná un cliente y un libro."
    );
  }

  return;
}
    if (!prestarLibro(libroId)) {
      if (Platform.OS === "web") {
        window.alert("No fue posible prestar el libro.");
      } else {
        Alert.alert("Atención", "No fue posible prestar el libro.");
      }

      return;
    }

    addAlquiler({
      clienteId,
      libroId,
      fechaAlquiler: new Date().toISOString(),
    });
    setLibros([...getLibros()]);
    setClienteId(null);
    setLibroId(null);

    if (Platform.OS === "web") {
      window.alert("El alquiler se registró con éxito.");
    } else {
      Alert.alert("¡Listo!", "El alquiler se registró con éxito.");
    }
  }
  return (
    <Container>
      {/* Botón para volver atrás */}
      <BotonVolver onPress={() => router.back()}>
        <TextoVolver>← Volver</TextoVolver>
      </BotonVolver>

      <Titulo>Alquiler de libros</Titulo>

      <Descripcion>
        Seleccioná un cliente y un libro para registrar un alquiler.
      </Descripcion>

      <Subtitulo>Seleccionar cliente</Subtitulo>

      {clientes.length === 0 ? (
        <Descripcion>
          Primero registrá un cliente en la sección Clientes.
        </Descripcion>
      ) : (
        clientes.map((cliente) => (
          <BotonCliente
            key={cliente.id}
            onPress={() => setClienteId(cliente.id)}
            style={{
              backgroundColor:
                clienteId === cliente.id ? "#CDEEFF" : "#FFFFFF",
            }}
          >
            <NombreCliente>
              {cliente.nombre} {cliente.apellido}
            </NombreCliente>

            <Descripcion>DNI: {cliente.dni}</Descripcion>
          </BotonCliente>
        ))
      )}

      <Subtitulo>Seleccionar libro</Subtitulo>

      {libros
        .filter(
          (libro) => libro.estado === "Disponible" && libro.copias > 0
        )
        .map((libro) => (
          <BotonCliente
            key={libro.id}
            onPress={() => setLibroId(libro.id)}
            style={{
              backgroundColor:
                libroId === libro.id ? "#CDEEFF" : "#FFFFFF",
            }}
          >
            <NombreCliente>{libro.titulo}</NombreCliente>
            <Descripcion>Autor: {libro.autor}</Descripcion>
            <Descripcion>Copias: {libro.copias}</Descripcion>
          </BotonCliente>
        ))}
      <BotonAccion onPress={confirmarAlquiler}>
        <TextoAccion>Confirmar alquiler</TextoAccion>
      </BotonAccion>

      <BotonAccion
        onPress={() => router.push("/alquileres/consultar")}
      >
        <TextoAccion>Consultar alquileres</TextoAccion>
      </BotonAccion>
    </Container>
  );
}
const BotonVolver = styled.TouchableOpacity`
  align-self: flex-start;
  padding: 8px 12px;
  background-color: #e2e8f0;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const TextoVolver = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #164e63;
`;
const BotonAccion = styled.TouchableOpacity`
  background-color: #2e9ad1;
  padding: 16px;
  border-radius: 10px;
  align-items: center;
  margin-top: 12px;
`;

const TextoAccion = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;
const Subtitulo = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: #164e63;
  margin-top: 24px;
  margin-bottom: 12px;
`;

const BotonCliente = styled.TouchableOpacity`
  padding: 16px;
  border-radius: 10px;
  margin-bottom: 12px;
`;

const NombreCliente = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #12314d;
`;
const Container = styled.View`
  flex: 1;
  background-color: #f5f8fa;
  padding: 24px;
  padding-top: 50px;
`;

const Titulo = styled.Text`
  font-size: 26px;
  font-weight: bold;
  color: #164e63;
  margin-bottom: 12px;
`;

const Descripcion = styled.Text`
  font-size: 16px;
  color: #555;
`;