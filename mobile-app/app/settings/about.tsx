import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";

export default function AboutScreen() {
  const appVersion = "1.0.0";
  const buildNumber = "1";

  const socialLinks = [
    { icon: "logo-instagram", label: "Instagram", url: "https://instagram.com/almusik" },
    { icon: "logo-twitter", label: "Twitter", url: "https://twitter.com/almusik" },
    { icon: "logo-facebook", label: "Facebook", url: "https://facebook.com/almusik" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tentang</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* App Logo & Info */}
        <View style={styles.appInfo}>
          <View style={styles.logoContainer}>
            <Ionicons name="musical-notes" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.appName}>ALMusik</Text>
          <Text style={styles.appTagline}>Jutaan lagu gratis di genggamanmu</Text>
          <Text style={styles.version}>Versi {appVersion} ({buildNumber})</Text>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.description}>
            ALMusik adalah aplikasi streaming musik gratis yang memungkinkan kamu 
            mendengarkan jutaan lagu dari berbagai genre dan artis favorit. 
            Nikmati musik tanpa batas, kapan saja dan di mana saja.
          </Text>
        </View>

        {/* Features */}
        <Text style={styles.sectionTitle}>Fitur Utama</Text>
        <View style={styles.section}>
          <View style={styles.featureItem}>
            <Ionicons name="musical-note" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Streaming musik berkualitas tinggi</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="download" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Download untuk offline listening</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="list" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Buat playlist sesuai mood</Text>
          </View>
          <View style={styles.featureItem}>
            <Ionicons name="text" size={20} color={Colors.primary} />
            <Text style={styles.featureText}>Lirik lagu real-time</Text>
          </View>
        </View>

        {/* Social Links */}
        <Text style={styles.sectionTitle}>Ikuti Kami</Text>
        <View style={styles.socialContainer}>
          {socialLinks.map((link) => (
            <TouchableOpacity
              key={link.label}
              style={styles.socialButton}
              onPress={() => Linking.openURL(link.url)}
            >
              <Ionicons name={link.icon as any} size={24} color={Colors.text} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Credits */}
        <View style={styles.credits}>
          <Text style={styles.creditsText}>Dibuat dengan ❤️ di Indonesia</Text>
          <Text style={styles.copyright}>© 2024 ALMusik. All rights reserved.</Text>
        </View>

        {/* Legal Links */}
        <View style={styles.legalLinks}>
          <TouchableOpacity onPress={() => Linking.openURL("https://almusik.app/terms")}>
            <Text style={styles.legalLink}>Syarat & Ketentuan</Text>
          </TouchableOpacity>
          <Text style={styles.legalDivider}>•</Text>
          <TouchableOpacity onPress={() => Linking.openURL("https://almusik.app/privacy")}>
            <Text style={styles.legalLink}>Kebijakan Privasi</Text>
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
  content: { flex: 1 },
  contentContainer: { paddingHorizontal: 16, paddingBottom: 32 },
  appInfo: { alignItems: "center", paddingVertical: 32 },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  appName: { fontSize: 28, fontWeight: "bold", color: Colors.text },
  appTagline: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  version: { fontSize: 12, color: Colors.textMuted, marginTop: 8 },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
  },
  featureText: { fontSize: 14, color: Colors.text },
  socialContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 8,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  credits: { alignItems: "center", marginTop: 32 },
  creditsText: { fontSize: 14, color: Colors.textSecondary },
  copyright: { fontSize: 12, color: Colors.textMuted, marginTop: 4 },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    gap: 8,
  },
  legalLink: { fontSize: 12, color: Colors.textMuted, textDecorationLine: "underline" },
  legalDivider: { color: Colors.textMuted },
});
