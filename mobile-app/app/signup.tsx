import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@/context/auth-context";
import { Colors } from "@/constants/colors";
import { API_ENDPOINTS } from "@/constants/api";

type Step = "email" | "verify" | "details";

export default function SignupScreen() {
  const { signup, loginWithGoogle } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  const showMessage = (type: "error" | "success", text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 5000);
  };

  const handleSendCode = async () => {
    if (!email) {
      showMessage("error", "Masukkan email terlebih dahulu");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.sendCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("success", "Kode verifikasi telah dikirim ke email Anda");
        setStep("verify");
      } else {
        showMessage("error", data.error || "Gagal mengirim kode verifikasi");
      }
    } catch {
      showMessage("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      showMessage("error", "Masukkan kode verifikasi 6 digit");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.verifyCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        showMessage("success", "Email terverifikasi!");
        setStep("details");
      } else {
        showMessage("error", data.error || "Kode verifikasi salah");
      }
    } catch {
      showMessage("error", "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !password) {
      showMessage("error", "Lengkapi semua data");
      return;
    }

    if (password.length < 6) {
      showMessage("error", "Password minimal 6 karakter");
      return;
    }

    setIsLoading(true);
    const success = await signup(name, email, password);
    setIsLoading(false);

    if (success) {
      router.replace("/(tabs)");
    } else {
      showMessage("error", "Email sudah terdaftar");
    }
  };

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.auth.sendCode, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        showMessage("success", "Kode verifikasi baru telah dikirim");
      } else {
        showMessage("error", "Gagal mengirim ulang kode");
      }
    } catch {
      showMessage("error", "Terjadi kesalahan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setIsLoading(true);
    try {
      const success = await loginWithGoogle();
      if (success) {
        router.replace("/(tabs)");
      }
    } catch {
      showMessage("error", "Gagal daftar dengan Google");
    } finally {
      setIsLoading(false);
    }
  };

  const goBack = () => {
    if (step === "verify") setStep("email");
    else if (step === "details") setStep("verify");
    else router.back();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <Ionicons name="chevron-back" size={28} color={Colors.text} />
        </TouchableOpacity>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="musical-notes" size={40} color={Colors.primary} />
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>
          {step === "email" && "Daftar Gratis"}
          {step === "verify" && "Verifikasi Email"}
          {step === "details" && "Lengkapi Profil"}
        </Text>

        {/* Message */}
        {message.text ? (
          <View style={[
            styles.messageBox,
            message.type === "error" ? styles.errorBox : styles.successBox
          ]}>
            <Text style={[
              styles.messageText,
              message.type === "error" ? styles.errorText : styles.successText
            ]}>
              {message.text}
            </Text>
          </View>
        ) : null}

        {/* Step 1: Email Input */}
        {step === "email" && (
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="nama@email.com"
                placeholderTextColor={Colors.textMuted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <>
                  <Ionicons name="mail" size={20} color="#000" />
                  <Text style={styles.buttonText}>Kirim Kode Verifikasi</Text>
                </>
              )}
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>atau</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Signup */}
            <TouchableOpacity
              style={styles.googleButton}
              onPress={handleGoogleSignup}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={20} color={Colors.text} />
              <Text style={styles.googleButtonText}>Daftar dengan Google</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 2: Verification Code */}
        {step === "verify" && (
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>
              Kami telah mengirim kode 6 digit ke{"\n"}
              <Text style={styles.emailHighlight}>{email}</Text>
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Kode Verifikasi</Text>
              <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="000000"
                placeholderTextColor={Colors.textMuted}
                value={verificationCode}
                onChangeText={(text) => setVerificationCode(text.replace(/\D/g, "").slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <TouchableOpacity
              style={[styles.button, (isLoading || verificationCode.length !== 6) && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={isLoading || verificationCode.length !== 6}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Verifikasi</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={handleResendCode}
              disabled={isLoading}
            >
              <Text style={styles.resendText}>Kirim ulang kode</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Step 3: Profile Details */}
        {step === "details" && (
          <View style={styles.formContainer}>
            <Text style={styles.subtitle}>
              Email terverifikasi:{" "}
              <Text style={styles.verifiedEmail}>{email}</Text>
            </Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nama Profil</Text>
              <TextInput
                style={styles.input}
                placeholder="Masukkan nama Anda"
                placeholderTextColor={Colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Minimal 6 karakter"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={Colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text style={styles.buttonText}>Daftar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>Masuk di sini</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.terms}>
          Dengan mendaftar, kamu menyetujui Syarat & Ketentuan dan Kebijakan Privasi ALMusik.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 48,
  },
  backButton: {
    marginBottom: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 24,
  },
  subtitle: {
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  emailHighlight: {
    color: Colors.text,
    fontWeight: "600",
  },
  verifiedEmail: {
    color: Colors.primary,
    fontWeight: "600",
  },
  messageBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    borderWidth: 1,
    borderColor: "#ef4444",
  },
  successBox: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    borderWidth: 1,
    borderColor: "#22c55e",
  },
  messageText: {
    fontSize: 14,
    textAlign: "center",
  },
  errorText: {
    color: "#ef4444",
  },
  successText: {
    color: "#22c55e",
  },
  formContainer: {
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    padding: 16,
    color: Colors.text,
    fontSize: 16,
  },
  codeInput: {
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 8,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceLight,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 16,
    color: Colors.text,
    fontSize: 16,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: 50,
    padding: 16,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    color: Colors.textMuted,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 50,
    padding: 16,
    gap: 12,
  },
  googleButtonText: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
  resendButton: {
    alignItems: "center",
    marginTop: 16,
  },
  resendText: {
    color: Colors.textSecondary,
    textDecorationLine: "underline",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    color: Colors.textSecondary,
  },
  loginLink: {
    color: Colors.primary,
    fontWeight: "bold",
  },
  terms: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: "center",
    marginTop: 24,
    lineHeight: 18,
  },
});
