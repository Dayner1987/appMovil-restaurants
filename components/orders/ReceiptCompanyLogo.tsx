import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Image } from 'react-native';
import { companyService } from '@/services/company.service';
import { mediaUrl } from '@/utils/media';

export default function ReceiptCompanyLogo({ size = 42 }: { size?: number }) {
  const [logo, setLogo] = useState<{ uri: string; name: string } | null>(null);
  useFocusEffect(useCallback(() => {
    let active = true;
    companyService.findAll({ page: 1, pageSize: 1 }).then(response => {
      const company = response.data[0];
      const uri = mediaUrl(company?.logoImg);
      if (active) setLogo(uri && company ? { uri, name: company.name } : null);
    }).catch(() => { if (active) setLogo(null); });
    return () => { active = false; };
  }, []));
  return logo
    ? <Image source={{ uri: logo.uri }} accessibilityLabel={logo.name} resizeMode="contain"
        style={{ width: size, height: size, borderRadius: 8, backgroundColor: 'white' }} onError={() => setLogo(null)} />
    : <Ionicons name="receipt-outline" size={size * 0.65} color="#77966E" />;
}
