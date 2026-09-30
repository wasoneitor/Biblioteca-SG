/*import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";

import { getAlquileres } from "@/data/alquileres";
import { getLibros } from "@/data/libros";

export default function ConsultarAlquileres() {
  const [alquileres, setAlquileres] = useState<
    {
      id: string;
      cliente: string;
      libro: string;
      fecha: string;
    }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      //const clientes = getClientes();
      const libros = getLibros();

      /*const listado = getAlquileres().map((alquiler) => {
        const cliente = clientes.find(
          (cliente) => cliente.id === alquiler.clienteId,
        );

        const libro = libros.find((libro) => libro.id === alquiler.libroId);

        return {
          id: alquiler.id,
          cliente: cliente
            ? `${cliente.nombre} ${cliente.apellido}`
            : "Cliente no encontrado",
          libro: libro ? libro.titulo : "Libro no encontrado",
          fecha: new Date(alquiler.fechaAlquiler).toLocaleDateString("es-AR"),
        };
      });

      setAlquileres(listado);
    }, []),
  );

  return (
    <ScrollView contentContainerStyle={{ padding: 24 }}>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "bold",
          color: "#164E63",
          marginBottom: 20,
        }}
      >
        Consultar alquileres
      </Text>

      {alquileres.length === 0 ? (
        <Text>Todavía no hay alquileres registrados.</Text>
      ) : (
        alquileres.map((alquiler) => (
          <View
            key={alquiler.id}
            style={{
              backgroundColor: "#FFFFFF",
              padding: 16,
              marginBottom: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              {alquiler.libro}
            </Text>

            <Text>Cliente: {alquiler.cliente}</Text>
            <Text>Fecha del alquiler: {alquiler.fecha}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}*/
