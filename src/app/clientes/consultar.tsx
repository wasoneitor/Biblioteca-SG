import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { ScrollView, Text, View, Image } from "react-native";

import { getClientes } from "@/data/cliente";
import type { Cliente } from "@/data/cliente";

export default function ConsultarClientes() {
    const [clientes, setClientes] = useState<Cliente[]>([]);

    useFocusEffect(
        useCallback(() => {
            setClientes([...getClientes()]);
        }, [])
    );

    return (
        <ScrollView contentContainerStyle={{ padding: 24 }}>
            <Text style={{ fontSize: 26, fontWeight: "bold", marginBottom: 20 }}>
                Consultar Clientes
            </Text>

            {clientes.length === 0 ? (
                <Text>Todavía no hay clientes registrados.</Text>
            ) : (
                clientes.map((cliente) => (
                    <View
                        key={cliente.id}
                        style={{
                            backgroundColor: "#FFFFFF",
                            padding: 16,
                            marginBottom: 12,
                            borderRadius: 10,
                        }}
                    >
                        <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                            {cliente.nombre} {cliente.apellido}
                        </Text>
                        {cliente.foto && (
                            <Image
                                source={cliente.foto}
                                style={{
                                    width: 90,
                                    height: 120,
                                    borderRadius: 8,
                                    marginBottom: 12,
                                }}
                                resizeMode="cover"
                            />
                        )}
                        <Text>DNI: {cliente.dni}</Text>
                    </View>
                ))
            )}
        </ScrollView>
    );
}