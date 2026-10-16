import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { File, Paths } from 'expo-file-system';
import { uid } from './utils';

export type Pet = { name: string; kind: string };
export type Photo = { id: string; uri: string; date: string };
export type Visit = { id: string; date: string; reason: string; place: string; lat: number; lng: number };
export type Walk = { id: string; date: string; seconds: number; intensity: string };
type Data = { pet: Pet; photos: Photo[]; visits: Visit[]; walks: Walk[] };

const KEY = 'peludito:v1';
const empty: Data = { pet: { name: '', kind: 'Perro' }, photos: [], visits: [], walks: [] };

type Ctx = Data & {
  setPet: (p: Pet) => void;
  addPhoto: (uri: string) => Promise<void>;
  addVisit: (v: Omit<Visit, 'id' | 'date'>) => void;
  addWalk: (w: Omit<Walk, 'id' | 'date'>) => void;
};

const PetContext = createContext<Ctx>(null as unknown as Ctx);
export const usePet = () => useContext(PetContext);

export function PetProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Data>(empty);
  const [loaded, setLoaded] = useState(false);

  // Cargar al abrir la app
  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => { if (raw) setData({ ...empty, ...JSON.parse(raw) }); })
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  // Guardar cada vez que algo cambia
  useEffect(() => {
    if (loaded) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, loaded]);

  const setPet = (pet: Pet) => setData((d) => ({ ...d, pet }));

  const addPhoto = async (uri: string) => {
    let finalUri = uri;
    try {
      // La cámara guarda en caché; la copiamos a una carpeta permanente
      const dest = new File(Paths.document, `foto_${Date.now()}.jpg`);
      new File(uri).copy(dest);
      finalUri = dest.uri;
    } catch {}
    setData((d) => ({ ...d, photos: [{ id: uid(), uri: finalUri, date: new Date().toISOString() }, ...d.photos] }));
  };

  const addVisit = (v: Omit<Visit, 'id' | 'date'>) =>
    setData((d) => ({ ...d, visits: [{ ...v, id: uid(), date: new Date().toISOString() }, ...d.visits] }));

  const addWalk = (w: Omit<Walk, 'id' | 'date'>) =>
    setData((d) => ({ ...d, walks: [{ ...w, id: uid(), date: new Date().toISOString() }, ...d.walks] }));

  if (!loaded) return null;

  return (
    <PetContext.Provider value={{ ...data, setPet, addPhoto, addVisit, addWalk }}>
      {children}
    </PetContext.Provider>
  );
}