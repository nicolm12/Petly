import { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator,
  Linking, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../PetContext';
import { colors, cardShadow } from '../theme';
import { fmtDate, mapsUrl } from '../utils';

export default function VetScreen() {
  const { visits, addVisit } = usePet();
  const [reason, setReason] = useState('');
  const [place, setPlace] = useState('');
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!reason.trim()) {
      Alert.alert('Falta el motivo', 'Escribe el motivo de la visita (vacuna, control, etc.).');
      return;
    }
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos tu ubicación para guardar dónde fue la visita.');
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      addVisit({
        reason: reason.trim(),
        place: place.trim() || 'Veterinaria',
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
      });
      setReason('');
      setPlace('');
    } catch {
      Alert.alert('Error', 'No se pudo obtener la ubicación. Revisa que el GPS esté activo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>Nueva visita</Text>
          <Text style={styles.label}>Motivo</Text>
          <TextInput style={styles.input} value={reason} onChangeText={setReason}
            placeholder="Ej: Vacuna anual" placeholderTextColor={colors.muted} />
          <Text style={[styles.label, { marginTop: 12 }]}>Nombre de la veterinaria (opcional)</Text>
          <TextInput style={styles.input} value={place} onChangeText={setPlace}
            placeholder="Ej: Clínica Huellitas" placeholderTextColor={colors.muted} />
          <Pressable style={styles.btn} onPress={save} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : (
              <>
                <Ionicons name="location" size={20} color="#fff" />
                <Text style={styles.btnText}>Registrar con mi ubicación</Text>
              </>
            )}
          </Pressable>
        </View>

        <Text style={styles.section}>Historial</Text>
        {visits.length === 0 && <Text style={styles.muted}>Todavía no hay visitas registradas.</Text>}
        {visits.map((v) => (
          <View key={v.id} style={[styles.card, { gap: 4 }]}>
            <Text style={styles.strong}>{v.reason}</Text>
            <Text style={styles.muted}>{v.place} · {fmtDate(v.date)}</Text>
            <Pressable style={styles.link} onPress={() => Linking.openURL(mapsUrl(v.lat, v.lng, v.place))}>
              <Ionicons name="map-outline" size={16} color={colors.primary} />
              <Text style={styles.linkText}>Ver en el mapa</Text>
            </Pressable>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, ...cardShadow },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginBottom: 10 },
  section: { fontSize: 18, fontWeight: '700', color: colors.text, marginTop: 6 },
  label: { color: colors.muted, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, color: colors.text },
  btn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, padding: 14, borderRadius: 12, marginTop: 16,
  },
  btnText: { color: '#fff', fontWeight: '700' },
  strong: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  linkText: { color: colors.primary, fontWeight: '700' },
});