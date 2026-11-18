// app/product/[documentId].tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { PageHeading, MediaThumb, money, FetchStatus } from '@/components/client/CatalogUI';
import { productService } from '@/services/products.service';
import { useCart } from '@/hooks/useCart';
import { errorText } from '@/hooks/useCatalog';
import type { Product } from '@/types/product.types';
export default function ProductDetailScreen() {
  const { documentId } = useLocalSearchParams<{documentId: string}>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { add } = useCart();
  const load = useCallback(async () => { if (!documentId) return; setLoading(true); try { const r = await productService.findOne(documentId, 'published'); setProduct(r.data); setError(null); } catch(e) { setError(errorText(e)); } finally { setLoading(false); } }, [documentId]);
  useEffect(() => { void load(); }, [load]);
  return <View className="flex-1 bg-[#F7F8F2]"><PageHeading title="Detalle de producto" back /><ScrollView contentContainerStyle={{paddingBottom: 40}}>
    {product ? <><MediaThumb src={product.mainImage} height={280} icon="fast-food-outline" resizeMode="contain" imageBackground="#FFFFFF"/><View className="m-5 rounded-3xl bg-white p-5"><Text className="text-2xl font-extrabold text-[#252A20]">{product.name}</Text><Text className="mt-2 text-sm font-semibold text-[#858A7A]">{product.restaurant?.name}</Text><Text className="mt-4 text-xl font-extrabold text-[#607B35]">{money(product.price)}</Text><Text className="mt-4 text-sm leading-6 text-[#747A6E]">{product.description || 'Sin descripción disponible.'}</Text><Text className="mt-2 text-sm text-[#858A7A]">{product.stock == null ? 'Consulta disponibilidad' : `En existencia: ${product.stock}`}</Text><Pressable disabled={!product.isAvailable || product.stock === 0} onPress={() => { if (add(product)) Toast.show({type:'success', text1:'Producto añadido'}); else Toast.show({type:'error',text1:'No se pudo añadir',text2:'Revisa la disponibilidad o el stock.'}); }} className="mt-5 flex-row items-center justify-center rounded-2xl bg-[#607B35] py-4"><Ionicons name="bag-add-outline" size={22} color="white" /><Text className="ml-2 font-extrabold text-white">Añadir al carrito</Text></Pressable></View></> : null}
    {loading || error ? <FetchStatus loading={loading} error={error} retry={() => void load()} /> : null}
  </ScrollView></View>;
}
