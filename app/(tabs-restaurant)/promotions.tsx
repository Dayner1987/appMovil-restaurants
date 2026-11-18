// app/(tabs-restaurant)/promotions.tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import DashboardNavbar from '@/components/DashboardNavbar';
import { PromotionTile, FetchStatus } from '@/components/client/CatalogUI';
import { useAuth } from '@/hooks/useAuth';
import { useRestaurant } from '@/hooks/useRestaurant';
import { errorText } from '@/hooks/useCatalog';
import { promotionService } from '@/services/promotion.service';
import { productService } from '@/services/products.service';
import type { Promotion } from '@/types/promotion.types';
import type { Product } from '@/types/product.types';

export default function RestaurantPromotionsScreen() {
  const {user} = useAuth();
  const {restaurant,refresh:refreshRestaurant} = useRestaurant({autoLoad:Boolean(user?.id),query:{page:1,pageSize:1,userId:user?.id}});
  const [promotions,setPromotions] = useState<Promotion[]>([]);
  const [products,setProducts] = useState<Product[]>([]);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);
  const [error,setError] = useState<string|null>(null);
  const [open,setOpen] = useState(false);
  const [editing,setEditing] = useState<Promotion|null>(null);
  const [name,setName] = useState('');const [description,setDescription] = useState('');const [type,setType] = useState<'PERCENTAGE'|'FIXED_AMOUNT'>('PERCENTAGE');
  const [value,setValue] = useState('10');const [selected,setSelected] = useState<string[]>([]);
  const [confirm,setConfirm] = useState<Promotion|null>(null);
  const load=useCallback(async()=>{
    if(!restaurant){setLoading(false);return;}
    setLoading(true);
    try {
      const query = { restaurantDocumentId: restaurant.documentId, pageSize: 100 };
      const [published, drafts, productResult] = await Promise.allSettled([
        promotionService.findAll({ ...query, status: 'published' }),
        promotionService.findAll({ ...query, status: 'draft' }),
        productService.findAll({ restaurantDocumentId: restaurant.documentId, pageSize: 100 }),
      ]);
      if (published.status === 'rejected') throw published.reason;
      const combined = new Map<string, Promotion>();
      if (drafts.status === 'fulfilled') {
        drafts.value.data.forEach(item => combined.set(item.documentId, item));
      }
      published.value.data.forEach(item => combined.set(item.documentId, item));
      setPromotions(Array.from(combined.values()));
      if (productResult.status === 'fulfilled') setProducts(productResult.value.data);
      else {
        setProducts([]);
        Toast.show({ type: 'error', text1: 'No se pudieron cargar los productos', text2: errorText(productResult.reason) });
      }
      setError(null);
    } catch (e) {
      setError(errorText(e));
    } finally {
      setLoading(false);
    }
  },[restaurant?.documentId,restaurant?.id]);
  useFocusEffect(useCallback(()=>{void refreshRestaurant();},[refreshRestaurant]));
  useFocusEffect(useCallback(()=>{void load();},[load]));
  const openForm=(item:Promotion|null)=>{setEditing(item);setName(item?.name || '');setDescription(item?.description || '');setType(item?.type==='FIXED_AMOUNT'?'FIXED_AMOUNT':'PERCENTAGE');setValue(String(item?.type==='FIXED_AMOUNT'?item?.discountAmount??'':item?.percentage??10));setSelected((item?.products || []).map(x=>x.documentId || String(x.id)));setOpen(true);};
  const save=async()=>{if(!restaurant||!name.trim()||saving)return;const amount=Number(value);if(!Number.isFinite(amount)||amount<=0||(type==='PERCENTAGE'&&amount>100)){Toast.show({type:'error',text1:'Descuento inválido'});return;}
    setSaving(true);try{const data={name:name.trim(),description:description.trim(),restaurant:restaurant.documentId,type,percentage:type==='PERCENTAGE'?amount:0,discountAmount:type==='FIXED_AMOUNT'?amount:0,products:selected};if(editing)await promotionService.update(editing.documentId,data);else await promotionService.create(data);setOpen(false);Toast.show({type:'success',text1:'Promoción guardada'});await load();}catch(e){Toast.show({type:'error',text1:'No se pudo guardar',text2:errorText(e)});}finally{setSaving(false);}
  };
  const del=async()=>{if(!confirm)return;setSaving(true);try{await promotionService.remove(confirm.documentId);setConfirm(null);Toast.show({type:'success',text1:'Promoción eliminada'});await load();}catch(e){Toast.show({type:'error',text1:errorText(e)});}finally{setSaving(false);}};
  const activate=async(promotion:Promotion)=>{setSaving(true);try{await promotionService.update(promotion.documentId,{name:promotion.name,description:promotion.description,type:promotion.type,percentage:promotion.percentage,discountAmount:promotion.discountAmount,buyQuantity:promotion.buyQuantity,payQuantity:promotion.payQuantity,startAt:promotion.startAt,endAt:promotion.endAt,restaurant:restaurant?.documentId,products:(promotion.products||[]).map(item=>item.documentId||String(item.id))});Toast.show({type:'success',text1:'Promoción publicada',text2:'Ya puede aplicarse en las nuevas órdenes.'});await load();}catch(e){Toast.show({type:'error',text1:'No se pudo publicar',text2:errorText(e)});}finally{setSaving(false);}};
  return <View className="flex-1 bg-[#F7F8F2]"><DashboardNavbar title="Promociones" /><ScrollView refreshControl={<RefreshControl refreshing={false} onRefresh={()=>void load()} />} contentContainerStyle={{padding:20,paddingBottom:40}}>
    <View className="mb-4"><Text className="text-2xl font-extrabold text-[#262D20]">Promociones</Text><Text className="mt-1 text-sm text-[#777E72]">Ofertas del restaurante administradas desde Strapi.</Text></View>
    {!restaurant ? <FetchStatus loading={loading} error={error} empty="No se encontró un restaurante asociado a tu cuenta." /> : <><Pressable onPress={()=>openForm(null)} className="mb-4 flex-row items-center justify-center rounded-2xl bg-[#698A3D] p-4"><Ionicons name="add-circle-outline" size={20} color="white" /><Text className="ml-2 font-extrabold text-white">Crear promoción</Text></Pressable>
      {open ? <View className="mb-4 rounded-3xl bg-white p-5"><Text className="mb-3 text-lg font-extrabold text-[#282E23]">{editing?'Editar':'Nueva'} promoción</Text>
        <TextInput value={name} onChangeText={setName} placeholder="Nombre de la promoción" placeholderTextColor="#9A9E95" className="mb-3 rounded-2xl bg-[#F4F5EF] p-4 text-[#2A3023]" />
        <TextInput multiline value={description} onChangeText={setDescription} placeholder="Descripción" placeholderTextColor="#9A9E95" className="mb-3 min-h-20 rounded-2xl bg-[#F4F5EF] p-4 text-[#2A3023]" />
        <View className="mb-3 flex-row gap-2"><Pressable onPress={()=>setType('PERCENTAGE')} className={`flex-1 rounded-xl p-3 ${type==='PERCENTAGE'?'bg-[#698A3D]':'bg-[#F1F4EC]'}`}><Text className={type==='PERCENTAGE'?'text-center font-bold text-white':'text-center font-bold text-[#648246]'}>Porcentaje</Text></Pressable><Pressable onPress={()=>setType('FIXED_AMOUNT')} className={`flex-1 rounded-xl p-3 ${type==='FIXED_AMOUNT'?'bg-[#698A3D]':'bg-[#F1F4EC]'}`}><Text className={type==='FIXED_AMOUNT'?'text-center font-bold text-white':'text-center font-bold text-[#648246]'}>Monto fijo</Text></Pressable></View>
        <TextInput keyboardType="decimal-pad" value={value} onChangeText={setValue} placeholder={type==='PERCENTAGE'?'Porcentaje':'Bs de descuento'} className="mb-3 rounded-2xl bg-[#F4F5EF] p-4 text-[#2A3023]" />
        <Text className="mb-2 font-semibold text-[#525B48]">Seleccionar productos</Text>{products.map(p=><Pressable key={p.documentId} onPress={()=>setSelected(old=>old.includes(p.documentId)?old.filter(id=>id!==p.documentId):[...old,p.documentId])} className="mb-2 flex-row items-center"><Ionicons name={selected.includes(p.documentId)?'checkbox':'square-outline'} size={22} color="#698A3D" /><Text className="ml-2 text-[#596154]">{p.name}</Text></Pressable>)}
        <View className="mt-4 flex-row gap-2"><Pressable onPress={()=>setOpen(false)} className="flex-1 items-center rounded-xl border border-[#CBD4C0] p-3"><Text className="font-semibold">Cancelar</Text></Pressable><Pressable disabled={saving} onPress={()=>void save()} className="flex-1 items-center rounded-xl bg-[#698A3D] p-3">{saving?<ActivityIndicator color="white"/>:<Text className="font-bold text-white">Guardar</Text>}</Pressable></View>
      </View> : null}
      {promotions.map(p=><View key={p.documentId} className="mb-3"><PromotionTile promotion={p} /><View className="-mt-3 mb-2 flex-row gap-2 rounded-b-2xl bg-white px-4 pb-3">{!p.publishedAt?<Pressable disabled={saving} onPress={()=>void activate(p)} className="flex-1 items-center rounded-xl bg-[#E4F2E5] p-3"><Text className="font-bold text-[#2F6A46]">Publicar</Text></Pressable>:null}<Pressable onPress={()=>openForm(p)} className="flex-1 items-center rounded-xl bg-[#ECF4E6] p-3"><Text className="font-bold text-[#698A3D]">Editar</Text></Pressable><Pressable onPress={()=>setConfirm(p)} className="flex-1 items-center rounded-xl bg-[#FFF0F0] p-3"><Text className="font-bold text-[#BD5353]">Eliminar</Text></Pressable></View></View>)}
      {loading||error?<FetchStatus loading={loading} error={error} retry={()=>void load()} />:!promotions.length?<FetchStatus loading={false} empty="No hay promociones registradas." />:null}
      {confirm?<View className="mt-4 rounded-3xl bg-[#FFF0F0] p-5"><Text className="font-bold text-[#9D4D4D]">¿Eliminar «{confirm.name}»?</Text><View className="mt-4 flex-row gap-2"><Pressable onPress={()=>setConfirm(null)} className="flex-1 items-center rounded-xl bg-white p-3"><Text>Cancelar</Text></Pressable><Pressable onPress={()=>void del()} className="flex-1 items-center rounded-xl bg-[#C74A4A] p-3"><Text className="font-bold text-white">Eliminar</Text></Pressable></View></View>:null}
    </>}
  </ScrollView></View>;
}
