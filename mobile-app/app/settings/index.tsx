import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { Colors } from "@/constants/colors";

export default function SettingsScreen() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert("Keluar", "Yakin ingin keluar?", [
      { text: "Batal", style: "cancel" },
      {
        text: "Keluar",
        style: "destructive",
        onPress: async () => {
          await logout();
          router.replace("/login");
        },
      },
    ]);
  };

  const settingsGroups = [
    {
      title: "Akun",
      items: [
        { icon: "person-outline", label: "Profil", route: "/settings/profile" },
        { icon: "notifications-outline", label: "Notifikasi", route: "/settings/notifications" },
        { icon: "shield-outline", label: "Privasi", route: "/settings/privacy" },
      ],
    },
    {
      title: "Preferensi",
      items: [
        { icon: "volume-high-outline", label: "Kualitas Audio", route: "/settings/audio-quality" },
        { icon: "download-outline", label: "Download", route: "/settings/downloads" },
        { icon: "moon-outline", label: "Tampilan", route: "/settings/appearance" },
      ],
    },
    {
      title: "Lainnya",
      items: [
        { icon: "help-circle-outline", label: "Bantuan", route: "/settings/help" },
        { icon: "information-circle-outline", label: "Tentang", route: "/settings/about" },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Pengaturan</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* User Info */}
        {user && (
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.userName}>{user.name}</Text>
              <Text style={styles.userEmail}>{user.email}</Text>
            </View>
          </View>
        )}

        {/* Settings Groups */}
        {settingsGroups.map((group) => (
          <View key={group.title} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.groupItems}>
              {group.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.settingItem,
                    index !== group.items.length - 1 && styles.settingItemBorder,
                  ]}
                  onPress={() => router.push(item.route as any)}
                >
                  <View style={styles.settingLeft}>
                    <Ionicons name={item.icon as any} size={20} color={Colors.textSecondary} />
                    <Text style={styles.settingLabel}>{item.label}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.logoutText}>Keluar</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={styles.version}>ALMusik v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.text,
  },
  userEmail: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  group: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginBottom: 8,
    marginLeft: 8,
  },
  groupItems: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    overflow: "hidden",
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 15,
    color: Colors.text,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 32,
    paddingVertical: 12,
  },
  logoutText: {
    fontSize: 15,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  version: {
    textAlign: "center",
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 24,
    marginBottom: 32,
  },
});
