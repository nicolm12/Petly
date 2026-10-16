import { Platform } from 'react-native';

export const uid = () => `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

export const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
};

export const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString();

export const fmtDuration = (s: number) => {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m} min ${sec} s` : `${sec} s`;
};

// Cada sistema abre su app de mapas de forma distinta
export const mapsUrl = (lat: number, lng: number, label: string) =>
  Platform.select({
    ios: `maps:0,0?q=${encodeURIComponent(label)}@${lat},${lng}`,
    android: `geo:${lat},${lng}?q=${lat},${lng}(${encodeURIComponent(label)})`,
    default: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
  })!;