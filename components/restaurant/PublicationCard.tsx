// components/restaurant/PublicationCard.tsx

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
  Publication,
  PublicationImage,
} from '@/types/publication.types';

interface PublicationCardProps {
  publication:
    Publication;

  onEdit:
    (
      publication:
        Publication
    ) => void;

  onDelete:
    (
      publication:
        Publication
    ) => void;
}

// =====================================================
// IMAGE
// =====================================================

function getAbsoluteUrl(
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
      api.defaults.baseURL ??
      ''
    ).replace(
      /\/$/,
      ''
    );

  if (!baseUrl) {
    return null;
  }

  return `${baseUrl}${
    url.startsWith('/')
      ? url
      : `/${url}`
  }`;
}

function getImageUrl(
  image?:
    | PublicationImage
    | null
): string | null {
  if (!image) {
    return null;
  }

  return getAbsoluteUrl(
    image.formats
      ?.thumbnail
      ?.url ??
    image.formats
      ?.small
      ?.url ??
    image.url ??
    null
  );
}

// =====================================================
// DATE
// =====================================================

function formatDate(
  value?:
    string
): string {
  if (!value) {
    return '';
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '';
  }

  return date.toLocaleDateString(
    'es-BO',
    {
      day:
        '2-digit',

      month:
        'short',

      year:
        'numeric',
    }
  );
}

// =====================================================
// COMPONENT
// =====================================================

export default function PublicationCard({
  publication,
  onEdit,
  onDelete,
}: PublicationCardProps) {
  const imageUrl =
    getImageUrl(
      publication.image
    );

  return (
    <View
      className="
        rounded-3xl
        border
        border-[#E6E9E0]
        bg-white
        p-3
      "
    >
      <View
        className="
          flex-row
        "
      >
        {/* IMAGE */}

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
                name="image-outline"
                size={29}
                color="#78934A"
              />

              <Text
                className="
                  mt-1
                  text-[10px]
                  font-semibold
                  text-[#78934A]
                "
              >
                Sin imagen
              </Text>
            </View>
          )}
        </View>

        {/* INFO */}

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
            <Text
              numberOfLines={2}
              className="
                flex-1
                pr-2
                text-base
                font-extrabold
                text-[#171A15]
              "
            >
              {publication.title}
            </Text>

            {publication.featured ? (
              <View
                className="
                  flex-row
                  items-center
                  rounded-full
                  bg-[#FFF0DD]
                  px-2.5
                  py-1
                "
              >
                <Ionicons
                  name="star"
                  size={12}
                  color="#D47A24"
                />

                <Text
                  className="
                    ml-1
                    text-[10px]
                    font-bold
                    text-[#B86216]
                  "
                >
                  Destacada
                </Text>
              </View>
            ) : null}
          </View>

          <Text
            numberOfLines={3}
            className="
              mt-2
              text-sm
              leading-5
              text-[#747B6D]
            "
          >
            {publication.description}
          </Text>

          <View
            className="
              mt-2
              flex-row
              items-center
            "
          >
            <Ionicons
              name="calendar-outline"
              size={14}
              color="#8A9084"
            />

            <Text
              className="
                ml-1.5
                text-xs
                text-[#8A9084]
              "
            >
              {formatDate(
                publication.updatedAt
              )}
            </Text>
          </View>
        </View>
      </View>

      {/* ACTIONS */}

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
              publication
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
            size={18}
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
              publication
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