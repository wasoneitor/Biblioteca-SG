import { useRouter } from "expo-router";
import styled from "styled-components/native";
import { useState } from "react";

export default function AlquileresMenu() {
  const router = useRouter();
  const [sobreRegistrar, setSobreRegistrar] = useState(false);

  return (
    <Container>
      {/* Botón para volver atrás */}
      <BotonVolver onPress={() => router.back()}>
        <TextoVolver>← Volver</TextoVolver>
      </BotonVolver>
      <Header>
        <Titulo>Alquileres</Titulo>
      </Header>

      <Content>
        <BotonPrimario
          onPress={() => router.push("/alquileres/registrar")}
          onHoverIn={() => setSobreRegistrar(true)}
          onHoverOut={() => setSobreRegistrar(false)}
          style={{
            borderRadius: sobreRegistrar ? 28 : 5,
            backgroundColor: sobreRegistrar ? "#0056B3" : "#007BFF",
            transform: [{ scale: sobreRegistrar ? 1.02 : 1 }],
          }}
        >
          <TextoBoton>+ Registrar Alquiler</TextoBoton>
        </BotonPrimario>

        <BotonPrimario
          onPress={() => router.push("/alquileres/consultar")}
          onHoverIn={() => setSobreRegistrar(true)}
          onHoverOut={() => setSobreRegistrar(false)}
          style={{
            borderRadius: sobreRegistrar ? 28 : 5,
            backgroundColor: sobreRegistrar ? "#0056B3" : "#007BFF",
            transform: [{ scale: sobreRegistrar ? 1.02 : 1 }],
          }}

        >
          <TextoBoton>Consultar Alquileres</TextoBoton>
        </BotonPrimario>
      </Content>
    </Container>
  );
}
// Estilos agregados para el botón volver
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

const Container = styled.View`
  flex: 1;
  background-color: #f0f0f0;
`;

const Header = styled.View`
  background-color: #007bff;
  padding: 20px;
`;

const Titulo = styled.Text`
  color: #fff;
  font-size: 24px;
  font-weight: bold;
`;

const Content = styled.View`
  padding: 20px;
`;

const BotonPrimario = styled.Pressable`
  background-color: #007bff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 5px;

`;

const TextoBoton = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;
