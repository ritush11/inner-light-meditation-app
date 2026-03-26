import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { borderRadius, colors, shadows, spacing } from '../../styles/theme';

const journalPrompts = [
  'What made you smile today?',
  'What are you grateful for?',
  'How did meditation help you today?',
  'What challenged you today?',
  'What are your goals for tomorrow?',
  'How are you feeling right now?',
  'What lessons did you learn today?',
  'Who did you appreciate today?',
];

const WellnessJournalScreen = ({ navigation }) => {
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [savedEntries, setSavedEntries] = useState([
    {
      id: 1,
      date: 'Today',
      prompt: 'What made you smile today?',
      entry: 'My meditation session this morning brought me peace and clarity.',
      mood: '😊',
    },
    {
      id: 2,
      date: 'Yesterday',
      prompt: 'What are you grateful for?',
      entry: 'Grateful for health, family, and the opportunity to grow.',
      mood: '😌',
    },
  ]);

  const handleSaveEntry = () => {
    if (!selectedPrompt || !journalEntry.trim()) {
      Alert.alert('Incomplete', 'Please select a prompt and write your thoughts');
      return;
    }

    const newEntry = {
      id: savedEntries.length + 1,
      date: 'Today',
      prompt: selectedPrompt,
      entry: journalEntry,
      mood: '😊',
    };

    setSavedEntries([newEntry, ...savedEntries]);
    Alert.alert('Entry Saved!', 'Your journal entry has been saved 📝');
    setSelectedPrompt(null);
    setJournalEntry('');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={28} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Wellness Journal</Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Write Entry Section */}
        <LinearGradient
          colors={['#8B7FD9', '#A89FE0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.writeSection}
        >
          <View style={styles.writeSectionHeader}>
            <Ionicons name="pencil" size={24} color={colors.white} />
            <Text style={styles.writeSectionTitle}>Write Your Entry</Text>
          </View>
          <Text style={styles.writeSectionSubtitle}>
            Reflect on your day and express your feelings
          </Text>
        </LinearGradient>

        {/* Prompts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Writing Prompts</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.promptsScroll}
          >
            {journalPrompts.map((prompt, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.promptCard,
                  selectedPrompt === prompt && styles.promptCardActive,
                ]}
                onPress={() => setSelectedPrompt(prompt)}
              >
                <Text
                  style={[
                    styles.promptText,
                    selectedPrompt === prompt && styles.promptTextActive,
                  ]}
                >
                  {prompt}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Journal Input */}
        <View style={styles.section}>
          {selectedPrompt && (
            <View style={styles.selectedPromptCard}>
              <Ionicons name="chatbox" size={18} color={colors.primary} />
              <Text style={styles.selectedPromptText}>{selectedPrompt}</Text>
            </View>
          )}

          <TextInput
            style={styles.journalInput}
            placeholder="Write your thoughts here..."
            placeholderTextColor={colors.lightGray}
            multiline
            numberOfLines={8}
            value={journalEntry}
            onChangeText={setJournalEntry}
            textAlignVertical="top"
          />

          <View style={styles.inputInfo}>
            <Ionicons name="information-circle" size={16} color={colors.primary} />
            <Text style={styles.inputInfoText}>
              {journalEntry.length} characters
            </Text>
          </View>
        </View>

        {/* Save Button */}
        <LinearGradient
          colors={['#4ECDC4', '#45B7AA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.saveButton}
        >
          <TouchableOpacity
            style={styles.saveButtonContent}
            onPress={handleSaveEntry}
          >
            <Ionicons name="save" size={20} color={colors.white} />
            <Text style={styles.saveButtonText}>Save Entry</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Past Entries */}
        <View style={styles.section}>
          <View style={styles.entriesHeader}>
            <Text style={styles.sectionTitle}>Your Entries</Text>
            <Text style={styles.entriesCount}>{savedEntries.length}</Text>
          </View>

          {savedEntries.map((entry) => (
            <TouchableOpacity key={entry.id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View>
                  <Text style={styles.entryDate}>{entry.date}</Text>
                  <Text style={styles.entryPrompt}>{entry.prompt}</Text>
                </View>
                <Text style={styles.entryMood}>{entry.mood}</Text>
              </View>
              <Text style={styles.entryText} numberOfLines={3}>
                {entry.entry}
              </Text>
              <View style={styles.entryActions}>
                <TouchableOpacity style={styles.entryAction}>
                  <Ionicons name="eye" size={16} color={colors.primary} />
                  <Text style={styles.entryActionText}>View</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.entryAction}>
                  <Ionicons name="trash" size={16} color="#FF6B9D" />
                  <Text style={[styles.entryActionText, { color: '#FF6B9D' }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  container: {
    flex: 1,
    backgroundColor: '#FAFBFC',
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  writeSection: {
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  writeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  writeSectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  writeSectionSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  promptsScroll: {
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  promptCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginRight: spacing.md,
    minWidth: 180,
    borderWidth: 1,
    borderColor: colors.lightBorder,
    ...shadows.light,
  },
  promptCardActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  promptText: {
    fontSize: 12,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  promptTextActive: {
    color: colors.white,
  },
  selectedPromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8F8',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  selectedPromptText: {
    fontSize: 13,
    color: colors.primary,
    fontWeight: '600',
    flex: 1,
  },
  journalInput: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    fontSize: 14,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.lightBorder,
    minHeight: 200,
    ...shadows.light,
  },
  inputInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  inputInfoText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  saveButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.xl,
    ...shadows.medium,
  },
  saveButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.white,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  entriesCount: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
    backgroundColor: '#F0F8F8',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  entryCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.light,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.lightBorder,
  },
  entryDate: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  entryPrompt: {
    fontSize: 13,
    color: colors.text,
    fontWeight: '700',
    maxWidth: 200,
  },
  entryMood: {
    fontSize: 24,
  },
  entryText: {
    fontSize: 13,
    color: colors.text,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  entryActions: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  entryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  entryActionText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
  },
});

export default WellnessJournalScreen;