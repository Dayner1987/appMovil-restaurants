import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { productService } from '@/services/products.service';
import { categoryService } from '@/services/category.service';

import type {
  Product,
  ProductQueryParams,
  CreateProductData,
  UpdateProductData,
} from '@/types/product.types';

import type {
  Category,
  CreateCategoryData,
} from '@/types/category.types';

interface UseProductOptions {
  documentId?: string;
  categoryId?: number | string;
  autoLoad?: boolean;
  query?: ProductQueryParams;
}

function createSlug(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function useProduct(
  options: UseProductOptions = {}
) {
  const {
    documentId,
    categoryId,
    autoLoad = true,
    query,
  } = options;

  const [product, setProduct] =
    useState<Product | null>(null);

  const [products, setProducts] =
    useState<Product[]>([]);

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingCategories, setLoadingCategories] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadProduct = useCallback(async (
    id: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await productService.findOne(id);

      if (mountedRef.current) {
        setProduct(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cargar el producto');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadProducts = useCallback(async (
    params: ProductQueryParams = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response =
        await productService.findAll(params);

      if (mountedRef.current) {
        setProducts(response.data);
      }

      return response;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudieron cargar los productos');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);

    try {
      const response =
        await categoryService.findAll({
          page: 1,
          pageSize: 100,
          sort: 'name:asc',
          isActive: true,
        });

      if (mountedRef.current) {
        setCategories(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudieron cargar las categorías');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoadingCategories(false);
      }
    }
  }, []);

  const createCategory = useCallback(async (
    data: CreateCategoryData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response =
        await categoryService.create({
          ...data,
          name: data.name.trim(),
          isActive: data.isActive ?? true,
        });

      const newCategory = response.data;

      if (mountedRef.current) {
        setCategories((currentCategories) => [
          ...currentCategories,
          newCategory,
        ]);
      }

      return newCategory;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo crear la categoría');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const createProduct = useCallback(async (
    data: CreateProductData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const productData: CreateProductData = {
        ...data,
        name: data.name.trim(),
        slug: data.slug?.trim() || createSlug(data.name),
        price: Number(data.price),
        stock: data.stock ?? 0,
        isAvailable: data.isAvailable ?? true,
      };

      const response =
        await productService.create(productData);

      const newProduct = response.data;

      if (mountedRef.current) {
        setProduct(newProduct);
        setProducts((currentProducts) => [
          newProduct,
          ...currentProducts,
        ]);
      }

      return newProduct;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo crear el producto');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const updateProduct = useCallback(async (
    id: string,
    data: UpdateProductData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const productData: UpdateProductData = {
        ...data,
      };

      if (data.name !== undefined) {
        productData.name = data.name.trim();
        productData.slug =
          data.slug?.trim() || createSlug(data.name);
      }

      if (data.price !== undefined) {
        productData.price = Number(data.price);
      }

      if (data.stock !== undefined) {
        productData.stock = Number(data.stock);
      }

      const response =
        await productService.update(
          id,
          productData
        );

      const updatedProduct = response.data;

      if (mountedRef.current) {
        setProduct(updatedProduct);

        setProducts((currentProducts) =>
          currentProducts.map((item) =>
            item.documentId ===
            updatedProduct.documentId
              ? updatedProduct
              : item
          )
        );
      }

      return updatedProduct;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar el producto');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const toggleAvailability = useCallback(async (
    id: string,
    isAvailable: boolean
  ) => {
    return updateProduct(id, {
      isAvailable,
    });
  }, [updateProduct]);

  const deleteProduct = useCallback(async (
    id: string
  ) => {
    setSaving(true);
    setError(null);

    try {
      await productService.remove(id);

      if (mountedRef.current) {
        setProducts((currentProducts) =>
          currentProducts.filter(
            (item) => item.documentId !== id
          )
        );

        if (product?.documentId === id) {
          setProduct(null);
        }
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo eliminar el producto');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [product?.documentId]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadProduct(documentId);
      return;
    }

    void loadProducts({
      ...query,
      categoryId: categoryId ?? query?.categoryId,
    });
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
    createCategory,
    createSlug,
    refresh: documentId
      ? () => loadProduct(documentId)
      : () =>
          loadProducts({
            ...query,
            categoryId: categoryId ?? query?.categoryId,
          }),
  };
}