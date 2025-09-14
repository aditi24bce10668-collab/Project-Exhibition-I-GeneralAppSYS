const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Member = require('./models/Member');
const Specialist = require('./models/Specialist');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  await Member.deleteMany({});
  await Specialist.deleteMany({});

  const m1 = await Member.create({ name: 'Alice', email: 'alice@example.com' });
  const m2 = await Member.create({ name: 'Bob', email: 'bob@example.com' });

  const s1 = await Specialist.create({ name: 'Dr. Priya Sharma', category: 'Cardiology', bio: '10+ yrs', qualifications: ['MBBS','MD'], slotDuration: 30, metadata: { autoConfirm: true }});
  const s2 = await Specialist.create({ name: 'Dr. Ramesh Gupta', category: 'Dermatology', bio: 'Skin specialist', qualifications: ['MBBS','DDV'], slotDuration: 20, metadata: { autoConfirm: false }});

  console.log({ m1, m2, s1, s2 });
  await mongoose.disconnect();
  console.log('Seeding complete');
}

seed().catch(console.error);
