import { View, Text, Image, TextInput, Pressable, StyleSheet, Platform, ScrollView, KeyboardAvoidingView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../PetContext';
import { colors, cardShadow } from '../theme';
import { fmtDate, fmtDuration, isToday } from '../utils';

const kinds = ['Perro', 'Gato', 'Otro'];

export default function HomeScreen() {
  const { pet, setPet, photos, visits, walks } = usePet();

  const todaySecs = walks.filter((w) => isToday(w.date)).reduce((a, w) => a + w.seconds, 0);

  const stats = [
    { icon: 'images', label: 'Fotos', value: String(photos.length) },
    { icon: 'medkit', label: 'Visitas', value: String(visits.length) },
    { icon: 'walk', label: 'Paseo hoy', value: todaySecs ? fmtDuration(todaySecs) : '0 s' },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={{ padding: 16, gap: 14 }} keyboardShouldPersistTaps="handled">
        <View style={[styles.card, { alignItems: 'center', gap: 6 }]}>
          {photos[0] ? (
            <Image source={{ uri: photos[0].uri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarEmpty]}>
              <Ionicons name="paw" size={56} color={colors.primary} />
            </View>
          )}
          <Text style={styles.name}>{pet.name || 'Tu peludito'}</Text>
          <Text style={styles.muted}>{pet.kind}</Text>
        </View>

        <View style={styles.statsRow}>
          {stats.map((s) => (
            <View key={s.label} style={[styles.card, styles.stat]}>
              <Ionicons name={s.icon as any} size={22} color={colors.primary} />
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.muted}>{s.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nombre</Text>
          <TextInput
            style={styles.input}
            value={pet.name}
            onChangeText={(name) => setPet({ ...pet, name })}
            placeholder="Ej: Luna"
            placeholderTextColor={colors.muted}
          />
          <Text style={[styles.label, { marginTop: 12 }]}>Especie</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {kinds.map((k) => (
              <Pressable key={k} onPress={() => setPet({ ...pet, kind: k })}
                style={[styles.chip, pet.kind === k && styles.chipActive]}>
                <Text style={[styles.chipText, pet.kind === k && { color: '#fff' }]}>{k}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {visits[0] && (
          <View style={styles.card}>
            <Text style={styles.label}>Última visita al veterinario</Text>
            <Text style={styles.strong}>{visits[0].reason}</Text>
            <Text style={styles.muted}>{visits[0].place} · {fmtDate(visits[0].date)}</Text>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 16, ...cardShadow },
  avatar: { width: 150, height: 150, borderRadius: 75 },
  avatarEmpty: { backgroundColor: colors.soft, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 10 },
  stat: { flex: 1, alignItems: 'center', gap: 2, paddingVertical: 14 },
  statValue: { fontSize: 18, fontWeight: '800', color: colors.text },
  label: { color: colors.muted, marginBottom: 6, fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 10, padding: 12, color: colors.text },
  chip: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: colors.soft },
  chipActive: { backgroundColor: colors.primary },
  chipText: { color: colors.primary, fontWeight: '700' },
  strong: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted },
  os: { textAlign: 'center', color: colors.muted, fontSize: 12 },
});