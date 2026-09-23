import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import styled from "styled-components/native";

export default function Home() {
  const router = useRouter();

  function proximamente(seccion: string) {
    Alert.alert(
      "Próximamente",
      `La sección "${seccion}" se implementará más adelante.`,
    );
  }

  return (
    <Container>
      <Titulo>Biblioteca SG</Titulo>

      <Boton onPress={() => router.push("/clientes")} activeOpacity={0.8}>
        <Ionicons name="people" size={26} color="#12314D" />
        <Texto>Clientes</Texto>
      </Boton>

      <Boton onPress={() => router.push("/libros")} activeOpacity={0.8}>
        <Ionicons name="book" size={26} color="#12314D" />
        <Texto>Libros</Texto>
      </Boton>

      <Boton onPress={() => router.push("/alquileres")} activeOpacity={0.8}>
        <Ionicons name="people" size={26} color="#12314D" />
        <Texto>Alquileres</Texto>
      </Boton>
    </Container>
  );
}

const Container = styled.View`
  flex: 1;
  background-color: #2e9ad1;
  padding: 70px 24px 24px 24px;
`;

const Titulo = styled.Text`
  color: #fff;
  font-size: 34px;
  font-weight: bold;
  margin-bottom: 60px;
`;

const Boton = styled.TouchableOpacity`
  background-color: #fff;
  flex-direction: row;
  align-items: center;
  padding: 18px 20px;
  border-radius: 14px;
  margin-bottom: 18px;
  gap: 14px;
`;

const Texto = styled.Text`
  color: #12314d;
  font-size: 20px;
  font-weight: bold;
`;
