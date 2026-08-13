import { prisma } from "./client";

const email = "rudasingwabienvenue76@gmail.com";

const user = await prisma.user.upsert({
  where: { email },
  update: {
    name: "Bienvenue Rudasingwa",
    role: "tenant",
    emailVerified: true,
    status: "ACTIVE",
  },
  create: {
    id: "tenant-rudasingwa-demo",
    name: "Bienvenue Rudasingwa",
    email,
    phoneNumber: "+250788000099",
    nationalId: "1190000000000009",
    role: "tenant",
    emailVerified: true,
    image: "https://i.pravatar.cc/300?img=33",
    status: "ACTIVE",
  },
});

const now = new Date();
const notifications = [
  {
    title: "Booking confirmed",
    message: "Your stay request for a 2-bedroom apartment in Kimihurura was confirmed.",
    type: "BOOKING_CONFIRMED",
    isRead: false,
    createdAt: new Date(now.getTime() - 3 * 60 * 60 * 1000),
  },
  {
    title: "Payment successful",
    message: "Payment of RWF 450,000 was completed and your receipt is ready.",
    type: "PAYMENT_COMPLETED",
    isRead: false,
    createdAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
  },
  {
    title: "House reminder",
    message: "Check-in is tomorrow at 2:00 PM. Please review the arrival instructions.",
    type: "BOOKING_REMINDER",
    isRead: true,
    createdAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
  },
  {
    title: "System update",
    message: "Your profile security settings were reviewed and remain active.",
    type: "SYSTEM",
    isRead: false,
    createdAt: new Date(now.getTime() - 36 * 60 * 60 * 1000),
  },
] as const;

const result = await prisma.notification.createMany({
  data: notifications.map((notification) => ({
    userId: user.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
  })),
});

console.log(
  JSON.stringify(
    {
      email,
      userId: user.id,
      createdCount: result.count,
      notifications: notifications.map((notification) => ({
        title: notification.title,
        type: notification.type,
        isRead: notification.isRead,
      })),
    },
    null,
    2,
  ),
);

await prisma.$disconnect();
