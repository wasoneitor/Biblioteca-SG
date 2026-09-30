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

| #   | Feature                                                | Descripción                                                                                                                                            | Estado    |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------- |
| 1   | Registrar un cliente                                   | Alta de socios con nombre, DNI, teléfono, correo y foto (desde la galería o la cámara). Valida los datos y no permite DNI repetidos.                   | Completa  |
| 2   | Consultar y buscar clientes                            | Listado de socios ordenado por apellido, con búsqueda por nombre o DNI.                                                                                | Completa  |
| 3   | Modificar los datos de un cliente                      | Edición de los datos y la foto de un socio.                                                                                                            | Completa  |
| 4   | Eliminar un cliente                                    | Baja con confirmación. No se permite si el socio tiene libros prestados.                                                                               | Completa  |
| 5   | Consultar la ficha de un cliente                       | Datos de contacto (con acceso directo para llamar o escribir), libros que tiene en préstamo e historial de devoluciones.                               | Completa  |
| 6   | Agregar un libro al catálogo                           | Alta de libros con título, autor, editorial, género, cantidad de copias y portada.                                                                     | Completa  |
| 7   | Consultar, buscar y filtrar el catálogo                | Catálogo en grilla con portadas, búsqueda por título o autor y filtro por género. Muestra las copias disponibles de cada libro.                        | Completa  |
| 8   | Consultar el detalle de un libro                       | Ficha con los datos del libro, su disponibilidad y quién tiene cada copia prestada.                                                                    | Completa  |
| 9   | Modificar y eliminar libros                            | Edición de los datos del libro. No se puede dejar menos copias que las prestadas ni eliminar un libro con copias prestadas.                            | Completa  |
| 10  | Registrar un préstamo                                  | Selección de socio, libro y plazo de devolución (7, 14 o 21 días). Solo ofrece libros con copias disponibles.                                          | Completa  |
| 11  | Registrar una devolución                               | Devolución desde el listado de préstamos, la ficha del cliente o la ficha del libro. La copia vuelve a estar disponible.                               | Completa  |
| 12  | Consultar los préstamos y sus vencimientos             | Préstamos en curso y devueltos. Los vencidos se destacan y se avisan en la pantalla de inicio.                                                         | Completa  |
| 13  | Buscar libros en Open Library y agregarlos al catálogo | Búsqueda en una API externa con scroll infinito. Permite agregar un resultado al catálogo con su portada, eligiendo el género y la cantidad de copias. | Completa  |
| 14  | Guardar los datos en el dispositivo                    | Conservar libros, clientes y préstamos al cerrar la aplicación (AsyncStorage).                                                                         | Pendiente |

## Contenidos de la materia aplicados

- **Navegación con Expo Router:** Stack, parámetros entre pantallas, grupos de rutas y Tabs.
- **Estilos con Styled Components**, con componentes reutilizables.
- **Listas:** `FlatList` en grilla y horizontal, filtros por categoría y scroll infinito.
- **Estado global con Zustand:** tres stores (libros, clientes y alquileres) conectados entre sí.
- **Consumo de APIs con TanStack Query:** `useQuery` y `useInfiniteQuery`, con caché y manejo de errores.
- **Cámara y galería** con `expo-image-picker`.

## Cómo ejecutar el proyecto

```bash
npm install
npx expo start
```

Después, escanear el código QR con la app **Expo Go**, o presionar `a` para abrirla en el emulador de Android.

## Estructura

```
src/
  app/
    (tabs)/
      index.tsx        Inicio
      libros/          Catálogo, ficha, formulario y búsqueda en Open Library
      clientes/        Listado, ficha y formulario
      alquileres/      Listado de préstamos y nuevo préstamo
  components/          Componentes reutilizables
  constants/           Colores de la aplicación
  services/            Conexión con la API de Open Library
  store/               Stores de Zustand
```
