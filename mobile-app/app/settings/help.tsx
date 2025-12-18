import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Colors } from "@/constants/colors";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Bagaimana cara memutar lagu?",
    answer: "Cukup ketuk lagu yang ingin kamu dengarkan dari halaman beranda atau hasil pencarian. Lagu akan langsung diputar dan muncul di mini player di bagian bawah.",
  },
  {
    question: "Apakah bisa mendengarkan offline?",
    answer: "Ya! Kamu bisa mendownload lagu untuk didengarkan secara offline. Pergi ke pengaturan Download untuk mengatur preferensi download.",
  },
  {
    question: "Bagaimana cara membuat playlist?",
    answer: "Buka tab Library, lalu ketuk tombol + untuk membuat playlist baru. Kamu bisa menambahkan lagu ke playlist dari menu lagu.",
  },
  {
    question: "Kenapa lagu tidak bisa diputar?",
    answer: "Pastikan kamu memiliki koneksi internet yang stabil. Jika masalah berlanjut, coba restart aplikasi atau periksa pengaturan kualitas audio.",
  },
  {
    question: "Bagaimana cara mengubah kualitas audio?",
    answer: "Pergi ke Pengaturan > Kualitas Audio. Kamu bisa memilih kualitas streaming dan download sesuai kebutuhan.",
  },
  {
    question: "Apakah data saya aman?",
    answer: "Ya, kami menjaga keamanan data kamu. Kamu bisa mengatur privasi di Pengaturan > Privasi untuk mengontrol data yang dibagikan.",
  },
];

export default function HelpScreen() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleContact = () => {
    Linking.openURL("mailto:support@almusik.app?subject=Bantuan ALMusik");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Bantuan</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* FAQ Section */}
        <Text style={styles.sectionTitle}>Pertanyaan Umum</Text>
        <View style={styles.section}>
          {faqItems.map((item, index) => (
            <View key={index}>
              <TouchableOpacity
                style={[styles.faqItem, index !== faqItems.length - 1 && styles.faqItemBorder]}
                onPress={() => setExpandedIndex(expandedIndex === index ? null : index)}
              >
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Ionicons
                  name={expandedIndex === index ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={Colors.textMuted}
                />
              </TouchableOpacity>
              {expandedIndex === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Contact Section */}
        <Text style={styles.sectionTitle}>Butuh Bantuan Lain?</Text>
        <View style={styles.section}>
          <TouchableOpacity style={styles.contactItem} onPress={handleContact}>
            <View style={styles.contactLeft}>
              <Ionicons name="mail" size={20} color={Colors.primary} />
              <View>
                <Text style={styles.contactTitle}>Hubungi Kami</Text>
                <Text style={styles.contactDescription}>support@almusik.app</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Quick Links */}
        <Text style={styles.sectionTitle}>Tautan Cepat</Text>
        <View style={styles.section}>
          <TouchableOpacity
            style={[styles.linkItem, styles.linkItemBorder]}
            onPress={() => Linking.openURL("https://almusik.app/terms")}
          >
            <Text style={styles.linkText}>Syarat & Ketentuan</Text>
            <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.linkItem}
            onPress={() => Linking.openURL("https://almusik.app/privacy")}
          >
            <Text style={styles.linkText}>Kebijakan Privasi</Text>
            <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
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
  content: { flex: 1, paddingHorizontal: 16, paddingBottom: 32 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: Colors.textSecondary,
    textTransform: "uppercase",
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 8,
  },
  section: { backgroundColor: Colors.surface, borderRadius: 12 },
  faqItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  faqItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  faqQuestion: { fontSize: 15, color: Colors.text, fontWeight: "500", flex: 1, marginRight: 8 },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: Colors.surfaceLight,
  },
  faqAnswerText: { fontSize: 14, color: Colors.textSecondary, lineHeight: 20 },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  contactLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  contactTitle: { fontSize: 15, color: Colors.text, fontWeight: "500" },
  contactDescription: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  linkItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  linkItemBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  linkText: { fontSize: 15, color: Colors.text },
});
