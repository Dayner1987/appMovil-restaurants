import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { companyService } from '@/services/company.service';

import type {
  Company,
  CompanyQueryParams,
  CreateCompanyData,
  UpdateCompanyData,
} from '@/types/company.types';

interface UseCompanyOptions {
  documentId?: string;
  autoLoad?: boolean;
  query?: CompanyQueryParams;
}

export function useCompany(
  options: UseCompanyOptions = {}
) {
  const {
    documentId,
    autoLoad = true,
    query,
  } = options;

  const [company, setCompany] = useState<Company | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadCompany = useCallback(async (
    id: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await companyService.findOne(id);

      if (mountedRef.current) {
        setCompany(response.data);
      }

      return response.data;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo cargar la empresa');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const loadCompanies = useCallback(async (
    params: CompanyQueryParams = {}
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await companyService.findAll(params);

      if (mountedRef.current) {
        setCompanies(response.data);
      }

      return response;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudieron cargar las empresas');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  const createCompany = useCallback(async (
    data: CreateCompanyData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response = await companyService.create(data);
      const newCompany = response.data;

      if (mountedRef.current) {
        setCompanies((currentCompanies) => [
          newCompany,
          ...currentCompanies,
        ]);
        setCompany(newCompany);
      }

      return newCompany;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo crear la empresa');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const updateCompany = useCallback(async (
    id: string,
    data: UpdateCompanyData
  ) => {
    setSaving(true);
    setError(null);

    try {
      const response = await companyService.update(id, data);
      const updatedCompany = response.data;

      if (mountedRef.current) {
        setCompany(updatedCompany);

        setCompanies((currentCompanies) =>
          currentCompanies.map((item) =>
            item.documentId === updatedCompany.documentId
              ? updatedCompany
              : item
          )
        );
      }

      return updatedCompany;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar la empresa');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, []);

  const uploadCompanyLogo = useCallback(async (
    id: string,
    imageUri: string,
    fileName = 'company-logo.jpg',
    mimeType = 'image/jpeg'
  ) => {
    setSaving(true);
    setError(null);

    try {
      const uploadedImage = await companyService.uploadLogo(
        imageUri,
        fileName,
        mimeType
      );

      const updatedCompany = await updateCompany(id, {
        logoImg: uploadedImage.id,
      });

      return updatedCompany;
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo actualizar el logo');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [updateCompany]);

  const deleteCompany = useCallback(async (
    id: string
  ) => {
    setSaving(true);
    setError(null);

    try {
      await companyService.remove(id);

      if (mountedRef.current) {
        setCompanies((currentCompanies) =>
          currentCompanies.filter(
            (item) => item.documentId !== id
          )
        );

        if (company?.documentId === id) {
          setCompany(null);
        }
      }
    } catch (requestError) {
      if (mountedRef.current) {
        setError('No se pudo eliminar la empresa');
      }

      throw requestError;
    } finally {
      if (mountedRef.current) {
        setSaving(false);
      }
    }
  }, [company?.documentId]);

  useEffect(() => {
    if (!autoLoad) {
      return;
    }

    if (documentId) {
      void loadCompany(documentId);
      return;
    }

    void loadCompanies(query);
  }, [
    autoLoad,
    documentId,
    query?.page,
    query?.pageSize,
    query?.sort,
    loadCompany,
    loadCompanies,
  ]);

  return {
    company,
    companies,
    loading,
    saving,
    error,
    loadCompany,
    loadCompanies,
    createCompany,
    updateCompany,
    uploadCompanyLogo,
    deleteCompany,
    refresh: documentId
      ? () => loadCompany(documentId)
      : () => loadCompanies(query),
  };
}