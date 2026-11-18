import { Redirect } from 'expo-router';

/** Legacy route kept for old links. The canonical history now lives in the Orders tab. */
export default function MyOrdersRedirect() {
  return <Redirect href="/(tabs)/orders" />;
}
