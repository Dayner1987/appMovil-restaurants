// services/upload.ts
import { Platform } from 'react-native';

/** Native React Native uploads are URI descriptors; web uploads are Blob/File. */
export async function addImageToForm(form: FormData, field: string, uri: string, fileName = 'image.jpg', mimeType = 'image/jpeg', file?: File | null) {
  const name = fileName || 'image.jpg';
  const type = mimeType || 'image/jpeg';
  if (Platform.OS === 'web') {
    if (file) { form.append(field, file, name); return; }
    const response = await fetch(uri);
    if (!response.ok) throw new Error('No se pudo preparar la imagen para subir.');
    const blob = await response.blob();
    form.append(field, blob, name);
  } else {
    form.append(field, { uri, name, type } as unknown as Blob);
  }
}
