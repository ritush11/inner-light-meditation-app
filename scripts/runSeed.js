const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');
const { initializeApp: initAdmin } = require('firebase-admin/app');

// ---- Firebase Config (copy from firebaseConfig.js) ----
const firebaseConfig = {
  apiKey: "AIzaSyDiiFbkiNOojA8smsqboi1sh3BWshuOIr8",
  authDomain: "inner-light-262fa.firebaseapp.com",
  projectId: "inner-light-262fa",
  storageBucket: "inner-light-262fa.firebasestorage.app",
  messagingSenderId: "1045842116189",
  appId: "1:1045842116189:web:61dfd33e7ba4a6880897b4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ============================================================
// SEED DATA
// ============================================================

const meditationsData = [
  // FOCUS
  { title: 'Morning Focus Boost', description: 'Start your day with clarity and intention. This session sharpens your mind and prepares you for deep focus.', category: 'focus', duration: 10, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400', tags: ['morning', 'focus', 'productivity'], isPremium: false },
  { title: 'Deep Work Preparation', description: 'Clear mental clutter and enter a state of deep concentration with this guided focus meditation.', category: 'focus', duration: 15, difficulty: 'intermediate', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1543966888-7c1dc482a810?w=400', tags: ['focus', 'work', 'concentration'], isPremium: false },
  { title: 'Study Session Centering', description: 'Prepare your mind for effective studying with this short centering meditation.', category: 'focus', duration: 5, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400', tags: ['focus', 'study', 'short'], isPremium: false },

  // ANXIETY & STRESS
  { title: 'Anxiety Relief', description: 'Gently release tension and anxiety with calming breath work and body awareness techniques.', category: 'anxiety', duration: 12, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400', tags: ['anxiety', 'calm', 'breathing'], isPremium: false },
  { title: 'Stress Melt Away', description: 'A progressive relaxation session designed to dissolve stress from head to toe.', category: 'stress', duration: 20, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', tags: ['stress', 'relax', 'body-scan'], isPremium: false },
  { title: 'Panic Relief Breathing', description: 'A quick 5-minute session using box breathing to calm a racing mind instantly.', category: 'anxiety', duration: 5, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400', tags: ['anxiety', 'breathing', 'quick'], isPremium: false },

  // SLEEP
  { title: 'Sleep Preparation', description: 'Wind down your mind and body with this gentle pre-sleep meditation. Perfect before bed.', category: 'sleep', duration: 15, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=400', tags: ['sleep', 'night', 'wind-down'], isPremium: false },
  { title: 'Deep Sleep Journey', description: 'A longer body-scan meditation to guide you into deep, restorative sleep.', category: 'sleep', duration: 30, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1531353826977-0941b4779a1c?w=400', tags: ['sleep', 'deep', 'relaxation'], isPremium: false },
  { title: 'Let Go of the Day', description: 'Release the mental load of the day and transition into peaceful rest.', category: 'sleep', duration: 10, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1502481851512-e9e2529bfbf9?w=400', tags: ['sleep', 'release', 'evening'], isPremium: false },

  // MORNING
  { title: 'Sunrise Awakening', description: 'Greet the new day with gratitude and positive intention.', category: 'morning', duration: 8, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400', tags: ['morning', 'gratitude', 'intentions'], isPremium: false },
  { title: 'Morning Energy Activation', description: 'Wake up your body and mind with this energizing morning meditation.', category: 'morning', duration: 10, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=400', tags: ['morning', 'energy', 'breathwork'], isPremium: false },

  // MINDFULNESS
  { title: 'Present Moment Awareness', description: 'Anchor yourself in the present moment with this classic mindfulness meditation.', category: 'mindfulness', duration: 10, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1474418397713-003ec9f03143?w=400', tags: ['mindfulness', 'awareness', 'present'], isPremium: false },
  { title: 'Loving Kindness', description: 'Cultivate compassion for yourself and others through this heart-opening meditation.', category: 'mindfulness', duration: 15, difficulty: 'intermediate', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400', tags: ['mindfulness', 'compassion', 'kindness'], isPremium: false },
  { title: 'Body Scan Awareness', description: 'Travel through your entire body with awareness, releasing tension along the way.', category: 'mindfulness', duration: 20, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1494232410401-ad00d5433cfa?w=400', tags: ['mindfulness', 'body-scan', 'tension'], isPremium: false },

  // BREATHING
  { title: '4-7-8 Breathing', description: 'One of the most powerful tools for calming the nervous system.', category: 'breathing', duration: 5, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=400', tags: ['breathing', 'nervous-system', 'quick'], isPremium: false },
  { title: 'Box Breathing', description: 'Used by Navy SEALs to stay calm under pressure. 4 counts in, hold, out, hold.', category: 'breathing', duration: 7, difficulty: 'beginner', instructor: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400', tags: ['breathing', 'box', 'calm'], isPremium: false },
];

const sleepStoriesData = [
  { title: 'The Enchanted Forest', description: 'Walk through a magical forest filled with glowing trees and gentle creatures.', duration: 20, narrator: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=400', category: 'nature', tags: ['forest', 'magical', 'nature'], isPremium: false },
  { title: 'Ocean Voyage', description: 'Set sail on a calm night sea under a blanket of stars.', duration: 25, narrator: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?w=400', category: 'nature', tags: ['ocean', 'night', 'stars'], isPremium: false },
  { title: 'Mountain Cabin', description: 'Rest by a warm fire in a cozy mountain cabin as snow falls softly outside.', duration: 18, narrator: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1518732714860-b62714ce0c59?w=400', category: 'cozy', tags: ['cabin', 'snow', 'fire', 'cozy'], isPremium: false },
  { title: 'Desert Stargazing', description: 'Lie under an infinite desert sky and watch shooting stars arc across the universe.', duration: 22, narrator: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400', category: 'nature', tags: ['desert', 'stars', 'night'], isPremium: false },
  { title: 'The Zen Garden', description: 'Wander through a traditional Japanese garden and find perfect stillness.', duration: 15, narrator: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400', category: 'peaceful', tags: ['zen', 'garden', 'peaceful'], isPremium: false },
  { title: 'Rainy Afternoon', description: 'Curl up with a warm blanket while rain taps softly on the window.', duration: 20, narrator: 'Inner Light', audioUrl: '', imageUrl: 'https://images.unsplash.com/photo-1501691223387-dd0500403074?w=400', category: 'cozy', tags: ['rain', 'cozy', 'reading'], isPremium: false },
];

const quotesData = [
  { text: 'The present moment is the only moment available to us, and it is the door to all moments.', author: 'Thich Nhat Hanh', category: 'mindfulness' },
  { text: 'You have power over your mind — not outside events. Realize this, and you will find strength.', author: 'Marcus Aurelius', category: 'strength' },
  { text: 'Breathing in, I calm body and mind. Breathing out, I smile.', author: 'Thich Nhat Hanh', category: 'breathing' },
  { text: 'The mind is everything. What you think, you become.', author: 'Buddha', category: 'mindset' },
  { text: 'Peace comes from within. Do not seek it without.', author: 'Buddha', category: 'peace' },
  { text: 'Almost everything will work again if you unplug it for a few minutes, including you.', author: 'Anne Lamott', category: 'rest' },
  { text: 'You cannot always control what goes on outside. But you can always control what goes on inside.', author: 'Wayne Dyer', category: 'mindset' },
  { text: 'Within you, there is a stillness and a sanctuary to which you can retreat at any time.', author: 'Hermann Hesse', category: 'peace' },
  { text: 'The quieter you become, the more you are able to hear.', author: 'Rumi', category: 'mindfulness' },
  { text: 'Take rest; a field that has rested gives a bountiful crop.', author: 'Ovid', category: 'rest' },
  { text: 'You are enough. You have enough. You do enough.', author: 'Unknown', category: 'self-love' },
  { text: 'To the mind that is still, the whole universe surrenders.', author: 'Lao Tzu', category: 'peace' },
  { text: 'Nothing can harm you as much as your own thoughts unguarded.', author: 'Buddha', category: 'mindset' },
  { text: 'Your calm mind is the ultimate weapon against your challenges.', author: 'Bryant McGill', category: 'strength' },
  { text: 'Be gentle with yourself. You are a child of the universe.', author: 'Max Ehrmann', category: 'self-love' },
  { text: 'Wherever you are, be all there.', author: 'Jim Elliot', category: 'mindfulness' },
  { text: 'Inhale the future. Exhale the past.', author: 'Unknown', category: 'breathing' },
  { text: 'Happiness comes from your own actions.', author: 'Dalai Lama', category: 'happiness' },
  { text: 'Each morning we are born again. What we do today matters most.', author: 'Buddha', category: 'morning' },
  { text: 'Slow down and everything you are chasing will come around and catch you.', author: 'John De Paola', category: 'rest' },
  { text: 'In the middle of difficulty lies opportunity.', author: 'Albert Einstein', category: 'strength' },
  { text: 'Stars cannot shine without darkness.', author: 'Unknown', category: 'hope' },
  { text: 'You do not have to be perfect to be amazing.', author: 'Unknown', category: 'self-love' },
  { text: 'One day or day one. You decide.', author: 'Unknown', category: 'action' },
  { text: 'Train your mind to see the good in every situation.', author: 'Unknown', category: 'mindset' },
  { text: 'The soul always knows what to do to heal itself. The challenge is to silence the mind.', author: 'Caroline Myss', category: 'healing' },
  { text: 'Gratitude turns what we have into enough.', author: 'Unknown', category: 'gratitude' },
  { text: 'Every moment is a fresh beginning.', author: 'T.S. Eliot', category: 'morning' },
  { text: 'Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.', author: 'Buddha', category: 'mindfulness' },
  { text: 'Difficult roads often lead to beautiful destinations.', author: 'Unknown', category: 'journey' },
];

// ============================================================
// SEED FUNCTION
// ============================================================

async function seedCollection(collectionName, data) {
  console.log(`\n📂 Seeding "${collectionName}" — ${data.length} documents...`);
  let count = 0;
  for (const item of data) {
    try {
      await addDoc(collection(db, collectionName), item);
      count++;
      process.stdout.write(`   ✓ ${count}/${data.length}\r`);
    } catch (error) {
      console.error(`   ✗ Error adding document: ${error.message}`);
    }
  }
  console.log(`   ✅ Done! Added ${count} documents to "${collectionName}"`);
}

async function runSeed() {
  console.log('🌱 Inner Light — Firestore Seeder');
  console.log('====================================');

  try {
    await seedCollection('meditations', meditationsData);
    await seedCollection('sleepStories', sleepStoriesData);
    await seedCollection('quotes', quotesData);

    console.log('\n====================================');
    console.log('✅ Seeding complete!');
    console.log('   Check your Firebase Console to verify.');
    console.log('====================================\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

runSeed();