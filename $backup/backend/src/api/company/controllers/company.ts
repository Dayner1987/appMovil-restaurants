/**
 * company controller
 */

import { factories } from '@strapi/strapi';

const COMPANY_UID = 'api::company.company';

type StrapiContext = any;
type StrapiInstance = any;

async function updateCompanyLogo(
  ctx: StrapiContext,
  strapi: StrapiInstance
) {
  const { documentId } = ctx.params;

  if (!documentId) {
    return ctx.badRequest('El documentId es obligatorio');
  }

  const uploadedFile =
    ctx.request.files?.logoImg ||
    ctx.request.files?.file;

  if (!uploadedFile) {
    return ctx.badRequest(
      'Debe enviar una imagen en el campo logoImg'
    );
  }

  const file = Array.isArray(uploadedFile)
    ? uploadedFile[0]
    : uploadedFile;

  const company = await strapi.documents(COMPANY_UID).findOne({
    documentId,
    populate: {
      logoImg: true,
    },
  });

  if (!company) {
    return ctx.notFound('Company no encontrada');
  }

  const oldLogo = company.logoImg;

  await strapi.plugin('upload').service('upload').upload({
    data: {
      refId: company.id,
      ref: COMPANY_UID,
      field: 'logoImg',
    },
    files: file,
  });

  const updatedCompany = await strapi
    .documents(COMPANY_UID)
    .findOne({
      documentId,
      populate: {
        logoImg: true,
      },
    });

  if (
    oldLogo?.id &&
    updatedCompany?.logoImg?.id !== oldLogo.id
  ) {
    try {
      await strapi
        .plugin('upload')
        .service('upload')
        .remove(oldLogo.id);
    } catch (error) {
      strapi.log.warn(
        `No se pudo eliminar el logo anterior: ${error}`
      );
    }
  }

  ctx.status = 200;

  return {
    data: updatedCompany,
  };
}

export default factories.createCoreController(
  COMPANY_UID,
  ({ strapi }) => ({

    async putLogo(ctx) {
      return updateCompanyLogo(ctx, strapi);
    },

    async patchLogo(ctx) {
      return updateCompanyLogo(ctx, strapi);
    },
    

    async deleteLogo(ctx) {
      const { documentId } = ctx.params;

      if (!documentId) {
        return ctx.badRequest(
          'El documentId es obligatorio'
        );
      }

      const company = await strapi
        .documents(COMPANY_UID)
        .findOne({
          documentId,
          populate: {
            logoImg: true,
          },
        });

      if (!company) {
        return ctx.notFound('Company no encontrada');
      }

      const oldLogo = company.logoImg;

      const updatedCompany = await strapi
        .documents(COMPANY_UID)
        .update({
          documentId,
          data: {
            logoImg: null,
          },
          populate: {
            logoImg: true,
          },
        });

      if (oldLogo?.id) {
        try {
          await strapi
            .plugin('upload')
            .service('upload')
            .remove(oldLogo.id);
        } catch (error) {
          strapi.log.warn(
            `No se pudo eliminar el archivo del logo: ${error}`
          );
        }
      }

      ctx.status = 200;

      return {
        data: updatedCompany,
      };
    },
    async patchInfo(ctx) {
  const { documentId } = ctx.params;

  if (!documentId) {
    return ctx.badRequest(
      'El documentId es obligatorio'
    );
  }

  const body = ctx.request.body?.data ?? ctx.request.body;

  if (!body || Object.keys(body).length === 0) {
    return ctx.badRequest(
      'Debe enviar al menos un campo para actualizar'
    );
  }

  const allowedFields = [
    'name',
    'email',
    'number',
    'aditionalLink',
  ];

  const data: Record<string, unknown> = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      data[field] = body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return ctx.badRequest(
      'Solo puede actualizar: name, email, number o aditionalLink'
    );
  }

  const company = await strapi
    .documents(COMPANY_UID)
    .findOne({
      documentId,
    });

  if (!company) {
    return ctx.notFound('Company no encontrada');
  }

  const updatedCompany = await strapi
    .documents(COMPANY_UID)
    .update({
      documentId,
      data,
      populate: {
        logoImg: true,
      },
    });

  ctx.status = 200;

  return {
    data: updatedCompany,
  };
},

  })
  
);