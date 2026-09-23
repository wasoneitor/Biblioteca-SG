import { useRouter } from "expo-router";
import styled from "styled-components/native";

export default function ClientesMenu() {
  const router = useRouter();

  return (
    <Container>
      {/* Botón para volver atrás */}
      <BotonVolver onPress={() => router.back()}>
        <TextoVolver>← Volver</TextoVolver>
      </BotonVolver>
      
      <Header>
        <Titulo>Clientes</Titulo>
      </Header>

      <Content>
        <BotonPrimario
          onPress={() => router.push("/clientes/registrar")}
          activeOpacity={0.8}
        >
          <TextoBoton>+ Registrar Cliente</TextoBoton>
        </BotonPrimario>

        <BotonPrimario
          onPress={() => router.push("/clientes/consultar")}
          activeOpacity={0.8}
        >
          <TextoBoton>Consultar Clientes</TextoBoton>
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
  background-color: #f5f8fa;
`;

const Header = styled.View`
  background-color: #2e9ad1;
  padding: 18px 12px;
  padding-top: 50px;
`;

const Titulo = styled.Text`
  color: #fff;
  font-size: 22px;
  font-weight: bold;
  text-align: center;
`;

const Content = styled.View`
  padding: 30px 24px;
`;

const BotonPrimario = styled.TouchableOpacity`
  background-color: #2e9ad1;
  border-radius: 10px;
  padding: 18px;
  align-items: center;
  margin-bottom: 20px;
`;

const TextoBoton = styled.Text`
  color: #fff;
  font-size: 18px;
  font-weight: bold;
`;
