import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useAuth } from "@/context/auth-context";
import { Colors } from "@/constants/colors";

export default function ProfileScreen() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Nama tidak boleh kosong");
      return;
    }

    setIsLoading(true);
    try {
      // Update user in storage
      const usersData = await SecureStore.getItemAsync("users");
      const users = usersData ? JSON.parse(usersData) : [];
      
      const userIndex = users.findIndex((u: { email: string }) => u.email === user?.email);
      if (userIndex >= 0) {
        users[userIndex].name = name;
        await SecureStore.setItemAsync("users", JSON.stringify(users));
      }

      // Update current user
      const updatedUser = { ...user, name };
      await SecureStore.setItemAsync("user", JSON.stringify(updatedUser));

      Alert.alert("Berhasil", "Profil berhasil diperbarui", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("Error", "Gagal menyimpan profil");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profil</Text>
        <TouchableOpacity onPress={handleSave} disabled={isLoading}>
          <Text style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}>
            {isLoading ? "..." : "Simpan"}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {name.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Ubah Foto</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Masukkan nama"
              placeholderTextColor={Colors.textMuted}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user?.email}
              editable={false}
            />
            <Text style={styles.hint}>Email tidak dapat diubah</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: Colors.text },
  saveButton: { fontSize: 16, color: Colors.primary, fontWeight: "600" },
  saveButtonDisabled: { opacity: 0.5 },
  content: { flex: 1 },
  avatarSection: { alignItems: "center", paddingVertical: 24 },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { fontSize: 40, fontWeight: "bold", color: "#000" },
  changePhotoButton: { marginTop: 12 },
  changePhotoText: { color: Colors.primary, fontSize: 14, fontWeight: "600" },
  form: { paddingHorizontal: 16 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, color: Colors.textSecondary, marginBottom: 8 },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
  },
  inputDisabled: { opacity: 0.6 },
  hint: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
});
