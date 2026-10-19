import { StyleSheet, Platform, StatusBar } from 'react-native';

export const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0
  },
  header: { padding: 20, backgroundColor: '#e6f4f4' },
  h1: { fontSize: 25, fontWeight: 'bold', color: '#20242c', marginBottom: 6 },
  sub: { color: '#667085' },
  main: { padding: 20, paddingBottom: 30 },

  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e8ebf0',
    borderRadius: 18,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 9,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  h2: { fontSize: 20, fontWeight: 'bold', color: '#20242c', marginVertical: 6 },
  p: { fontSize: 15, color: '#20242c', marginVertical: 3 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 8 },
  activity: {
    width: '48%',
    backgroundColor: '#f3f5f8',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  activityText: { fontSize: 15, fontWeight: 'bold', color: '#20242c' },

  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#e7f7ef',
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  badgeText: { fontSize: 13, fontWeight: 'bold', color: '#16805a' },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#98a2b3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkboxOn: { backgroundColor: '#49b883', borderColor: '#49b883' },
  checkMark: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  itemText: { fontSize: 16, color: '#20242c' },
  done: { textDecorationLine: 'line-through', color: '#98a2b3' },

  progress: { height: 10, backgroundColor: '#edf0f4', borderRadius: 20, overflow: 'hidden' },
  bar: { height: '100%', backgroundColor: '#49b883' },

  primary: {
    backgroundColor: '#111827',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: 'bold' },
  secondary: {
    backgroundColor: '#edf1f5',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryText: { color: '#20242c', fontSize: 15, fontWeight: 'bold' },

  timeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  timeInput: {
    width: 80,
    padding: 13,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    fontSize: 22,
    textAlign: 'center',
    color: '#20242c',
  },
  colon: { fontSize: 26, fontWeight: 'bold', marginHorizontal: 10 },
  savedText: { textAlign: 'center', color: '#16805a', marginTop: 12 },

  nav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e8ebf0',
    paddingVertical: 8,
  },
  navBtn: { alignItems: 'center', paddingHorizontal: 16 },
  navIcon: { fontSize: 20 },
  navLabel: { fontSize: 12, color: '#667085', marginTop: 2 },
  navLabelOn: { color: '#111827', fontWeight: 'bold' },

  toast: {
    position: 'absolute',
    bottom: 80,
    alignSelf: 'center',
    backgroundColor: '#111827',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  toastText: { color: '#fff' },
});