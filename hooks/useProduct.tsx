// hooks/useProduct.ts

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  productService,
} from '@/services/products.service';

import {
  categoryService,
} from '@/services/category.service';

import type {
  CreateProductData,
  Product,
  ProductImageUpload,
  ProductQueryParams,
  UpdateProductData,
} from '@/types/product.types';

import type {
  Category,
  CreateCategoryData,
} from '@/types/category.types';

// =====================================================
// OPTIONS
// =====================================================

interface UseProductOptions {
  documentId?: string;

  categoryId?:
    | number
    | string;

  autoLoad?: boolean;

  query?: ProductQueryParams;
}

// =====================================================
// SLUG
// =====================================================

export function createSlug(
  name: string
): string {
  return name
    .normalize(
      'NFD'
    )
    .replace(
      /[\u0300-\u036f]/g,
      ''
    )
    .toLowerCase()
    .trim()
    .replace(
      /[^a-z0-9\s-]/g,
      ''
    )
    .replace(
      /\s+/g,
      '-'
    )
    .replace(
      /-+/g,
      '-'
    );
}

// =====================================================
// HOOK
// =====================================================

export function useProduct(
  options:
    UseProductOptions = {}
) {
  const {
    documentId,
    categoryId,
    autoLoad = true,
    query,
  } = options;

  const [
    product,
    setProduct,
  ] =
    useState<Product | null>(
      null
    );

  const [
    products,
    setProducts,
  ] =
    useState<Product[]>(
      []
    );

  const [
    categories,
    setCategories,
  ] =
    useState<Category[]>(
      []
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    loadingCategories,
    setLoadingCategories,
  ] =
    useState(false);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(null);

  const mountedRef =
    useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current =
        false;
    };
  }, []);

  // ===================================================
  // SYNC PRODUCT
  // ===================================================

  const syncProduct =
    useCallback(
      (
        updated:
          Product
      ) => {
        if (
          !mountedRef.current
        ) {
          return;
        }

        setProduct(
          (
            current
          ) =>
            current
              ?.documentId ===
            updated.documentId
              ? updated
              : current
        );

        setProducts(
          (
            current
          ) =>
            current.map(
              (
                item
              ) =>
                item.documentId ===
                updated.documentId
                  ? updated
                  : item
            )
        );
      },
      []
    );

  // ===================================================
  // LOAD PRODUCT
  // ===================================================

  const loadProduct =
    useCallback(
      async (
        id: string
      ) => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await productService.findOne(
              id
            );

          if (
            mountedRef.current
          ) {
            setProduct(
              response.data
            );
          }

          return response.data;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo cargar el producto'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // LOAD PRODUCTS
  // ===================================================

  const loadProducts =
    useCallback(
      async (
        params:
          ProductQueryParams = {}
      ) => {
        setLoading(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await productService.findAll({
              ...params,

              categoryId:
                categoryId ??
                params.categoryId,
            });

          if (
            mountedRef.current
          ) {
            setProducts(
              response.data
            );
          }

          return response;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudieron cargar los productos'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setLoading(
              false
            );
          }
        }
      },
      [
        categoryId,
      ]
    );

  // ===================================================
  // LOAD CATEGORIES
  // ===================================================

  const loadCategories =
    useCallback(
      async () => {
        setLoadingCategories(
          true
        );

        try {
          const response =
            await categoryService.findAll({
              page: 1,

              pageSize:
                100,

              sort:
                'name:asc',

              isActive:
                true,

              restaurantId:
                query?.restaurantId,
            });

          if (
            mountedRef.current
          ) {
            setCategories(
              response.data
            );
          }

          return response.data;
        } finally {
          if (
            mountedRef.current
          ) {
            setLoadingCategories(
              false
            );
          }
        }
      },
      [
        query?.restaurantId,
      ]
    );

  // ===================================================
  // CREATE CATEGORY
  // ===================================================

  const createCategory =
    useCallback(
      async (
        data:
          CreateCategoryData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const response =
            await categoryService.create({
              ...data,

              name:
                data.name.trim(),

              isActive:
                data.isActive ??
                true,
            });

          const newCategory =
            response.data;

          if (
            mountedRef.current
          ) {
            setCategories(
              (
                current
              ) => [
                ...current,
                newCategory,
              ]
            );
          }

          return newCategory;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo crear la categoría'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // CREATE PRODUCT
  // ===================================================

  const createProduct =
    useCallback(
      async (
        data:
          CreateProductData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const name =
            data.name.trim();

          const price =
            Number(
              data.price
            );

          const stock =
            Math.max(
              0,
              Math.floor(
                Number(
                  data.stock ??
                    0
                )
              )
            );

          if (!name) {
            throw new Error(
              'El nombre del producto es obligatorio.'
            );
          }

          if (
            !Number.isFinite(
              price
            ) ||
            price < 0
          ) {
            throw new Error(
              'El precio del producto no es válido.'
            );
          }

          const productData:
            CreateProductData = {
              ...data,

              name,

              slug:
                data.slug
                  ?.trim() ||
                createSlug(
                  name
                ),

              description:
                data.description
                  ?.trim() ||
                null,

              price:
                Number(
                  price.toFixed(
                    2
                  )
                ),

              stock,

              isAvailable:
                data.isAvailable ??
                stock >
                  0,
            };

          const response =
            await productService.create(
              productData
            );

          const newProduct =
            response.data;

          if (
            mountedRef.current
          ) {
            setProduct(
              newProduct
            );

            setProducts(
              (
                current
              ) => [
                newProduct,
                ...current,
              ]
            );
          }

          return newProduct;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              requestError instanceof
                Error
                ? requestError.message
                : 'No se pudo crear el producto'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // UPDATE PRODUCT
  // ===================================================

  const updateProduct =
    useCallback(
      async (
        id: string,

        data:
          UpdateProductData
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          const productData:
            UpdateProductData = {
              ...data,
          };

          if (
            data.name !==
            undefined
          ) {
            const name =
              data.name.trim();

            productData.name =
              name;

            productData.slug =
              data.slug
                ?.trim() ||
              createSlug(
                name
              );
          }

          if (
            data.description !==
            undefined
          ) {
            productData.description =
              data.description
                ?.trim() ||
              null;
          }

          if (
            data.price !==
            undefined
          ) {
            productData.price =
              Number(
                Number(
                  data.price
                ).toFixed(
                  2
                )
              );
          }

          if (
            data.stock !==
            undefined
          ) {
            const stock =
              Math.max(
                0,
                Math.floor(
                  Number(
                    data.stock
                  )
                )
              );

            productData.stock =
              stock;

            if (
              stock === 0 &&
              data.isAvailable ===
                undefined
            ) {
              productData.isAvailable =
                false;
            }
          }

          const response =
            await productService.patch(
              id,
              productData
            );

          const updated =
            response.data;

          syncProduct(
            updated
          );

          return updated;
        } catch (
          requestError
        ) {
          if (
            mountedRef.current
          ) {
            setError(
              'No se pudo actualizar el producto'
            );
          }

          throw requestError;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      [
        syncProduct,
      ]
    );

  // ===================================================
  // MAIN IMAGE
  // ===================================================

  const createMainImage =
    useCallback(
      async (
        id: string,

        image:
          ProductImageUpload
      ) => {
        setSaving(
          true
        );

        try {
          const response =
            await productService.createMainImage(
              id,
              image.uri,
              image.fileName ??
                'product.jpg',
              image.mimeType ??
                'image/jpeg'
            );

          syncProduct(
            response.data
          );

          return response.data;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      [
        syncProduct,
      ]
    );

  const updateMainImage =
    useCallback(
      async (
        id: string,

        image:
          ProductImageUpload
      ) => {
        setSaving(
          true
        );

        try {
          const response =
            await productService.updateMainImage(
              id,
              image.uri,
              image.fileName ??
                'product.jpg',
              image.mimeType ??
                'image/jpeg'
            );

          syncProduct(
            response.data
          );

          return response.data;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      [
        syncProduct,
      ]
    );

  const deleteMainImage =
    useCallback(
      async (
        id: string
      ) => {
        setSaving(
          true
        );

        try {
          const response =
            await productService.deleteMainImage(
              id
            );

          syncProduct(
            response.data
          );

          return response.data;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      [
        syncProduct,
      ]
    );

  // ===================================================
  // GALLERY
  // ===================================================

  const addGalleryImages =
    useCallback(
      async (
        id: string,

        images:
          ProductImageUpload[]
      ) => {
        setSaving(
          true
        );

        try {
          const response =
            await productService.addGalleryImages(
              id,
              images
            );

          syncProduct(
            response.data
          );

          return response.data;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      [
        syncProduct,
      ]
    );

  const updateGalleryImage =
    useCallback(
      async (
        id: string,

        fileId:
          | number
          | string,

        image:
          ProductImageUpload
      ) => {
        setSaving(
          true
        );

        try {
          const response =
            await productService.updateGalleryImage(
              id,
              fileId,
              image.uri,
              image.fileName ??
                'gallery.jpg',
              image.mimeType ??
                'image/jpeg'
            );

          syncProduct(
            response.data
          );

          return response.data;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      [
        syncProduct,
      ]
    );

  const deleteGalleryImage =
    useCallback(
      async (
        id: string,

        fileId:
          | number
          | string
      ) => {
        setSaving(
          true
        );

        try {
          const response =
            await productService.deleteGalleryImage(
              id,
              fileId
            );

          syncProduct(
            response.data
          );

          return response.data;
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      [
        syncProduct,
      ]
    );

  // ===================================================
  // AVAILABLE
  // ===================================================

  const toggleAvailability =
    useCallback(
      async (
        id: string,
        value:
          boolean
      ) => {
        return updateProduct(
          id,
          {
            isAvailable:
              value,
          }
        );
      },
      [
        updateProduct,
      ]
    );

  // ===================================================
  // DELETE PRODUCT
  // ===================================================

  const deleteProduct =
    useCallback(
      async (
        id: string
      ) => {
        setSaving(
          true
        );

        setError(
          null
        );

        try {
          await productService.remove(
            id
          );

          if (
            mountedRef.current
          ) {
            setProducts(
              (
                current
              ) =>
                current.filter(
                  (
                    item
                  ) =>
                    item.documentId !==
                    id
                )
            );

            setProduct(
              (
                current
              ) =>
                current
                  ?.documentId ===
                id
                  ? null
                  : current
            );
          }
        } finally {
          if (
            mountedRef.current
          ) {
            setSaving(
              false
            );
          }
        }
      },
      []
    );

  // ===================================================
  // AUTO LOAD
  // ===================================================

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (
      documentId
    ) {
      void loadProduct(
        documentId
      );

      return;
    }

    void loadProducts(
      query
    );
  }, [
    autoLoad,
    documentId,
    categoryId,

    query?.page,
    query?.pageSize,
    query?.sort,
    query?.restaurantId,
    query?.categoryId,
    query?.available,
    query?.name,

    loadProduct,
    loadProducts,
  ]);

  return {
    product,
    products,
    categories,

    loading,
    loadingCategories,
    saving,
    error,

    loadProduct,
    loadProducts,
    loadCategories,

    createProduct,
    updateProduct,
    deleteProduct,

    toggleAvailability,

    createMainImage,
    updateMainImage,
    deleteMainImage,

    addGalleryImages,
    updateGalleryImage,
    deleteGalleryImage,

    createCategory,

    createSlug,

    refresh:
      documentId
        ? () =>
            loadProduct(
              documentId
            )
        : () =>
            loadProducts(
              query
            ),
  };
}