import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { tema } from "@/constants/tema";
import { Stack } from "expo-router";
import { ThemeProvider } from "styled-components/native";

// Se crea una sola vez, afuera del componente, para que la caché no se pierda en cada render.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // los datos se consideran "frescos" por 5 minutos
      retry: 1, // si un pedido falla, lo reintenta una sola vez
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Todo lo que esté adentro puede leer el tema, sin importarlo */}
      <ThemeProvider theme={tema}>
        <Stack screenOptions={{ headerShown: false }} />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
