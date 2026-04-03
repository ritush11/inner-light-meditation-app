import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ImageBackground,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../firebase/firebaseConfig';

// ── Palette ───────────────────────────────────────────────────
const C = {
  bg:      '#0d1117',
  card:    '#161b27',
  border:  'rgba(255,255,255,0.07)',
  white:   '#FFFFFF',
  muted:   'rgba(255,255,255,0.5)',
  dim:     'rgba(255,255,255,0.25)',
  accent:  '#2DD4BF',
};

// ── Real Unsplash photos per category ────────────────────────
// Format: https://images.unsplash.com/photo-{ID}?w=400&q=75&fit=crop
const CAT_PHOTOS = {
  focus:       'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400&q=75&fit=crop',
  sleep:       'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=75&fit=crop',
  mindfulness: 'https://images.unsplash.com/photo-1499728603263-13726abce5fd?w=400&q=75&fit=crop',
  morning:     'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400&q=75&fit=crop',
  anxiety:     'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&q=75&fit=crop',
  stress:      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75&fit=crop',
  breathing:   'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=75&fit=crop',
  relaxation:  'https://images.unsplash.com/photo-1439853949212-36a7ee5c01d9?w=400&q=75&fit=crop',
  evening:     'https://images.unsplash.com/photo-1472220638119-45f5a02b5879?w=400&q=75&fit=crop',
  sounds:      'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&q=75&fit=crop',
  emotional:   'https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=400&q=75&fit=crop',
  general:     'https://images.unsplash.com/photo-1508672019048-805c876b67e2?w=400&q=75&fit=crop',
};

// ── Soundscape photos ─────────────────────────────────────────
const SOUNDSCAPES = [
  {
    id: 'sc_rain',
    title: 'Rainfall',
    description: 'Gentle rain on leaves',
    duration: 30,
    category: 'sounds',
    type: 'soundscape',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/13/audio_257112ce94.mp3',
    photo: 'https://images.unsplash.com/photo-1534274988757-a28bf1a57c17?w=400&q=75&fit=crop',
  },
  {
    id: 'sc_birds',
    title: 'Birds Chirping',
    description: 'Morning forest birdsong',
    duration: 20,
    category: 'sounds',
    type: 'soundscape',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_6b8a1a702a.mp3',
    photo: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400&q=75&fit=crop',
  },
  {
    id: 'sc_jungle',
    title: 'Jungle',
    description: 'Tropical forest ambience',
    duration: 45,
    category: 'sounds',
    type: 'soundscape',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/10/audio_8892db8ca2.mp3',
    photo: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400&q=75&fit=crop',
  },
  {
    id: 'sc_ocean',
    title: 'Ocean Waves',
    description: 'Calm shore at dusk',
    duration: 30,
    category: 'sounds',
    type: 'soundscape',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0c6ff1bbd.mp3',
    photo: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400&q=75&fit=crop',
  },
  {
    id: 'sc_fire',
    title: 'Fireplace',
    description: 'Warm crackling fire',
    duration: 60,
    category: 'sounds',
    type: 'soundscape',
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3',
    photo: 'https://images.unsplash.com/photo-1515283850704-f3dc3ccbbf93?w=400&q=75&fit=crop',
  },
];

const cap = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '';
const fallbackPhoto = CAT_PHOTOS.general;

// ── Category Card — photo background ─────────────────────────
const CategoryCard = ({ cat, count, onPress }) => {
  const key   = cat.toLowerCase();
  const photo = CAT_PHOTOS[key] ?? fallbackPhoto;
  return (
    <TouchableOpacity style={styles.catCard} onPress={onPress} activeOpacity={0.88}>
      <ImageBackground source={{ uri: photo }} style={StyleSheet.absoluteFillObject} resizeMode="cover">
        {/* Dark gradient overlay for text readability */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.72)']}
          start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFillObject}
        />
      </ImageBackground>
      <View style={styles.catTextWrap}>
        <Text style={styles.catName}>{cat}</Text>
        <Text style={styles.catCount}>{count} sessions</Text>
      </View>
    </TouchableOpacity>
  );
};

// ── Soundscape Card — photo background ───────────────────────
const SoundscapeCard = ({ sc, onPress }) => (
  <TouchableOpacity style={styles.scCard} onPress={() => onPress(sc)} activeOpacity={0.88}>
    <ImageBackground source={{ uri: sc.photo }} style={StyleSheet.absoluteFillObject} resizeMode="cover">
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.75)']}
        start={{ x: 0, y: 0.3 }} end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />
    </ImageBackground>
    <View style={styles.scBottom}>
      <Text style={styles.scTitle}>{sc.title}</Text>
      <View style={styles.scMeta}>
        <Ionicons name="time-outline" size={11} color={C.muted} />
        <Text style={styles.scMetaText}>{sc.duration} min</Text>
      </View>
    </View>
  </TouchableOpacity>
);

// ── Search Result Row — photo thumbnail ──────────────────────
const SearchRow = ({ meditation, onPress }) => {
  const key    = meditation.category?.toLowerCase() ?? 'general';
  const photo  = CAT_PHOTOS[key] ?? fallbackPhoto;
  const guided = !(meditation.type ?? '').toLowerCase().includes('un');
  return (
    <TouchableOpacity style={styles.searchRow} onPress={() => onPress(meditation)} activeOpacity={0.88}>
      <View style={styles.searchThumb}>
        <ImageBackground source={{ uri: photo }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
        <View style={styles.levelBadge}>
          <Text style={styles.levelText}>{cap(meditation.difficulty ?? meditation.level ?? 'Beginner')}</Text>
        </View>
      </View>
      <View style={styles.searchInfo}>
        <Text style={styles.searchTitle} numberOfLines={2}>{meditation.title}</Text>
        <View style={styles.searchMeta}>
          <Ionicons name={guided ? 'mic-outline' : 'volume-medium-outline'} size={12} color={C.muted} />
          <Text style={styles.searchMetaText}>{guided ? 'Guided' : 'Un-guided'}</Text>
          <Ionicons name="time-outline" size={12} color={C.muted} style={{ marginLeft: 8 }} />
          <Text style={styles.searchMetaText}>{meditation.duration} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// ── Main Screen ───────────────────────────────────────────────
const MeditationScreen = ({ navigation, route }) => {
  const [allMeditations, setAllMeditations] = useState([]);
  const [categories, setCategories]         = useState([]);
  const [catCounts, setCatCounts]           = useState({});
  const [searchQuery, setSearchQuery]       = useState('');
  const [loading, setLoading]               = useState(true);

  useEffect(() => {
    if (route?.params?.filterCategory) setSearchQuery(route.params.filterCategory);
    const load = async () => {
      try {
        const snap = await getDocs(collection(db, 'meditations'));
        const data = snap.docs.map(d => ({ firestoreId: d.id, ...d.data() }));
        setAllMeditations(data);
        const counts = {};
        data.forEach(m => {
          const c = cap(m.category ?? 'General');
          counts[c] = (counts[c] ?? 0) + 1;
        });
        setCatCounts(counts);
        setCategories(Object.keys(counts).sort());
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const goToDetail = (m) => navigation.navigate('MeditationDetail', { meditation: m });

  const searchResults = searchQuery.length > 1
    ? allMeditations.filter(m =>
        (m.title ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.category ?? '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const isSearching = searchQuery.length > 1;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Header */}
        <Text style={styles.header}>Meditate</Text>

        {/* Search */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={18} color={C.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="What do you want to listen?"
            placeholderTextColor={C.dim}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {isSearching ? (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={C.muted} />
            </TouchableOpacity>
          ) : (
            <Ionicons name="options-outline" size={18} color={C.muted} />
          )}
        </View>

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator color={C.accent} />
          </View>
        ) : isSearching ? (

          /* ── Search Results ── */
          <View>
            <Text style={styles.resultCount}>{searchResults.length} result{searchResults.length !== 1 ? 's' : ''}</Text>
            {searchResults.length === 0 ? (
              <View style={styles.emptyBox}>
                <Ionicons name="search-outline" size={36} color={C.dim} />
                <Text style={styles.emptyText}>No sessions found</Text>
              </View>
            ) : (
              searchResults.map(m => (
                <SearchRow key={m.firestoreId ?? m.id} meditation={m} onPress={goToDetail} />
              ))
            )}
          </View>

        ) : (
          <>
            {/* ── Natural Soundscapes ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Natural Soundscapes</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scRow}>
                {SOUNDSCAPES.map(sc => (
                  <SoundscapeCard key={sc.id} sc={sc} onPress={goToDetail} />
                ))}
              </ScrollView>
            </View>

            {/* ── Browse All ── */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse all</Text>
              <View style={styles.catGrid}>
                {categories.map(cat => (
                  <CategoryCard
                    key={cat}
                    cat={cat}
                    count={catCounts[cat] ?? 0}
                    onPress={() => setSearchQuery(cat)}
                  />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: C.bg },
  scroll: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  header: { fontSize: 26, fontWeight: '700', color: C.white, marginBottom: 16 },

  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card, borderRadius: 14,
    paddingHorizontal: 14, height: 48,
    marginBottom: 28, borderWidth: 1, borderColor: C.border,
  },
  searchInput: { flex: 1, fontSize: 15, color: C.white },

  loader:      { paddingVertical: 60, alignItems: 'center' },
  resultCount: { fontSize: 13, color: C.muted, marginBottom: 14 },
  emptyBox:    { alignItems: 'center', gap: 10, paddingVertical: 40 },
  emptyText:   { fontSize: 15, color: C.muted },

  section:      { marginBottom: 32 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: C.white, marginBottom: 16 },

  // Soundscape cards
  scRow:    { gap: 12, paddingRight: 4 },
  scCard:   { width: 140, height: 170, borderRadius: 16, overflow: 'hidden', justifyContent: 'flex-end' },
  scBottom: { padding: 12 },
  scTitle:  { fontSize: 14, fontWeight: '600', color: C.white, marginBottom: 4 },
  scMeta:   { flexDirection: 'row', alignItems: 'center', gap: 4 },
  scMetaText:{ fontSize: 11, color: C.muted },

  // Category grid — 2 columns
  catGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  catCard:    { width: '48.5%', height: 100, borderRadius: 14, overflow: 'hidden', justifyContent: 'flex-end' },
  catTextWrap:{ padding: 10 },
  catName:    { fontSize: 14, fontWeight: '600', color: C.white, marginBottom: 2 },
  catCount:   { fontSize: 11, color: C.muted },

  // Search rows
  searchRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.card, borderRadius: 14,
    marginBottom: 10, overflow: 'hidden',
    borderWidth: 1, borderColor: C.border,
  },
  searchThumb:  { width: 96, height: 96, overflow: 'hidden' },
  levelBadge:   {
    position: 'absolute', top: 8, left: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  levelText:     { fontSize: 9, color: C.white, fontWeight: '700' },
  searchInfo:    { flex: 1, paddingHorizontal: 14, paddingVertical: 12 },
  searchTitle:   { fontSize: 15, fontWeight: '600', color: C.white, marginBottom: 8, lineHeight: 20 },
  searchMeta:    { flexDirection: 'row', alignItems: 'center', gap: 4 },
  searchMetaText:{ fontSize: 12, color: C.muted },
});

export default MeditationScreen;