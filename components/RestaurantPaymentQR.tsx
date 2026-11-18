import { useCallback, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { ActivityIndicator, Image, Platform, Pressable, Text, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import Toast from 'react-native-toast-message';
import { restaurantService } from '@/services/restaurant.service';
import { mediaUrl } from '@/utils/media';

export default function RestaurantPaymentQR({ restaurantId }: { restaurantId: string }) {
  const [url, setUrl] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setUrl(null);
    setError('');
    restaurantService.findOne(restaurantId).then(({ data }) => {
      if (!active) return;
      setName(data.name);
      setUrl(mediaUrl(data.QRImage?.url));
    }).catch(() => {
      if (active) setError('No se pudo cargar el QR. Vuelve a abrir esta pantalla.');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [restaurantId]));

  async function download() {
    if (!url || saving) return;
    setSaving(true);
    let localUri: string | undefined;
    try {
      if (Platform.OS === 'web') {
        const response = await fetch(url);
        if (!response.ok) throw new Error('No se pudo descargar la imagen.');
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = objectUrl;
        anchor.download = 'QR-restaurante.' + (blob.type === 'image/png' ? 'png' : 'jpg');
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      } else {
        if (!await Sharing.isAvailableAsync()) throw new Error('Este dispositivo no permite exportar la imagen.');
        const extension = url.split('?')[0].match(/\.(png|jpe?g|webp)$/i)?.[1] || 'png';
        localUri = FileSystem.cacheDirectory + 'qr-' + Date.now() + '.' + extension;
        const result = await FileSystem.downloadAsync(url, localUri);
        if (result.status !== 200) throw new Error('No se pudo descargar el QR.');
        await Sharing.shareAsync(result.uri, { mimeType: extension === 'png' ? 'image/png' : extension === 'webp' ? 'image/webp' : 'image/jpeg', dialogTitle: 'Guardar o compartir QR' });
      }
      Toast.show({ type: 'success', text1: Platform.OS === 'web' ? 'QR descargado' : 'QR preparado para guardar o compartir' });
    } catch (error) {
      Toast.show({ type: 'error', text1: error instanceof Error ? error.message : 'No se pudo guardar el QR' });
    } finally {

      setSaving(false);
    }
  }

  return <View className="my-4 rounded-2xl bg-white p-4">
    <Text className="text-center font-bold">QR de {name || 'restaurante'}</Text>
    {loading ? <ActivityIndicator /> : url ? <>
      <Image source={{ uri: url }} resizeMode="contain" style={{ width: '100%', height: 300, backgroundColor: 'white' }} />
      <Pressable disabled={saving} onPress={() => void download()} className="rounded-xl bg-[#2F6A46] p-4">
        <Text className="text-center font-bold text-white">{saving ? 'Guardando...' : 'Descargar QR como imagen'}</Text>
      </Pressable>
      <Text className="mt-3">Verifica el destinatario y el importe en tu banco. Conserva el comprobante para que el restaurante confirme el pago.</Text>
    </> : <Text>{error || 'Este restaurante todavía no tiene un QR disponible. Elige efectivo o consulta con el restaurante.'}</Text>}
  </View>;
}
