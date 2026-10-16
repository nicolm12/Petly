import { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { Accelerometer } from 'expo-sensors';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../PetContext';
import { colors, cardShadow } from '../theme';
import { fmtDate, fmtDuration, isToday } from '../utils';

const intensityColor: Record<string, string> = {
  Tranquilo: '#64748b',
  Moderado: colors.primary,
  Intenso: colors.accent,
};

const levelOf = (avg: number) => (avg < 0.05 ? 'Tranquilo' : avg < 0.2 ? 'Moderado' : 'Intenso');

export default function WalksScreen() {
  const { walks, addWalk, pet } = usePet();
  const [available, setAvailable] = useState<boolean | null>(null);
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [live, setLive] = useState('Tranquilo');
  const startRef = useRef(0);
  const sum = useRef(0);
  const count = useRef(0);
  const buffer = useRef<number[]>([]);

  useEffect(() => {
    Accelerometer.isAvailableAsync().then(setAvailable);
  }, []);

  useEffect(() => {
    if (!running) return;
    startRef.current = Date.now();
    sum.current = 0;
    count.current = 0;
    buffer.current = [];
    setElapsed(0);

    Accelerometer.setUpdateInterval(100);
    const sub = Accelerometer.addListener(({ x, y, z }) => {
      // En reposo la magnitud es ~1 g; la variación indica movimiento
      const delta = Math.abs(Math.sqrt(x * x + y * y + z * z) - 1);
      sum.current += delta;
      count.current += 1;
      buffer.current.push(delta);
      if (buffer.current.length > 10) buffer.current.shift();
      setLive(levelOf(buffer.current.reduce((a, b) => a + b, 0) / buffer.current.length));
    });
    const timer = setInterval(() => setElapsed((Date.now() - startRef.current) / 1000), 1000);

    return () => {
      sub.remove();
      clearInterval(timer);
    };
  }, [running]);

  const stop = () => {
    const seconds = Math.round((Date.now() - startRef.current) / 1000);
    const avg = count.current ? sum.current / count.current : 0;
    setRunning(false);
    if (seconds >= 3) addWalk({ seconds, intensity: levelOf(avg) });
  };

  const todaySecs = walks.filter((w) => isToday(w.date)).reduce((a, w) => a + w.seconds, 0);

  if (available === false) {
    return (
      <View style={[styles.container, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={styles.muted}>Este dispositivo no tiene acelerómetro.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={[styles.card, { alignItems: 'center', gap: 4 }]}>
        <View style={[styles.circle, { backgroundColor: running ? intensityColor[live] : colors.soft }]}>
          <Ionicons name="walk" size={52} color={running ? '#fff' : colors.primary} />
        </View>
        <Text style={styles.time}>{fmtDuration(elapsed)}</Text>
        <Text style={styles.muted}>
          {running ? `Intensidad: ${live}` : `Hoy: ${todaySecs ? fmtDuration(todaySecs) : 'sin paseos aún'}`}
        </Text>
      </View>

      <Pressable
        style={[styles.btn, running && { backgroundColor: colors.danger }]}
        onPress={() => (running ? stop() : setRunning(true))}
      >
        <Ionicons name={running ? 'stop' : 'play'} size={20} color="#fff" />
        <Text style={styles.btnText}>
          {running ? 'Terminar paseo' : `Iniciar paseo${pet.name ? ` con ${pet.name}` : ''}`}
        </Text>
      </Pressable>
      <Text style={styles.hint}>Mantén la app abierta y el celular contigo durante el paseo.</Text>

      <Text style={styles.section}>Historial</Text>
      {walks.length === 0 && <Text style={styles.muted}>Todavía no hay paseos registrados.</Text>}
      {walks.map((w) => (
        <View key={w.id} style={[styles.card, styles.row]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.strong}>{fmtDuration(w.seconds)}</Text>
            <Text style={styles.muted}>{fmtDate(w.date)}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: intensityColor[w.intensity] ?? colors.muted }]}>
            <Text style={styles.badgeText}>{w.intensity}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, ...cardShadow },
  circle: { width: 110, height: 110, borderRadius: 55, alignItems: 'center', justifyContent: 'center' },
  time: { fontSize: 32, fontWeight: '800', color: colors.text, marginTop: 6 },
  btn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, padding: 16, borderRadius: 12,
  },
  btnText: { color: '#fff', fontWeight: '800' },
  hint: { textAlign: 'center', color: colors.muted, fontSize: 12 },
  section: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 6 },
  row: { flexDirection: 'row', alignItems: 'center' },
  strong: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted },
  badge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 12 },
  badgeText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});