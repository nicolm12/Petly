import { View, Text, Image, Pressable, StyleSheet, Alert, Platform, Linking, FlatList, useWindowDimensions } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { usePet } from '../PetContext';
import { colors } from '../theme';

export default function PhotosScreen() {
  const { photos, addPhoto, pet } = usePet();
  const { width } = useWindowDimensions();
  const size = (width - 32 - 16) / 3;

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert(
        'Permiso necesario',
        Platform.OS === 'ios'
          ? 'Activa la cámara en Ajustes > Peludito.'
          : 'Activa el permiso de cámara en Ajustes > Aplicaciones > Peludito.',
        [{ text: 'Cancelar' }, { text: 'Abrir ajustes', onPress: () => Linking.openSettings() }]
      );
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled) await addPhoto(res.assets[0].uri);
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7, allowsEditing: true, aspect: [1, 1] });
    if (!res.canceled) await addPhoto(res.assets[0].uri);
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <Pressable style={[styles.btn, { flex: 1 }]} onPress={takePhoto}>
          <Ionicons name="camera" size={20} color="#fff" />
          <Text style={styles.btnText}>Tomar foto</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.btnAlt, { flex: 1 }]} onPress={pickPhoto}>
          <Ionicons name="images" size={20} color={colors.primary} />
          <Text style={[styles.btnText, { color: colors.primary }]}>Galería</Text>
        </Pressable>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(p) => p.id}
        numColumns={3}
        columnWrapperStyle={{ gap: 8 }}
        contentContainerStyle={{ gap: 8, paddingBottom: 16 }}
        renderItem={({ item }) => (
          <Image source={{ uri: item.uri }} style={{ width: size, height: size, borderRadius: 12 }} />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="paw-outline" size={64} color={colors.muted} />
            <Text style={styles.muted}>
              Aún no hay fotos{pet.name ? ` de ${pet.name}` : ''}. ¡Tómale la primera!
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, padding: 16, gap: 14 },
  buttons: { flexDirection: 'row', gap: 12 },
  btn: {
    flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.primary, padding: 14, borderRadius: 12,
    borderWidth: 2, borderColor: colors.primary,
  },
  btnAlt: { backgroundColor: '#fff' },
  btnText: { color: '#fff', fontWeight: '700' },
  empty: { alignItems: 'center', gap: 8, marginTop: 60 },
  muted: { color: colors.muted, textAlign: 'center' },
});