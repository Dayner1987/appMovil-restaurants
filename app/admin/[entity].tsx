// app/admin/[entity].tsx
import Ionicons from '@expo/vector-icons/Ionicons';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import Toast from 'react-native-toast-message';
import { useAuth } from '@/hooks/useAuth';
import { errorText } from '@/hooks/useCatalog';
import { mediaUrl } from '@/utils/media';
import { PageHeading, FetchStatus, money } from '@/components/client/CatalogUI';
import { publicationService } from '@/services/publication.service';
import { promotionService } from '@/services/promotion.service';
import { restaurantService } from '@/services/restaurant.service';
import { productService } from '@/services/products.service';
import { categoryService } from '@/services/category.service';
import { orderService } from '@/services/order.service';
import { paymentService } from '@/services/payment.service';
import { restaurantApplicationService } from '@/services/restaurant-application.service';
import type { Restaurant } from '@/types/restaurant.types';
import type { Product } from '@/types/product.types';
import type { PublicationImageUpload } from '@/types/publication.types';
import { statusLabel } from '@/utils/status-labels';

const titles: Record<string,string> = { publications:'Publicaciones', promotions:'Promociones', restaurants:'Restaurantes', products:'Productos', categories:'Categorías', orders:'Pedidos', payments:'Pagos', applications:'Solicitudes' };
type RecordItem = {id: number; documentId: string; [key:string]: any};
type FormMode = 'new' | 'edit' | null;
function Field({label,value,onChange,multiline = false,placeholder}: {label:string;value:string;onChange:(v:string)=>void;multiline?:boolean;placeholder?:string}) {
  return <View className="mb-3"><Text className="mb-1 text-sm font-semibold text-[#536A2F]">{label}</Text><TextInput value={value} onChangeText={onChange} multiline={multiline} placeholder={placeholder || label} placeholderTextColor="#929F7F" className="rounded-2xl bg-[#FAFBF7] px-4 py-3 text-[#252A20]" style={multiline ? {minHeight:86,textAlignVertical:'top'}:undefined} /></View>;
}
export default function AdminManagementScreen() {
  const {entity: raw} = useLocalSearchParams<{entity:string}>(); const entity = String(raw || '');
  const {user} = useAuth();
  const role = String(user?.role?.type || user?.role?.name || '').toLowerCase();
  const [items,setItems] = useState<RecordItem[]>([]); const [restaurants,setRestaurants] = useState<Restaurant[]>([]); const [products,setProducts] = useState<Product[]>([]);
  const [loading,setLoading] = useState(true);const [saving,setSaving]=useState(false);const [error,setError]=useState<string|null>(null);
  const [search,setSearch]=useState(''); const [mode,setMode]=useState<FormMode>(null);const [editing,setEditing]=useState<RecordItem|null>(null);
  const [name,setName]=useState('');const [description,setDescription]=useState('');const [restaurantId,setRestaurantId]=useState('');
  const [featured,setFeatured]=useState(false);const [percentage,setPercentage]=useState('10');const [amount,setAmount]=useState('');
  const [type,setType]=useState('PERCENTAGE');const [selectedProducts,setSelectedProducts]=useState<number[]>([]);
  const [selectedImage,setSelectedImage]=useState<PublicationImageUpload|null>(null);
  const [deleteTarget,setDeleteTarget]=useState<RecordItem|null>(null);
  const canEdit = ['publications','promotions','categories'].includes(entity);
  const load=useCallback(async()=>{
    if(role !== 'admin') {setLoading(false);return;}
    setLoading(true);
    try {
      let response: {data: any[]} | null = null;
      switch(entity){
        case 'publications': response=await publicationService.findAll({pageSize:100}); break;
        case 'promotions': response=await promotionService.findAll({pageSize:100}); break;
        case 'restaurants': response=await restaurantService.findAll({pageSize:100}); break;
        case 'products': response=await productService.findAll({pageSize:100}); break;
        case 'categories': response=await categoryService.findAll({pageSize:100}); break;
        case 'orders': response=await orderService.findAll({pageSize:100}); break;
        case 'payments': response=await paymentService.findAll({pageSize:100}); break;
        case 'applications': response=await restaurantApplicationService.findAll({pageSize:100}); break;
        default: throw new Error('No existe este módulo.');
      }
      setItems((response?.data || []) as RecordItem[]);setError(null);
      if(['publications','promotions'].includes(entity)){
        const [r,p]=await Promise.all([restaurantService.findAll({pageSize:100}),productService.findAll({pageSize:100})]);
        setRestaurants(r.data);setProducts(p.data);
      }
    }catch(e){setError(errorText(e));}finally{setLoading(false);}
  },[entity,role]);
  useFocusEffect(useCallback(()=>{void load();},[load]));
  const filtered = useMemo(()=>items.filter(x=>JSON.stringify([x.name,x.title,x.orderCode,x.proposedRestaurantName,x.description,x.statusRes,x.statusOrder,x.status]).toLowerCase().includes(search.trim().toLowerCase())),[items,search]);
  function openForm(x: RecordItem | null){setEditing(x);setMode(x?'edit':'new');setName(String(x?.name || x?.title || ''));setDescription(String(x?.description || ''));setRestaurantId(x?.restaurant?.documentId || '');setFeatured(Boolean(x?.featured));setType(x?.type || 'PERCENTAGE');setPercentage(String(x?.percentage ?? 10));setAmount(String(x?.discountAmount ?? ''));setSelectedProducts((x?.products || []).map((p:RecordItem)=>p.id));setSelectedImage(null);}
  async function pickImage(){const request=await ImagePicker.requestMediaLibraryPermissionsAsync();if(!request.granted){Toast.show({type:'error',text1:'Permite acceder a tus fotos'});return;}const result=await ImagePicker.launchImageLibraryAsync({mediaTypes:['images'],quality:0.8,allowsEditing:true});if(!result.canceled){const img=result.assets[0];setSelectedImage({uri:img.uri,fileName:img.fileName || 'publicacion.jpg',mimeType:img.mimeType || 'image/jpeg', file:(img as any).file || null});}}
  async function save(){if(saving)return; if(!name.trim()){Toast.show({type:'error',text1:'Completa el nombre o título'});return;}if(['publications','promotions'].includes(entity) && !restaurantId){Toast.show({type:'error',text1:'Selecciona el restaurante'});return;}setSaving(true);
    try{
      if(entity==='publications'){
        const data={title:name.trim(),description:description.trim(),featured,restaurant:restaurantId};
        const response=editing?await publicationService.patch(editing.documentId,data):await publicationService.create(data);
        if(selectedImage){const documentId=editing?.documentId || response.data.documentId; if(editing?.image) await publicationService.updateImage(documentId,selectedImage);else await publicationService.createImage(documentId,selectedImage);}
      }else if(entity==='promotions'){
        const data={name:name.trim(),description:description.trim(),restaurant:restaurantId,type,percentage:type==='PERCENTAGE'?Number(percentage):0,discountAmount:type==='FIXED_AMOUNT'?Number(amount):0,products:selectedProducts};
        if(type==='PERCENTAGE' && !(Number(percentage)>0 && Number(percentage)<=100)) throw new Error('El porcentaje debe estar entre 1 y 100.');
        if(type==='FIXED_AMOUNT' && !(Number(amount)>0)) throw new Error('Introduce un descuento válido.');
        if(type==='TWO_FOR_ONE') throw new Error('Esta modalidad requiere configurar buyQuantity y payQuantity. Usa una promoción por monto o porcentaje por ahora.');
        if(editing)await promotionService.update(editing.documentId,data);else await promotionService.create(data);
      }else if(entity==='categories'){
        const data={name:name.trim(),description:description.trim(),isActive:true};
        if(editing)await categoryService.update(editing.documentId,data);else await categoryService.create(data);
      }
      Toast.show({type:'success',text1:'Cambios guardados correctamente'});setMode(null);setEditing(null);await load();
    }catch(e){Toast.show({type:'error',text1:'No se pudo guardar',text2:errorText(e)});}finally{setSaving(false);}
  }
  async function deleteItem(){if(!deleteTarget || saving)return;setSaving(true);try{if(entity==='publications')await publicationService.remove(deleteTarget.documentId);else if(entity==='promotions')await promotionService.remove(deleteTarget.documentId);else if(entity==='categories')await categoryService.remove(deleteTarget.documentId);setDeleteTarget(null);Toast.show({type:'success',text1:'Registro eliminado'});await load();}catch(e){Toast.show({type:'error',text1:errorText(e)});}finally{setSaving(false);}}
  async function changeStatus(item: RecordItem,value:string){setSaving(true);try{if(entity==='restaurants')await restaurantService.patch(item.documentId,{statusRes:value});if(entity==='orders')await orderService.patch(item.documentId,{statusOrder:value as any});Toast.show({type:'success',text1:'Estado actualizado'});await load();}catch(e){Toast.show({type:'error',text1:errorText(e)});}finally{setSaving(false);}}
  if(role!=='admin')return <View className="flex-1 items-center justify-center bg-[#F7F8F2] p-6"><Ionicons name="lock-closed-outline" size={45} color="#607B35" /><Text className="mt-3 text-center text-lg font-bold">Acceso exclusivo del administrador</Text><Pressable onPress={()=>router.replace('/(tabs)')} className="mt-4 rounded-xl bg-[#607B35] px-5 py-3"><Text className="font-bold text-white">Ir al inicio</Text></Pressable></View>;
  return <View className="flex-1 bg-[#F7F8F2]"><PageHeading title={titles[entity] || 'Gestión'} back /><ScrollView keyboardShouldPersistTaps="handled" refreshControl={<RefreshControl refreshing={false} onRefresh={()=>void load()} />} contentContainerStyle={{paddingHorizontal:20,paddingBottom:45}}>
    <TextInput className="mb-4 rounded-2xl bg-white px-4 py-4 text-[#252A20]" placeholder="Buscar en esta sección..." placeholderTextColor="#929889" value={search} onChangeText={setSearch} />
    {canEdit && mode===null ? <Pressable onPress={()=>openForm(null)} className="mb-4 flex-row items-center justify-center rounded-2xl bg-[#607B35] p-4"><Ionicons name="add-circle-outline" color="white" size={21} /><Text className="ml-2 font-extrabold text-white">Nuevo registro</Text></Pressable> : null}
    {mode ? <View className="mb-5 rounded-3xl bg-white p-5"><Text className="mb-4 text-lg font-extrabold text-[#252A20]">{mode==='new'?'Crear':'Editar'} {titles[entity]?.toLowerCase()}</Text><Field label={entity==='publications'?'Título':'Nombre'} value={name} onChange={setName}/><Field label="Descripción" value={description} onChange={setDescription} multiline />
      {['publications','promotions'].includes(entity) ? <><Text className="mb-2 font-bold text-[#252A20]">Restaurante responsable</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-4">{restaurants.map(x=><Pressable key={x.documentId} onPress={()=>setRestaurantId(x.documentId)} className={`mr-2 rounded-xl px-3 py-3 ${restaurantId===x.documentId?'bg-[#607B35]':'bg-[#EEF3E3]'}`}><Text className={restaurantId===x.documentId?'font-bold text-white':'font-bold text-[#536A2F]'}>{x.name}</Text></Pressable>)}</ScrollView></> : null}
      {entity==='publications' ? <><Pressable onPress={()=>setFeatured(x=>!x)} className="mb-3 flex-row items-center gap-2"><Ionicons name={featured?'checkbox':'square-outline'} color="#607B35" size={23}/><Text>Publicación destacada</Text></Pressable><Pressable onPress={()=>void pickImage()} className="mb-4 items-center rounded-2xl border border-[#D7E5C1] p-4"><Ionicons name="images-outline" size={24} color="#607B35"/><Text className="mt-2 font-semibold text-[#607B35]">{selectedImage?'Cambiar imagen seleccionada':'Seleccionar imagen (opcional)'}</Text>{selectedImage?<Image source={{uri:selectedImage.uri}} style={{height:100,width:100,marginTop:10,borderRadius:16}} />:null}</Pressable></> : null}
      {entity==='promotions' ? <><Text className="mb-2 font-bold text-[#252A20]">Tipo de descuento</Text><View className="mb-3 flex-row gap-2">{[{label:'Porcentaje',value:'PERCENTAGE'},{label:'Monto fijo',value:'FIXED_AMOUNT'}].map(x=><Pressable key={x.value} onPress={()=>setType(x.value)} className={`flex-1 rounded-xl p-3 ${type===x.value?'bg-[#607B35]':'bg-[#EEF3E3]'}`}><Text className={`text-center font-bold ${type===x.value?'text-white':'text-[#536A2F]'}`}>{x.label}</Text></Pressable>)}</View><Field label={type==='PERCENTAGE'?'Porcentaje (1 a 100)':'Monto en Bs'} value={type==='PERCENTAGE'?percentage:amount} onChange={type==='PERCENTAGE'?setPercentage:setAmount}/><Text className="mb-2 font-bold text-[#252A20]">Aplicar a productos (opcional)</Text>{products.filter(x=>x.restaurant?.documentId===restaurantId).map(p=><Pressable onPress={()=>setSelectedProducts(old=>old.includes(p.id)?old.filter(n=>n!==p.id):[...old,p.id])} key={p.documentId} className="mb-2 flex-row items-center gap-2"><Ionicons name={selectedProducts.includes(p.id)?'checkbox':'square-outline'} color="#607B35" size={21}/><Text className="flex-1 text-sm text-[#646A5E]">{p.name}</Text></Pressable>)}</>:null}
      <View className="mt-4 flex-row gap-2"><Pressable disabled={saving} onPress={()=>setMode(null)} className="flex-1 items-center rounded-xl border border-[#DDE1D7] p-3"><Text className="font-bold text-[#646A5E]">Cancelar</Text></Pressable><Pressable disabled={saving} onPress={()=>void save()} className="flex-1 items-center rounded-xl bg-[#607B35] p-3">{saving?<ActivityIndicator color="white"/>:<Text className="font-bold text-white">Guardar</Text>}</Pressable></View></View> : null}
    {filtered.map(item=><View key={item.documentId || String(item.id)} className="mb-3 rounded-3xl bg-white p-4"><Text className="text-base font-extrabold text-[#252A20]">{item.title || item.name || item.orderCode || item.proposedRestaurantName || item.receiptNumber || `Registro #${item.id}`}</Text><Text className="mt-1 text-xs leading-5 text-[#777D71]">{item.restaurant?.name || item.description || (item.statusRes || item.statusOrder || item.statusPayment || item.status ? statusLabel(item.statusRes || item.statusOrder || item.statusPayment || item.status) : (item.total != null?money(item.total):''))}</Text>
      {entity==='restaurants' ? <View className="mt-3 flex-row flex-wrap gap-2">{['ACTIVE','INACTIVE','SUSPENDED'].map(status=><Pressable key={status} disabled={saving} onPress={()=>void changeStatus(item,status)} className={`rounded-xl px-3 py-2 ${item.statusRes===status?'bg-[#607B35]':'bg-[#EEF3E3]'}`}><Text className={item.statusRes===status?'text-xs font-bold text-white':'text-xs text-[#747A6E]'}>{statusLabel(status)}</Text></Pressable>)}</View> : null}
      {entity==='orders' ? <View className="mt-3 flex-row flex-wrap gap-2">{['PENDING','CONFIRMED','PREPARING','READY','COMPLETED','CANCELLED'].map(status=><Pressable key={status} disabled={saving} onPress={()=>void changeStatus(item,status)} className={`rounded-xl px-3 py-2 ${item.statusOrder===status?'bg-[#607B35]':'bg-[#EEF3E3]'}`}><Text className={item.statusOrder===status?'text-xs font-bold text-white':'text-xs text-[#747A6E]'}>{statusLabel(status)}</Text></Pressable>)}</View> : null}
      {entity==='products' ? <Pressable onPress={()=>router.push({pathname:'/others/EditProduct',params:{documentId:item.documentId, restaurantDocumentId:item.restaurant?.documentId || ''}})} className="mt-3 rounded-xl bg-[#EEF3E3] px-4 py-3"><Text className="text-center font-bold text-[#607B35]">Editar producto</Text></Pressable> : null}
      {entity==='applications' ? <Pressable onPress={()=>router.push({pathname:'/others/RestaurantSol',params:{documentId:item.documentId}})} className="mt-3 rounded-xl bg-[#EEF3E3] px-4 py-3"><Text className="text-center font-bold text-[#607B35]">Revisar solicitud</Text></Pressable> : null}
      {canEdit && !mode ? <View className="mt-3 flex-row gap-2"><Pressable onPress={()=>openForm(item)} className="flex-1 items-center rounded-xl bg-[#EEF3E3] p-3"><Text className="font-bold text-[#607B35]">Editar</Text></Pressable><Pressable onPress={()=>setDeleteTarget(item)} className="flex-1 items-center rounded-xl bg-[#FFF0F0] p-3"><Text className="font-bold text-[#AF4545]">Eliminar</Text></Pressable></View> : null}
    </View>)}
    {loading || error && !items.length ? <FetchStatus loading={loading} error={error} retry={()=>void load()} /> : !filtered.length && !mode ? <FetchStatus loading={false} empty="No hay registros que coincidan con la búsqueda." /> : null}
    {deleteTarget ? <View className="my-4 rounded-3xl border border-[#ECC9C9] bg-[#FFF2F2] p-5"><Text className="font-extrabold text-[#973A3A]">¿Eliminar {deleteTarget.title || deleteTarget.name}?</Text><Text className="mt-1 text-sm text-[#905E5E]">Esta acción no se puede deshacer.</Text><View className="mt-4 flex-row gap-2"><Pressable onPress={()=>setDeleteTarget(null)} className="flex-1 items-center rounded-xl bg-white p-3"><Text className="font-bold">Cancelar</Text></Pressable><Pressable disabled={saving} onPress={()=>void deleteItem()} className="flex-1 items-center rounded-xl bg-[#C44747] p-3"><Text className="font-bold text-white">Eliminar</Text></Pressable></View></View> : null}
  </ScrollView></View>;
}
