// components/restaurant/RestaurantProductCard.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import {
  api,
} from '@/services/api';

import type {
  Product,
} from '@/types/product.types';

interface RestaurantProductCardProps {
  product:
    Product;

  onEdit:
    (
      product: Product
    ) => void;

  onDelete:
    (
      product: Product
    ) => void;
}

function getImageUrl(
  url?:
    | string
    | null
): string | null {
  if (!url) {
    return null;
  }

  if (
    url.startsWith(
      'http://'
    ) ||
    url.startsWith(
      'https://'
    )
  ) {
    return url;
  }

  const baseUrl =
    String(
      api.defaults
        .baseURL ??
        ''
    ).replace(
      /\/$/,
      ''
    );

  return `${baseUrl}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

export default function RestaurantProductCard({
  product,
  onEdit,
  onDelete,
}: RestaurantProductCardProps) {
  const imageUrl =
    getImageUrl(
      product.mainImage
        ?.url
    );

  return (
    <View
      className="
        rounded-3xl
        border
        border-[#E7EAE1]
        bg-white
        p-3
      "
    >
      <View
        className="
          flex-row
        "
      >
        <View
          className="
            h-24
            w-24
            overflow-hidden
            rounded-2xl
            bg-[#EEF3E3]
          "
        >
          {imageUrl ? (
            <Image
              source={{
                uri:
                  imageUrl,
              }}
              resizeMode="cover"
              className="
                h-full
                w-full
              "
            />
          ) : (
            <View
              className="
                flex-1
                items-center
                justify-center
              "
            >
              <Ionicons
                name="fast-food-outline"
                size={29}
                color="#7B9646"
              />
            </View>
          )}
        </View>

        <View
          className="
            ml-4
            flex-1
          "
        >
          <View
            className="
              flex-row
              items-start
              justify-between
            "
          >
            <View
              className="
                flex-1
                pr-2
              "
            >
              <Text
                numberOfLines={1}
                className="
                  text-base
                  font-extrabold
                  text-[#171A15]
                "
              >
                {product.name}
              </Text>

              <Text
                className="
                  mt-1
                  text-lg
                  font-extrabold
                  text-[#6F8C3E]
                "
              >
                Bs{' '}
                {Number(
                  product.price
                ).toFixed(
                  2
                )}
              </Text>
            </View>

            <View
              className={`
                rounded-full
                px-2.5
                py-1
                ${
                  product.isAvailable
                    ? 'bg-[#EEF3E3]'
                    : 'bg-[#FBECEA]'
                }
              `}
            >
              <Text
                className={`
                  text-xs
                  font-bold
                  ${
                    product.isAvailable
                      ? 'text-[#607B35]'
                      : 'text-[#A95249]'
                  }
                `}
              >
                {product.isAvailable
                  ? 'Disponible'
                  : 'No disponible'}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={2}
            className="
              mt-2
              text-sm
              leading-5
              text-[#7B8175]
            "
          >
            {product.description ||
              'Sin descripción'}
          </Text>

          <Text
            className="
              mt-2
              text-xs
              font-semibold
              text-[#777D71]
            "
          >
            Stock:{' '}
            {product.stock ??
              0}
          </Text>
        </View>
      </View>

      <View
        className="
          mt-3
          flex-row
          gap-2
        "
      >
        <Pressable
          onPress={() =>
            onEdit(
              product
            )
          }
          className="
            flex-1
            flex-row
            items-center
            justify-center
            rounded-2xl
            bg-[#EEF3E3]
            py-3
          "
        >
          <Ionicons
            name="create-outline"
            size={19}
            color="#607B35"
          />

          <Text
            className="
              ml-2
              font-bold
              text-[#607B35]
            "
          >
            Editar
          </Text>
        </Pressable>

        <Pressable
          onPress={() =>
            onDelete(
              product
            )
          }
          className="
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-[#FBECEA]
          "
        >
          <Ionicons
            name="trash-outline"
            size={20}
            color="#B65D51"
          />
        </Pressable>
      </View>
    </View>
  );
}