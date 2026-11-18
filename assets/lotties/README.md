# Animaciones Lottie del área del cliente

Coloca aquí tus animaciones exportadas como `.json`.

Ubicaciones sugeridas:

- `hero-comida.json`: inicio, en `app/(tabs)/index.tsx` (en el hero se utiliza temporalmente `assets/fonts/Shopping.json`).
- `carrito-vacio.json`: carrito sin productos, en `app/cart.tsx`.
- `publicaciones-vacias.json`: feed vacío, en `app/(tabs)/publications.tsx`.
- `restaurantes-vacios.json`: listado de restaurantes, en `app/(tabs)/restaurants.tsx`.
- `pedido-exitoso.json`: después de crear pedidos; crear una pantalla de confirmación si se desea.
- `inicio-footer.json`: parte baja de inicio, en `app/(tabs)/index.tsx`.

El proyecto ya importa `lottie-react-native` en otras pantallas. Para insertar una animación:

```tsx
import LottieView from 'lottie-react-native';

<LottieView
  source={require('../../assets/lotties/hero-comida.json')}
  autoPlay
  loop
  style={{ width: 140, height: 140 }}
/>
```

**IMPORTANTE:** `require` debe ser estático, con ruta real. No pongas nombres de JSON que todavía no existan porque Metro fallará al compilar.
Las pantallas incluyen comentarios `LOTTIE` para identificar el lugar exacto de inserción.
