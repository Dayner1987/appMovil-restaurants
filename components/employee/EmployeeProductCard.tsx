import { useEffect, useState } from 'react';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Image, Pressable, Text, View } from 'react-native';
import type { Product } from '@/types/product.types';
import { mediaUrl } from '@/utils/media';

interface EmployeeProductCardProps {
  product: Product;
  saving?: boolean;
  onToggle: () => void;
}

export default function EmployeeProductCard({
  product,
  saving = false,
  onToggle,
}: EmployeeProductCardProps) {
  const available = Boolean(product.isAvailable);
  const stock = Number(product.stock ?? 0);
  const imageUri = mediaUrl(product.mainImage ?? product.gallery?.[0] ?? null);
  const [imageError, setImageError] = useState(false);
  useEffect(() => setImageError(false), [imageUri]);

  return (
    <View className="rounded-[24px] border border-[#E8EDE1] bg-white p-4">
      <View className="flex-row items-start">
        <View className="h-24 w-24 overflow-hidden rounded-[18px] bg-[#EDF3E5]">
          {imageUri && !imageError ? (
            <Image
              source={{ uri: imageUri }}
              resizeMode="cover"
              className="h-full w-full"
              onError={() => setImageError(true)}
              accessibilityLabel={`Imagen de ${product.name}`}
            />
          ) : (
            <View className="flex-1 items-center justify-center">
              <Ionicons name="image-outline" size={30} color="#92A678" />
              <Text className="mt-1 text-[9px] text-[#89957D]">Sin imagen</Text>
            </View>
          )}
        </View>
        <View className="ml-3 flex-1">
          <Text numberOfLines={2} className="text-[16px] font-extrabold leading-5 text-[#20291B]">
            {product.name}
          </Text>
          <Text numberOfLines={1} className="mt-1 text-[11px] text-[#849179]">
            {product.category?.name || 'Sin categoría'}
          </Text>
          <Text className="mt-2 text-[18px] font-extrabold text-[#617D34]">
            Bs {Number(product.price ?? 0).toFixed(2)}
          </Text>
          <View className="mt-2 flex-row items-center">
            <Ionicons name="cube-outline" size={14} color="#7C8773" />
            <Text className="ml-1 text-[11px] font-medium text-[#7C8773]">
              Stock: {stock}
            </Text>
          </View>
        </View>
      </View>

      <View className="mt-4 flex-row items-center justify-between">
        <View className={`flex-row items-center rounded-full px-3 py-1.5 ${available ? 'bg-[#ECF3E3]' : 'bg-[#F9EAE8]'}`}>
          <Ionicons name={available ? 'checkmark-circle' : 'close-circle'} size={14} color={available ? '#617D34' : '#B9635A'} />
          <Text className={`ml-1.5 text-[11px] font-bold ${available ? 'text-[#617D34]' : 'text-[#B9635A]'}`}>
            {available ? 'Disponible' : 'No disponible'}
          </Text>
        </View>
        {stock <= 0 && <Text className="text-[11px] font-semibold text-[#B9635A]">Sin existencias</Text>}
      </View>

      <Pressable
        disabled={saving || (!available && stock <= 0)}
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={available ? `Marcar ${product.name} no disponible` : `Marcar ${product.name} disponible`}
        className={`mt-3 min-h-12 flex-row items-center justify-center rounded-2xl px-3 active:opacity-80 ${
          available ? 'bg-[#EFF3E8]' : 'bg-[#617D34]'
        } ${(saving || (!available && stock <= 0)) ? 'opacity-60' : ''}`}
      >
        {saving ? (
          <ActivityIndicator color={available ? '#617D34' : '#FFFFFF'} />
        ) : (
          <>
            <Ionicons name={available ? 'eye-off-outline' : 'eye-outline'} size={19} color={available ? '#617D34' : '#FFFFFF'} />
            <Text className={`ml-2 text-[13px] font-bold ${available ? 'text-[#617D34]' : 'text-white'}`}>
              {available ? 'Marcar no disponible' : 'Marcar disponible'}
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
