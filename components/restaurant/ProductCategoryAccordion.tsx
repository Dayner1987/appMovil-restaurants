// components/restaurant/ProductCategoryAccordion.tsx

import {
  useState,
} from 'react';

import Ionicons from '@expo/vector-icons/Ionicons';

import {
  Pressable,
  Text,
  View,
} from 'react-native';

import type {
  Product,
} from '@/types/product.types';

import RestaurantProductCard from './RestaurantProductCard';

interface ProductCategoryAccordionProps {
  title:
    string;

  products:
    Product[];

  defaultOpen?:
    boolean;

  onEdit:
    (
      product: Product
    ) => void;

  onDelete:
    (
      product: Product
    ) => void;
}

export default function ProductCategoryAccordion({
  title,
  products,
  defaultOpen = false,
  onEdit,
  onDelete,
}: ProductCategoryAccordionProps) {
  const [
    open,
    setOpen,
  ] =
    useState(
      defaultOpen
    );

  return (
    <View
      className="
        overflow-hidden
        rounded-3xl
        bg-white
      "
    >
      <Pressable
        onPress={() =>
          setOpen(
            (
              current
            ) =>
              !current
          )
        }
        className="
          flex-row
          items-center
          px-4
          py-4
        "
      >
        <View
          className="
            h-11
            w-11
            items-center
            justify-center
            rounded-2xl
            bg-[#EEF3E3]
          "
        >
          <Ionicons
            name="grid-outline"
            size={21}
            color="#6F8C3E"
          />
        </View>

        <View
          className="
            ml-3
            flex-1
          "
        >
          <Text
            className="
              text-base
              font-extrabold
              text-[#171A15]
            "
          >
            {title}
          </Text>

          <Text
            className="
              mt-0.5
              text-xs
              text-[#858B80]
            "
          >
            {products.length}{' '}
            {products.length ===
            1
              ? 'producto'
              : 'productos'}
          </Text>
        </View>

        <Ionicons
          name={
            open
              ? 'chevron-up-outline'
              : 'chevron-down-outline'
          }
          size={21}
          color="#777D71"
        />
      </Pressable>

      {open ? (
        <View
          className="
            gap-3
            bg-[#F7F8F2]
            px-3
            pb-3
            pt-1
          "
        >
          {products.length >
          0 ? (
            products.map(
              (
                product
              ) => (
                <RestaurantProductCard
                  key={
                    product.documentId
                  }
                  product={
                    product
                  }
                  onEdit={
                    onEdit
                  }
                  onDelete={
                    onDelete
                  }
                />
              )
            )
          ) : (
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
                size={28}
                color="#A2A79C"
              />

              <Text
                className="
                  mt-2
                  text-sm
                  text-[#858B80]
                "
              >
                No hay productos en
                esta categoría.
              </Text>
            </View>
          )}
        </View>
      ) : null}
    </View>
  );
}