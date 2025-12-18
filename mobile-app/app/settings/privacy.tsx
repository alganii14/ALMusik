import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Colors } from "@/constants/colors";

interface PrivacySettings {
  privateProfile: boolean;
  showListeningActivity: boolean;
  shareData: boolean;
}

export default function PrivacyScreen() {
  const [settings, setSettings] = useState<PrivacySettings>({
    privateProfile: false,
    showListeningActivity: true,
    shareData: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem("privacySettings");
      if (saved) setSettings(JSON.parse(saved));
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const updateSetting = async (key: keyof PrivacySettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    await AsyncStorage.setItem("privacySettings", JSON.stringify(newSettings));
  };

  const handleClearHistory = () => {
    Alert.alert(
      "Hapus Riwayat",
      "Yakin ingin menghapus semua riwayat pemutaran?",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem("playHistory");
            Alert.alert("Berhasil", "Riwayat pemutaran telah dihapus");
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Hapus Akun",
      "Yakin ingin menghapus akun? Tindakan ini tidak dapat dibatalkan.",
      [
        { text: "Batal", style: "cancel" },
        {
          text: "Hapus Akun",
          style: "destructive",
          onPress: async () => {
            await SecureStore.deleteItemAsync("user");
            await SecureStore.deleteItemAsync("users");
            await AsyncStorage.clear();
            router.replace("/login");
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privasi</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Privacy Toggles */}
        <View style={styles.section}>
          <View style={[styles.item, styles.itemBorder]}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Profil Privat</Text>
              <Text style={styles.itemDescription}>
                Hanya kamu yang bisa melihat aktivitasmu
              </Text>
            </View>
            <Switch
              value={settings.privateProfile}
              onValueChange={(v) => updateSetting("privateProfile", v)}
              trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={[styles.item, styles.itemBorder]}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Aktivitas Mendengarkan</Text>
              <Text style={styles.itemDescription}>
                Tampilkan lagu yang sedang kamu dengarkan
              </Text>
            </View>
            <Switch
              value={settings.showListeningActivity}
              onValueChange={(v) => updateSetting("showListeningActivity", v)}
              trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>

          <View style={styles.item}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Berbagi Data</Text>
              <Text style={styles.itemDescription}>
                Bantu tingkatkan layanan dengan berbagi data anonim
              </Text>
            </View>
            <Switch
              value={settings.shareData}
              onValueChange={(v) => updateSetting("shareData", v)}
              trackColor={{ false: Colors.surfaceLight, true: Colors.primary }}
              thumbColor={Colors.text}
            />
          </View>
        </View>

        {/* Data Management */}
        <Text style={styles.sectionTitle}>Kelola Data</Text>
        <View style={styles.section}>
          <TouchableOpacity style={[styles.item, styles.itemBorder]} onPress={handleClearHistory}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Hapus Riwayat Pemutaran</Text>
              <Text style={styles.itemDescription}>
                Hapus semua riwayat lagu yang pernah diputar
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.item} onPress={handleDeleteAccount}>
            <View style={styles.itemInfo}>
              <Text style={[styles.itemTitle, { color: Colors.error }]}>Hapus Akun</Text>
              <Text style={styles.itemDescription}>
                Hapus akun dan semua data secara permanen
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
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
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  section: { backgroundColor: Colors.surface, borderRadius: 12, marginTop: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  itemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  itemInfo: { flex: 1, marginRight: 16 },
  itemTitle: { fontSize: 15, color: Colors.text, fontWeight: "500" },
  itemDescription: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
});
