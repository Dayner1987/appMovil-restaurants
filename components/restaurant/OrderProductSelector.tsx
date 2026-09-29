// components/restaurant/OrderProductSelector.tsx

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import type {
  Product,
} from '@/types/product.types';

export interface SelectedOrderProduct {
  product:
    Product;

  quantity:
    number;
}

interface OrderProductSelectorProps {
  products:
    Product[];

  selected:
    SelectedOrderProduct[];

  onChange:
    (
      value:
        SelectedOrderProduct[]
    ) => void;
}

export default function OrderProductSelector({
  products,
  selected,
  onChange,
}: OrderProductSelectorProps) {
  const getQuantity =
    (
      documentId:
        string
    ) =>
      selected.find(
        (
          item
        ) =>
          item.product
            .documentId ===
          documentId
      )?.quantity ??
      0;

  const changeQuantity =
    (
      product:
        Product,

      nextQuantity:
        number
    ) => {
      const quantity =
        Math.max(
          0,
          nextQuantity
        );

      if (
        quantity ===
        0
      ) {
        onChange(
          selected.filter(
            (
              item
            ) =>
              item.product
                .documentId !==
              product.documentId
          )
        );

        return;
      }

      const exists =
        selected.some(
          (
            item
          ) =>
            item.product
              .documentId ===
            product.documentId
        );

      if (exists) {
        onChange(
          selected.map(
            (
              item
            ) =>
              item.product
                .documentId ===
              product.documentId
                ? {
                    ...item,

                    quantity,
                  }
                : item
          )
        );

        return;
      }

      onChange([
        ...selected,

        {
          product,

          quantity,
        },
      ]);
    };

  const availableProducts =
    products.filter(
      (
        product
      ) =>
        product.isAvailable !==
          false &&
        Number(
          product.stock ??
          0
        ) >
          0
    );

  return (
    <View
      className="
        gap-3
      "
    >
      {availableProducts.map(
        (
          product
        ) => {
          const quantity =
            getQuantity(
              product.documentId
            );

          return (
            <View
              key={
                product.documentId
              }
              className="
                flex-row
                items-center
                rounded-2xl
                border
                border-[#E5E8DE]
                bg-white
                p-4
              "
            >
              <View
                className="
                  flex-1
                  pr-3
                "
              >
                <Text
                  className="
                    font-extrabold
                    text-[#171A15]
                  "
                >
                  {product.name}
                </Text>

                <Text
                  className="
                    mt-1
                    text-sm
                    font-bold
                    text-[#607B35]
                  "
                >
                  Bs{' '}
                  {Number(
                    product.price
                  ).toFixed(
                    2
                  )}
                </Text>

                <Text
                  className="
                    mt-1
                    text-xs
                    text-[#858B80]
                  "
                >
                  Stock:{' '}
                  {product.stock ??
                    0}
                </Text>
              </View>

              <View
                className="
                  flex-row
                  items-center
                  rounded-2xl
                  bg-[#F3F5EE]
                  p-1
                "
              >
                <Pressable
                  onPress={() =>
                    changeQuantity(
                      product,
                      quantity -
                        1
                    )
                  }
                  className="
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                  "
                >
                  <Ionicons
                    name="remove-outline"
                    size={19}
                    color="#536A2F"
                  />
                </Pressable>

                <Text
                  className="
                    w-10
                    text-center
                    font-extrabold
                    text-[#171A15]
                  "
                >
                  {quantity}
                </Text>

                <Pressable
                  onPress={() =>
                    changeQuantity(
                      product,
                      Math.min(
                        quantity +
                          1,

                        Number(
                          product.stock ??
                          quantity +
                            1
                        )
                      )
                    )
                  }
                  className="
                    h-9
                    w-9
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#6F8C3E]
                  "
                >
                  <Ionicons
                    name="add-outline"
                    size={19}
                    color="#FFFFFF"
                  />
                </Pressable>
              </View>
            </View>
          );
        }
      )}

      {availableProducts.length ===
      0 ? (
        <View
          className="
            items-center
            rounded-2xl
            bg-white
            px-5
            py-8
          "
        >
          <Ionicons
            name="cube-outline"
            size={30}
            color="#8A9680"
          />

          <Text
            className="
              mt-3
              text-center
              font-bold
              text-[#343A30]
            "
          >
            No hay productos disponibles
          </Text>
        </View>
      ) : null}
    </View>
  );
}