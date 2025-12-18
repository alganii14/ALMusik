import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAuth } from "@/context/auth-context";
import { usePlayer } from "@/context/player-context";
import { Colors } from "@/constants/colors";
import { API_ENDPOINTS, API_BASE_URL } from "@/constants/api";

interface Song {
  id: string;
  title: string;
  artist: string;
  thumbnail: string;
  cover?: string;
  audioUrl?: string;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { playTrack } = usePlayer();
  const [songs, setSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      console.log("Fetching songs from:", API_ENDPOINTS.music);
      const response = await fetch(API_ENDPOINTS.music);
      const data = await response.json();
      
      console.log("API Response:", JSON.stringify(data).substring(0, 200));
      
      // Convert relative URLs to absolute URLs
      const songsWithFullUrls = (data.songs || []).map((song: any) => {
        const cover = song.cover || song.thumbnail || "";
        const audio = song.audioUrl || "";
        
        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          thumbnail: cover.startsWith("http") ? cover : `${API_BASE_URL}${cover}`,
          audioUrl: audio.startsWith("http") ? audio : `${API_BASE_URL}${audio}`,
        };
      });
      
      console.log("Processed songs:", songsWithFullUrls.length);
      if (songsWithFullUrls.length > 0) {
        console.log("First song:", JSON.stringify(songsWithFullUrls[0]));
      }
      
      setSongs(songsWithFullUrls);
    } catch (error) {
      console.error("Error fetching songs:", error);
      // Demo data jika API tidak tersedia
      setSongs([
        { id: "1", title: "Demo Song 1", artist: "Artist 1", thumbnail: "https://via.placeholder.com/150" },
        { id: "2", title: "Demo Song 2", artist: "Artist 2", thumbnail: "https://via.placeholder.com/150" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 18) return "Selamat Siang";
    return "Selamat Malam";
  };

  const handlePlaySong = (song: Song) => {
    playTrack({
      id: song.id,
      title: song.title,
      artist: song.artist,
      thumbnail: song.thumbnail,
      audioUrl: song.audioUrl,
    });
  };

  const renderSongCard = ({ item }: { item: Song }) => (
    <TouchableOpacity style={styles.songCard} onPress={() => handlePlaySong(item)}>
      <Image source={{ uri: item.thumbnail }} style={styles.songImage} />
      <Text style={styles.songTitle} numberOfLines={1}>{item.title}</Text>
      <Text style={styles.songArtist} numberOfLines={1}>{item.artist}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.name || "User"}</Text>
        </View>
        <View style={styles.headerIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.push("/settings")}>
            <Ionicons name="settings-outline" size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Trending Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Trending Sekarang</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>Lihat Semua</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginVertical: 40 }} />
          ) : (
            <FlatList
              data={songs.slice(0, 10)}
              renderItem={renderSongCard}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.songList}
            />
          )}
        </View>

        {/* Quick Picks */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pilihan Untukmu</Text>
          {songs.slice(0, 5).map((song) => (
            <TouchableOpacity
              key={song.id}
              style={styles.listItem}
              onPress={() => handlePlaySong(song)}
            >
              <Image source={{ uri: song.thumbnail }} style={styles.listImage} />
              <View style={styles.listInfo}>
                <Text style={styles.listTitle} numberOfLines={1}>{song.title}</Text>
                <Text style={styles.listArtist} numberOfLines={1}>{song.artist}</Text>
              </View>
              <TouchableOpacity>
                <Ionicons name="ellipsis-vertical" size={20} color={Colors.textMuted} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ height: 100 }} />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  greeting: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  userName: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: "bold",
  },
  headerIcons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 8,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 20,
    fontWeight: "bold",
  },
  seeAll: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  songList: {
    gap: 12,
  },
  songCard: {
    width: 150,
    marginRight: 12,
  },
  songImage: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: Colors.surface,
  },
  songTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
  },
  songArtist: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    gap: 12,
  },
  listImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
    backgroundColor: Colors.surface,
  },
  listInfo: {
    flex: 1,
  },
  listTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  listArtist: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
});
