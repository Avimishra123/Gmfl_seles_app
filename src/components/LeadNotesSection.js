import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { FileTextIcon } from './Icons';
import { colors } from '../theme';

function formatNoteDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (isNaN(d.getTime())) return '';
  return `${d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
}

export function LeadNotesSection({ notes = [], onAddNote, loading = false }) {
  const [noteText, setNoteText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const canSave = noteText.trim().length >= 2;

  async function handleSave() {
    if (!canSave) return;
    const ok = await onAddNote(noteText.trim());
    if (ok) {
      setNoteText('');
      setIsAdding(false);
    }
  }

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleWrap}>
          <FileTextIcon size={16} color={colors.navy} />
          <Text style={styles.title}>Follow-Up Notes ({notes.length})</Text>
        </View>
        {!isAdding ? (
          <Pressable
            onPress={() => setIsAdding(true)}
            hitSlop={8}
            style={({ pressed }) => [styles.addBtn, pressed && styles.pressedOpacity]}
          >
            <Text style={styles.addBtnText}>+ Add Note</Text>
          </Pressable>
        ) : null}
      </View>

      {/* Add Note Input Area */}
      {isAdding ? (
        <View style={styles.inputWrap}>
          <TextInput
            value={noteText}
            onChangeText={setNoteText}
            placeholder="Type meeting notes or call summary..."
            placeholderTextColor="#94A3B8"
            multiline
            numberOfLines={3}
            style={styles.textInput}
          />
          <View style={styles.btnRow}>
            <Pressable
              onPress={() => {
                setIsAdding(false);
                setNoteText('');
              }}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={handleSave}
              disabled={!canSave || loading}
              style={[
                styles.saveBtn,
                (!canSave || loading) && styles.saveBtnDisabled,
              ]}
            >
              <Text style={styles.saveBtnText}>
                {loading ? 'Saving...' : 'Save Note'}
              </Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* Notes List */}
      {notes.length === 0 && !isAdding ? (
        <Text style={styles.emptyText}>
          No notes logged yet. Tap &apos;+ Add Note&apos; to keep a discussion log.
        </Text>
      ) : null}

      {notes.map((item, index) => {
        const key = item.id || `note_${index}`;
        const dateStr = formatNoteDate(item.createdAt);

        return (
          <View key={key} style={styles.noteItem}>
            <View style={styles.noteHeader}>
              <Text style={styles.noteAuthor}>Sales Agent Note</Text>
              {dateStr ? <Text style={styles.noteDate}>{dateStr}</Text> : null}
            </View>
            <Text style={styles.noteContent}>{item.note}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  titleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontFamily: 'DMSans-Bold',
    fontSize: 15,
    color: colors.navy,
  },
  addBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#F0F9FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  addBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: '#0284C7',
  },
  inputWrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    marginBottom: 12,
  },
  textInput: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.ink,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 8,
  },
  cancelBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 12,
    color: colors.muted,
  },
  saveBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    fontFamily: 'DMSans-Bold',
    fontSize: 12,
    color: colors.white,
  },
  emptyText: {
    fontFamily: 'DMSans-Medium',
    fontSize: 13,
    color: colors.muted,
    lineHeight: 18,
    paddingVertical: 6,
  },
  noteItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0284C7',
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  noteAuthor: {
    fontFamily: 'DMSans-Bold',
    fontSize: 11,
    color: colors.navy,
  },
  noteDate: {
    fontFamily: 'DMSans-Regular',
    fontSize: 11,
    color: colors.muted,
  },
  noteContent: {
    fontFamily: 'DMSans-Regular',
    fontSize: 13,
    color: colors.ink,
    lineHeight: 18,
  },
  pressedOpacity: {
    opacity: 0.8,
  },
});
