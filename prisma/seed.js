const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.cardOrder.deleteMany();
  await prisma.importantDate.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      name: 'Alex Johnson',
      email: 'alex@example.com',
      passwordHash,
      mailingAddress: '123 Maple Street, Portland, OR 97201',
    },
  });

  console.log(`Created demo user: ${user.email} / password123`);

  // Create contacts with dates
  const mom = await prisma.contact.create({
    data: {
      userId: user.id,
      name: 'Linda Johnson',
      relationship: 'Mother',
      tonePreference: 'Sentimental',
      importantDates: {
        create: [
          { type: 'birthday', label: 'Birthday', month: 5, day: 14, year: 1962 },
          { type: 'holiday', label: "Mother's Day", month: 5, day: 11 },
        ],
      },
    },
  });
  console.log(`Created contact: ${mom.name}`);

  const bestFriend = await prisma.contact.create({
    data: {
      userId: user.id,
      name: 'Marcus Rivera',
      relationship: 'Best Friend',
      tonePreference: 'Funny',
      importantDates: {
        create: [
          { type: 'birthday', label: 'Birthday', month: 7, day: 22, year: 1990 },
          { type: 'custom', label: 'Friendiversary', month: 9, day: 3 },
        ],
      },
    },
  });
  console.log(`Created contact: ${bestFriend.name}`);

  const spouse = await prisma.contact.create({
    data: {
      userId: user.id,
      name: 'Jamie Chen',
      relationship: 'Spouse',
      tonePreference: 'Sentimental',
      importantDates: {
        create: [
          { type: 'birthday', label: 'Birthday', month: 11, day: 8, year: 1991 },
          { type: 'anniversary', label: 'Wedding Anniversary', month: 6, day: 20, year: 2019 },
        ],
      },
    },
  });
  console.log(`Created contact: ${spouse.name}`);

  console.log('\nSeed complete! You can log in with:');
  console.log('  Email: alex@example.com');
  console.log('  Password: password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
