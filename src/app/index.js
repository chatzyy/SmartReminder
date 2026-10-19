import React, { useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Animated,
  StatusBar,
  Platform,
  Keyboard,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { styles } from '../../style/styles';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const ACTIVITIES = [
  { name: 'เรียน', icon: '🏫' },
  { name: 'ทำงาน', icon: '💼' },
  { name: 'เดินทาง', icon: '✈️' },
  { name: 'ออกกำลังกาย', icon: '🏃' },
];

const DATA = {
  เรียน: ['โทรศัพท์', 'กระเป๋า', 'สมุด/หนังสือ', 'ปากกา', 'บัตรนักเรียน', 'ที่ชาร์จ'],
  ทำงาน: ['โทรศัพท์', 'กระเป๋า', 'โน้ตบุ๊ก', 'ที่ชาร์จ', 'บัตรพนักงาน', 'เอกสาร'],
  เดินทาง: ['โทรศัพท์', 'กระเป๋าสตางค์', 'บัตรประชาชน/พาสปอร์ต', 'ที่ชาร์จ', 'เสื้อผ้า', 'ของใช้ส่วนตัว'],
  ออกกำลังกาย: ['ชุดกีฬา', 'รองเท้า', 'ขวดน้ำ', 'ผ้าเช็ดตัว', 'หูฟัง', 'โทรศัพท์'],
};

// กิจกรรมเพิ่มเติม (ใช้จับคำจากที่ผู้ใช้พิมพ์)
const EXTRA = [
  {
    keys: ['ทะเล', 'เกาะ', 'ชายหาด', 'ว่ายน้ำ'],
    name: 'ทะเล',
    icon: '🏖️',
    items: ['ชุดว่ายน้ำ', 'ครีมกันแดด', 'หมวก/แว่นกันแดด', 'ผ้าเช็ดตัว', 'รองเท้าแตะ', 'โทรศัพท์', 'กระเป๋าสตางค์'],
  },
  {
    keys: ['ประชุม', 'พรีเซนต์', 'นำเสนอ', 'สัมภาษณ์'],
    name: 'ประชุม',
    icon: '📊',
    items: ['โน้ตบุ๊ก', 'ที่ชาร์จ', 'เอกสาร/สไลด์', 'ปากกา', 'บัตรพนักงาน', 'โทรศัพท์'],
  },
  {
    keys: ['หมอ', 'โรงพยาบาล', 'โรงบาล', 'คลินิก', 'ทันตแพทย์', 'ทำฟัน', 'ตรวจสุขภาพ'],
    name: 'หาหมอ',
    icon: '🏥',
    items: [
      'บัตรประชาชน',
      'บัตรประกัน/สิทธิ์รักษา',
      'ใบนัด/เอกสารการรักษา',
      'ยาที่ใช้ประจำ',
      'กระเป๋าสตางค์',
      'โทรศัพท์',
    ],
  },
  {
    keys: ['ช้อป', 'ห้าง', 'ซื้อของ', 'ตลาด', 'ซูเปอร์'],
    name: 'ช้อปปิ้ง',
    icon: '🛍️',
    items: ['กระเป๋าสตางค์', 'ถุงผ้า', 'รายการที่จะซื้อ', 'โทรศัพท์', 'บัตรสมาชิก/คูปอง'],
  },
];

const MAIN_KEYS = {
  เรียน: ['เรียน', 'โรงเรียน', 'มหาวิทยาลัย', 'มหาลัย', 'สอบ', 'คาบ', 'ติว', 'มหา'],
  ทำงาน: ['ทำงาน', 'ออฟฟิศ', 'งาน', 'บริษัท'],
  เดินทาง: ['เดินทาง', 'เที่ยว', 'ท่องเที่ยว', 'สนามบิน', 'ขึ้นเครื่อง', 'ต่างจังหวัด', 'ทริป', 'บิน'],
  ออกกำลังกาย: ['ออกกำลัง', 'ฟิตเนส', 'วิ่ง', 'โยคะ', 'ยิม', 'เตะบอล', 'ปั่น', 'กีฬา'],
};

const GENERIC_ITEMS = ['โทรศัพท์', 'กระเป๋าสตางค์', 'กุญแจ', 'ที่ชาร์จ'];

// ---------- ระบบกันคำหยาบ ----------
// เพิ่มคำได้เองในลิสต์นี้ (เลี่ยงคำสั้นที่เป็นส่วนหนึ่งของคำปกติ เช่น "หี" ที่อยู่ใน "หีบ")
const BAD_WORDS = [
  'เหี้ย', 'ควย', 'เชี่ย', 'เย็ดแม่', 'แม่ง', 'ระยำ', 'ส้นตีน', 'ตอแหล',
  'อีดอก', 'ดอกทอง', 'ไอ้สัตว์', 'ชาติหมา', 'ไอ้สัส', 'อีสัส', 'หำ', 'ตูด', 'ก้น', 'Hum', 'hum', 'Hee', 'hee', 'kuy', 'Kuy',
  'fuck', 'shit', 'bitch', 'asshole', 'cunt', 'pussy', 'dick', 'bastard', 'หี', 'เย็ด','เย้ด' , 'แตด', 'หมอย'
];

// ตัดช่องว่าง/เครื่องหมาย และยุบตัวอักษรซ้ำ กันการพิมพ์หลบ เช่น "เหี้ยยย" หรือ "f u c k"
const normalizeText = (s) =>
  s
    .toLowerCase()
    .replace(/[\s\u200b\-_.,*!?'"()]/g, '')
    .replace(/(.)\1+/g, '$1');

const BAD_NORMALIZED = BAD_WORDS.map(normalizeText);

const hasProfanity = (text) => {
  const n = normalizeText(text);
  return BAD_NORMALIZED.some((w) => n.includes(w));
};

const findActivity = (text) => {
  const q = text.trim().toLowerCase();
  for (const e of EXTRA) {
    if (e.keys.some((k) => q.includes(k))) return e;
  }
  for (const a of ACTIVITIES) {
    if (MAIN_KEYS[a.name].some((k) => q.includes(k))) {
      return { name: a.name, icon: a.icon, items: DATA[a.name] };
    }
  }
  return null;
};

export default function App() {
  const [screen, setScreen] = useState('home'); // home | check | reminder
  const [current, setCurrent] = useState({ name: 'เดินทาง', icon: '✈️' });
  const [checked, setChecked] = useState({});
  const [hour, setHour] = useState('');
  const [minute, setMinute] = useState('');
  const [savedTime, setSavedTime] = useState(null);
  const [toastMsg, setToastMsg] = useState('');
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTimer = useRef(null);
  const [query, setQuery] = useState('');
  const [suggestion, setSuggestion] = useState(null);
  const [customItems, setCustomItems] = useState({}); // { ชื่อกิจกรรม: [ของที่เพิ่มเอง] }
  const [newItem, setNewItem] = useState('');
  const [removedItems, setRemovedItems] = useState({}); // { ชื่อกิจกรรม: [ของแนะนำที่ผู้ใช้ลบ] }
  const [stats, setStats] = useState({}); // { ชื่อของ: จำนวนครั้งที่ลืม }

  const topForgot = Object.entries(stats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const removedList = removedItems[current.name] || [];
  const baseItems = (current.items || DATA[current.name]).filter((x) => !removedList.includes(x));
  const customList = customItems[current.name] || [];
  const items = [...baseItems, ...customList];
  const doneCount = items.filter((_, i) => checked[i]).length;
  const percent = items.length ? Math.round((doneCount / items.length) * 100) : 0;

  useEffect(() => {
    (async () => {
      try {
        const t = await AsyncStorage.getItem('reminder');
        if (t) {
          setSavedTime(t);
          const [h, m] = t.split(':');
          setHour(h);
          setMinute(m);
        }
      } catch (e) {}
      try {
        const s = await AsyncStorage.getItem('forgotStats');
        if (s) setStats(JSON.parse(s));
      } catch (e) {}
      try {
        const c = await AsyncStorage.getItem('customItems');
        if (c) setCustomItems(JSON.parse(c));
      } catch (e) {}
      try {
        const r = await AsyncStorage.getItem('removedItems');
        if (r) setRemovedItems(JSON.parse(r));
      } catch (e) {}
    })();
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const saveStats = async (next) => {
    setStats(next);
    try {
      await AsyncStorage.setItem('forgotStats', JSON.stringify(next));
    } catch (e) {}
  };

  // ผู้ใช้กด "เช็คเสร็จแล้ว": นับของที่ยังไม่ได้ติ๊กเป็นของที่ลืม
  const confirmChecked = async () => {
    if (items.length === 0) {
      showToast('ต้องมีรายการเช็คอย่างน้อย 1 รายการ');
      return;
    }
    const missed = items.filter((_, i) => !checked[i]);
    if (missed.length === 0) {
      showToast('พร้อมครบทุกอย่างแล้ว เยี่ยมมาก!!');
    } else {
      const next = { ...stats };
      missed.forEach((name) => {
        const key = `${current.name}||${name}`; // เก็บแยกตามกิจกรรม
        next[key] = (next[key] || 0) + 1;
      });
      await saveStats(next);
      showToast(`บันทึกแล้ว ยังไม่ได้เตรียม ${missed.length} อย่าง`);
    }
    setChecked({});
    setScreen('home');
  };

  const resetStats = () => saveStats({});

  const saveCustom = async (next) => {
    setCustomItems(next);
    try {
      await AsyncStorage.setItem('customItems', JSON.stringify(next));
    } catch (e) {}
  };

  // เพิ่มของเองในกิจกรรมปัจจุบัน (จำไว้ใช้ครั้งต่อไปด้วย)
  const addItem = () => {
    const name = newItem.trim();
    if (!name) {
      showToast('พิมพ์ชื่อสิ่งของที่อยากเพิ่ม');
      return;
    }
    if (hasProfanity(name)) {
      showToast('กรุณาใช้ที่คำสุภาพ');
      return;
    }
    if (items.some((x) => x.toLowerCase() === name.toLowerCase())) {
      showToast('มีของชิ้นนี้ในรายการแล้ว');
      return;
    }
    saveCustom({ ...customItems, [current.name]: [...customList, name] });
    setNewItem('');
  };

  const saveRemoved = async (next) => {
    setRemovedItems(next);
    try {
      await AsyncStorage.setItem('removedItems', JSON.stringify(next));
    } catch (e) {}
  };

  // คืนรายการที่ระบบแนะนำซึ่งเคยลบไป (ของที่เพิ่มเองไม่กระทบ)
  const restoreDefaults = () => saveRemoved({ ...removedItems, [current.name]: [] });

  // ลบของได้ทุกรายการ ทั้งที่ระบบแนะนำและที่เพิ่มเอง
  const removeItem = (i) => {
    if (i < baseItems.length) {
      saveRemoved({
        ...removedItems,
        [current.name]: [...removedList, baseItems[i]],
      });
    } else {
      const j = i - baseItems.length;
      saveCustom({
        ...customItems,
        [current.name]: customList.filter((_, idx) => idx !== j),
      });
    }
    if (items.length === 1) showToast('ต้องมีรายการเช็คอย่างน้อย 1 รายการ');
    // เลื่อนสถานะติ๊กของรายการที่อยู่ถัดไปให้ตรงตำแหน่งใหม่
    setChecked((prev) => {
      const next = {};
      Object.keys(prev).forEach((k) => {
        const n = Number(k);
        if (n < i) next[n] = prev[k];
        else if (n > i) next[n - 1] = prev[k];
      });
      return next;
    });
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    Animated.timing(toastOpacity, { toValue: 1, duration: 150, useNativeDriver: true }).start();
    toastTimer.current = setTimeout(() => {
      Animated.timing(toastOpacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
    }, 2200);
  };

  const selectActivity = (a) => {
    setCurrent(a);
    setChecked({});
    setScreen('check');
  };

  const runSuggest = (text) => {
    if (!text.trim()) {
      showToast('กรุณาพิมพ์กิจกรรมของวันนี้ก่อน');
      return;
    }
    if (hasProfanity(text)) {
      showToast('กรุณาใช้คำที่สุภาพ');
      return;
    }
    Keyboard.dismiss();
    const hit = findActivity(text);
    setQuery(text);
    // ตัดคำว่า "ไป" นำหน้าออก กันแจ้งเตือนซ้ำคำ ("ก่อนไปไป...") และให้ชื่อกิจกรรมตรงกันทุกครั้ง
    const cleaned = text.trim().replace(/^ไป\s*/, '').trim() || text.trim();
    setSuggestion(
      hit
        ? { ...hit, matched: true }
        : { name: cleaned, icon: '🤔', items: GENERIC_ITEMS, matched: false }
    );
  };

  const openAsChecklist = () => {
    setCurrent({ name: suggestion.name, icon: suggestion.icon, items: suggestion.items });
    setChecked({});
    setScreen('check');
  };

  const toggleItem = (i) => setChecked((prev) => ({ ...prev, [i]: !prev[i] }));

  const saveReminder = async () => {
    if (items.length === 0) {
      showToast('ต้องมีรายการเช็คอย่างน้อย 1 รายการก่อนตั้ง Reminder');
      return;
    }
    const h = parseInt(hour, 10);
    const m = parseInt(minute, 10);
    if (hour === '' || minute === '' || isNaN(h) || isNaN(m) || h < 0 || h > 23 || m < 0 || m > 59) {
      showToast('กรุณาใส่เวลาให้ถูกต้อง');
      return;
    }
    const t = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

    try {
      // ขอสิทธิ์แจ้งเตือน
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Smart Reminder',
          importance: Notifications.AndroidImportance.HIGH,
        });
      }
      let { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        ({ status } = await Notifications.requestPermissionsAsync());
      }
      if (status !== 'granted') {
        showToast('ยังไม่ได้รับสิทธิ์แจ้งเตือน กรุณาเปิดในการตั้งค่า');
        return;
      }

      // ลบการแจ้งเตือนเก่า แล้วตั้งใหม่ทุกวัน
      await Notifications.cancelAllScheduledNotificationsAsync();
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `${current.icon} ตรวจของก่อนไป${current.name}`,
          body: `อย่าลืม: ${items.join(', ')}`,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: h,
          minute: m,
          channelId: 'default',
        },
      });

      await AsyncStorage.setItem('reminder', t);
    } catch (e) {
      showToast('ตั้งการแจ้งเตือนไม่สำเร็จ กรุณาลองใหม่อีกครั้ง');
      return;
    }
    setSavedTime(t);
    showToast(`ตั้งแจ้งเตือนทุกวันเวลา ${t} แล้ว ✓`);
  };

  const renderHome = () => (
    <>
      <View style={styles.card}>
        <Text style={styles.h2}>วันนี้จะทำอะไร?</Text>
        <View style={styles.grid}>
          {ACTIVITIES.map((a) => (
            <TouchableOpacity key={a.name} style={styles.activity} onPress={() => selectActivity(a)}>
              <Text style={styles.activityText}>
                {a.icon} {a.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>🤖 Smart Suggestion</Text>
        </View>
        <Text style={styles.h2}>วันนี้ทำอะไร? ให้ช่วยคิดของที่ต้องเตรียม</Text>

        <View style={extra.inputRow}>
          <TextInput
            style={extra.input}
            value={query}
            onChangeText={setQuery}
            placeholder="เช่น ไปทะเล, ประชุม, วิ่งตอนเย็น"
            placeholderTextColor="#98a2b3"
            returnKeyType="search"
            onSubmitEditing={() => runSuggest(query)}
          />
          <TouchableOpacity style={extra.goBtn} onPress={() => runSuggest(query)}>
            <Text style={extra.goText}>แนะนำ</Text>
          </TouchableOpacity>
        </View>

        <View style={extra.chips}>
          {[...ACTIVITIES, ...EXTRA].map((a) => (
            <TouchableOpacity key={a.name} style={extra.chip} onPress={() => runSuggest(a.name)}>
              <Text style={extra.chipText}>
                {a.icon} {a.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {suggestion && (
          <View style={extra.result}>
            <Text style={extra.resultTitle}>
              {suggestion.icon} ของที่ต้องเตรียมสำหรับ "{suggestion.name}"
            </Text>
            {!suggestion.matched && (
              <Text style={extra.note}>ยังไม่รู้จักกิจกรรมนี้ เลยแนะนำของที่ควรพกทุกครั้งให้ก่อนนะ^^</Text>
            )}
            {suggestion.items.map((x) => (
              <Text key={x} style={extra.resultItem}>
                • {x}
              </Text>
            ))}
            <TouchableOpacity style={styles.primary} onPress={openAsChecklist}>
              <Text style={styles.primaryText}>Checklist</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.h2}>📊 สิ่งที่มักลืม</Text>
        {topForgot.length === 0 ? (
          <Text style={extra.note}>
            ยังไม่มีสถิติ ลองเปิด Checklist แล้วกด "เช็คเสร็จแล้ว" ระบบจะนับของที่ยังไม่ได้ติ๊ก
          </Text>
        ) : (
          <>
            {topForgot.map(([key, count], idx) => {
              const [act, name] = key.includes('||') ? key.split('||') : [null, key];
              return (
                <Text key={key} style={styles.p}>
                  {idx + 1}. {name}
                  {act ? ` (ตอนไป${act})` : ''} — {count} ครั้ง
                </Text>
              );
            })}
            <TouchableOpacity style={extra.resetBtn} onPress={resetStats}>
              <Text style={extra.resetText}>รีเซ็ตสถิติ</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </>
  );

  const renderCheck = () => (
    <View style={styles.card}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {current.icon} Smart Suggestion: {current.name}
        </Text>
      </View>
      <Text style={styles.h2}>☑️ {current.name} Checklist</Text>

      {items.map((x, i) => (
        <TouchableOpacity key={i} style={styles.item} onPress={() => toggleItem(i)} activeOpacity={0.6}>
          <View style={[styles.checkbox, checked[i] && styles.checkboxOn]}>
            {checked[i] && <Text style={styles.checkMark}>✓</Text>}
          </View>
          <Text style={[styles.itemText, { flex: 1 }, checked[i] && styles.done]}>{x}</Text>
          <TouchableOpacity onPress={() => removeItem(i)} hitSlop={10}>
            <Text style={extra.removeText}>✕</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      ))}

      {items.length === 0 && (
        <View style={extra.warn}>
          <Text style={extra.warnText}>
            ⚠️ ต้องมีรายการเช็คอย่างน้อย 1 รายการ (เพิ่มของเองด้านล่าง/คืนรายการที่ระบบแนะนำ)
          </Text>
        </View>
      )}
      {removedList.length > 0 && (
        <TouchableOpacity style={extra.resetBtn} onPress={restoreDefaults}>
          <Text style={extra.resetText}>↺ คืนรายการที่ระบบแนะนำ ({removedList.length})</Text>
        </TouchableOpacity>
      )}

      <View style={extra.inputRow}>
        <TextInput
          style={extra.input}
          value={newItem}
          onChangeText={setNewItem}
          placeholder="เพิ่มของเอง เช่น ร่ม, ยา"
          placeholderTextColor="#98a2b3"
          returnKeyType="done"
          onSubmitEditing={addItem}
        />
        <TouchableOpacity style={extra.goBtn} onPress={addItem}>
          <Text style={extra.goText}>+ เพิ่ม</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.p, { marginTop: 14 }]}>
        ความพร้อม <Text style={{ fontWeight: 'bold' }}>{percent}%</Text>
      </Text>
      <View style={styles.progress}>
        <View style={[styles.bar, { width: `${percent}%` }]} />
      </View>

      <TouchableOpacity style={styles.primary} onPress={confirmChecked}>
        <Text style={styles.primaryText}>เช็คเสร็จแล้ว</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondary} onPress={() => setScreen('reminder')}>
        <Text style={styles.secondaryText}>ตั้ง Reminder</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondary} onPress={() => setScreen('home')}>
        <Text style={styles.secondaryText}>← กลับหน้าหลัก</Text>
      </TouchableOpacity>
    </View>
  );

  const renderReminder = () => (
    <View style={styles.card}>
      <Text style={styles.h2}>🔔 ตั้ง Reminder</Text>
      <Text style={styles.p}>เลือกเวลาที่ต้องการให้ตรวจสอบของ</Text>

      <View style={styles.timeRow}>
        <TextInput
          style={styles.timeInput}
          value={hour}
          onChangeText={(t) => setHour(t.replace(/[^0-9]/g, '').slice(0, 2))}
          keyboardType="number-pad"
          placeholder="HH"
          placeholderTextColor="#98a2b3"
          maxLength={2}
        />
        <Text style={styles.colon}>:</Text>
        <TextInput
          style={styles.timeInput}
          value={minute}
          onChangeText={(t) => setMinute(t.replace(/[^0-9]/g, '').slice(0, 2))}
          keyboardType="number-pad"
          placeholder="MM"
          placeholderTextColor="#98a2b3"
          maxLength={2}
        />
      </View>

      {savedTime && <Text style={styles.savedText}>เวลาที่บันทึกไว้: {savedTime}</Text>}

      <TouchableOpacity style={styles.primary} onPress={saveReminder}>
        <Text style={styles.primaryText}>บันทึกการแจ้งเตือน</Text>
      </TouchableOpacity>
    </View>
  );

  const NavButton = ({ id, icon, label }) => (
    <TouchableOpacity style={styles.navBtn} onPress={() => setScreen(id)}>
      <Text style={styles.navIcon}>{icon}</Text>
      <Text style={[styles.navLabel, screen === id && styles.navLabelOn]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#dff7ed" />
      <View style={styles.header}>
        <Text style={styles.h1}>📱 Smart Reminder</Text>
        <Text style={styles.sub}>คิดก่อนลืม — ผู้ช่วยเตรียมตัวอัจฉริยะ</Text>
      </View>

      <ScrollView contentContainerStyle={styles.main} keyboardShouldPersistTaps="handled">
        {screen === 'home' && renderHome()}
        {screen === 'check' && renderCheck()}
        {screen === 'reminder' && renderReminder()}
      </ScrollView>

      <View style={styles.nav}>
        <NavButton id="home" icon="🏠" label="หน้าหลัก" />
        <NavButton id="check" icon="☑️" label="Checklist" />
        <NavButton id="reminder" icon="🔔" label="Reminder" />
      </View>

      <Animated.View pointerEvents="none" style={[styles.toast, { opacity: toastOpacity }]}>
        <Text style={styles.toastText}>{toastMsg}</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const extra = StyleSheet.create({
  inputRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    color: '#20242c',
  },
  goBtn: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginLeft: 8,
  },
  goText: { color: '#fff', fontWeight: 'bold' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  chip: {
    backgroundColor: '#f3f5f8',
    borderRadius: 99,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: { fontSize: 13, color: '#20242c' },
  result: {
    marginTop: 8,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#f0faf5',
  },
  resultTitle: { fontSize: 16, fontWeight: 'bold', color: '#16805a', marginBottom: 6 },
  resultItem: { fontSize: 15, color: '#20242c', marginVertical: 2 },
  note: { fontSize: 13, color: '#667085', marginBottom: 6 },
  warn: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#fff4e5',
    borderWidth: 1,
    borderColor: '#f5c26b',
  },
  warnText: { fontSize: 14, color: '#8a5a00' },
  removeText: { fontSize: 16, color: '#98a2b3', paddingHorizontal: 6 },
  resetBtn: { alignSelf: 'flex-start', marginTop: 8, paddingVertical: 6 },
  resetText: { fontSize: 13, color: '#98a2b3', textDecorationLine: 'underline' },
});