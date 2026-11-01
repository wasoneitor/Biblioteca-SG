# Biblioteca SG

Aplicación móvil para gestionar una biblioteca: su catálogo de libros, sus socios y los préstamos.

## Descripción

En muchas bibliotecas pequeñas, como las escolares, barriales o de institutos, los préstamos todavía se anotan en papel o en planillas sueltas. Así es difícil saber qué libros hay disponibles, quién tiene cada ejemplar y qué préstamos ya vencieron. Esto termina en libros perdidos y en tiempo dedicado a buscar información.

**Biblioteca SG** reúne todo en una sola aplicación. Permite:

- administrar el catálogo y la cantidad de copias de cada libro;
- registrar a los socios;
- registrar préstamos con un plazo de devolución;
- ver de un vistazo los préstamos vencidos.

Además, permite incorporar libros al catálogo buscándolos en [Open Library](https://openlibrary.org), un catálogo mundial y gratuito, sin tener que cargar sus datos a mano.

## Integrantes

- Sofia Fronte - 28580
- Guillermo Lopez - 26801

## Features

| #   | Feature                                                | Descripción                                                                                                                                            | Estado   |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| 1   | Registrar un cliente                                   | Alta de socios con nombre, DNI, teléfono, correo y foto (desde la galería o la cámara). Valida los datos y no permite DNI repetidos.                   | Completa |
| 2   | Consultar y buscar clientes                            | Listado de socios ordenado por apellido, con búsqueda por nombre o DNI.                                                                                | Completa |
| 3   | Modificar los datos de un cliente                      | Edición de los datos y la foto de un socio.                                                                                                            | Completa |
| 4   | Eliminar un cliente                                    | Baja con confirmación. No se permite si el socio tiene libros prestados.                                                                               | Completa |
| 5   | Consultar la ficha de un cliente                       | Datos de contacto (con acceso directo para llamar o escribir), libros que tiene en préstamo e historial de devoluciones.                               | Completa |
| 6   | Agregar un libro al catálogo                           | Alta de libros con título, autor, editorial, género, cantidad de copias y portada.                                                                     | Completa |
| 7   | Consultar, buscar y filtrar el catálogo                | Catálogo en grilla con portadas, búsqueda por título o autor y filtro por género. Muestra las copias disponibles de cada libro.                        | Completa |
| 8   | Consultar el detalle de un libro                       | Ficha con los datos del libro, su disponibilidad y quién tiene cada copia prestada.                                                                    | Completa |
| 9   | Modificar y eliminar libros                            | Edición de los datos del libro. No se puede dejar menos copias que las prestadas ni eliminar un libro con copias prestadas.                            | Completa |
| 10  | Registrar un préstamo                                  | Selección de socio, libro y plazo de devolución (7, 14 o 21 días). Solo ofrece libros con copias disponibles.                                          | Completa |
| 11  | Registrar una devolución                               | Devolución desde el listado de préstamos, la ficha del cliente o la ficha del libro. La copia vuelve a estar disponible.                               | Completa |
| 12  | Consultar los préstamos y sus vencimientos             | Préstamos en curso y devueltos. Los vencidos se destacan y se avisan en la pantalla de inicio.                                                         | Completa |
| 13  | Buscar libros en Open Library y agregarlos al catálogo | Búsqueda en una API externa con scroll infinito. Permite agregar un resultado al catálogo con su portada, eligiendo el género y la cantidad de copias. | Completa |
| 14  | Guardar los datos en el dispositivo                    | Libros, clientes y préstamos se conservan al cerrar la aplicación (AsyncStorage).                                                                      | Completa |
| 15  | Escuchar la ficha de un libro                          | Botón que lee en voz alta el título, el autor y las copias disponibles (accesibilidad).                                                                | Completa |

## Contenidos de la materia aplicados

### Unidad I: Configuración del entorno y fundamentos

- Proyecto creado con **Expo SDK 57**, probado en **Expo Go** y en el emulador de Android.
- Componentes principales: `View`, `Text`, `Image`, `ScrollView` y `TextInput`.
- Comunicación entre componentes con props (por ejemplo, `Campo`, `Latido` y `BotonEscuchar`).

### Unidad II: Estilos y componentes visuales

- **Styled Components** en todas las pantallas, con componentes reutilizables.
- **ThemeProvider**: los colores se definen una sola vez (`src/constants/tema.ts`) y se reparten a toda la app desde `src/app/_layout.tsx`. Se leen con `({ theme }) => theme.colores.X` en los estilos y con `useTheme()` en el JSX.
- Flexbox en todos los diseños.
- **TouchableOpacity** en botones y **TouchableHighlight** en las filas de la lista de clientes (se iluminan al tocarlas).
- **LinearGradient** (`expo-linear-gradient`) en la cabecera de la pantalla de Inicio.
- Imágenes locales (portadas de ejemplo) y remotas (portadas de Open Library).

### Unidad III: Navegación

- **Expo Router** con **Tabs** (Inicio, Libros, Clientes y Alquileres) dentro del grupo de rutas `(tabs)`, y un **Stack** en cada pestaña.
- **Rutas dinámicas:** las fichas son `libros/[id].tsx` y `clientes/[id].tsx`. Se abren con ``router.push(`/libros/${id}`)`` y leen el id con `useLocalSearchParams`.
- Paso de parámetros entre pantallas (formularios de edición, búsqueda en Open Library).

### Unidad IV: Listas y componentes de datos

- **FlatList** en grilla (catálogo), horizontal (Inicio) y con scroll infinito (Open Library).
- **SectionList** en Alquileres: los préstamos en curso se agrupan en _Vencidos_ y _Al día_, y los devueltos por mes.
- Íconos con `@expo/vector-icons` y `SafeAreaView` en todas las pantallas.
- Filtro por género y búsqueda por texto.

### Unidad V: Consumo de APIs y estado global

- Peticiones HTTP con `fetch` a la API de **Open Library** (`src/services/openLibrary.ts`).
- **TanStack Query:** `useQuery` y `useInfiniteQuery`, con caché, estados de carga y error, y reintento.
- **Zustand:** tres stores (libros, clientes y alquileres) conectados entre sí.

### Unidad VI: Funcionalidades avanzadas

- **Animated:** las tarjetas de préstamos vencidos "laten" (`src/components/Latido.tsx`), con `Animated.loop`, `Animated.sequence` y `Animated.timing`.
- **Persistencia local con AsyncStorage:** los tres stores usan el middleware `persist` de Zustand.
- **CRUD** completo de libros y clientes, y registro de préstamos y devoluciones.
- **Cámara y galería** con `expo-image-picker` (fotos de clientes y portadas de libros).

### Extras

- **Lottie** (`lottie-react-native`): animaciones de carga y de error en la búsqueda de Open Library, y de éxito al registrar un préstamo (`src/components/Animacion.tsx`).
- **Expo Speech** (`expo-speech`): lectura en voz alta de la ficha de un libro (`src/components/BotonEscuchar.tsx`).

## Cómo ejecutar el proyecto

```bash
npm install
npx expo start
```

Después, escanear el código QR con la app **Expo Go**, o presionar `a` para abrirla en el emulador de Android.

- El proyecto usa **Expo SDK 57**. Si Expo Go muestra _"Project is incompatible with this version of Expo Go"_, hay que instalar la versión de Expo Go para SDK 57 desde [expo.dev/go](https://expo.dev/go).
- La aplicación está pensada para **Android e iOS**. La versión web no está soportada: Lottie necesita una librería extra en el navegador.
- Los datos quedan guardados en el dispositivo. Para empezar de cero: _Ajustes → Aplicaciones → Expo Go → Almacenamiento → Borrar datos_.

## Estructura

```
assets/
  animations/          Animaciones Lottie (cargando, éxito y error)
  covers/              Portadas de los libros de ejemplo
src/
  app/
    _layout.tsx        Layout raíz: TanStack Query y ThemeProvider
    (tabs)/
      index.tsx        Inicio
      libros/          Catálogo, ficha ([id]), formulario y búsqueda en Open Library
      clientes/        Listado, ficha ([id]) y formulario
      alquileres/      Listado de préstamos y nuevo préstamo
  components/          Componentes reutilizables (Campo, Latido, Animacion, BotonEscuchar)
  constants/           Colores y tema de la aplicación
  services/            Conexión con la API de Open Library
  store/               Stores de Zustand (con persistencia en AsyncStorage)
  styled.d.ts          Tipos del tema para TypeScript
```

## Créditos

- Datos y portadas de la búsqueda online: [Open Library](https://openlibrary.org).
- Animaciones de carga (libro) y de éxito (registro): [LottieFiles](https://lottiefiles.com).
- Animación de error: hecha para este proyecto.
