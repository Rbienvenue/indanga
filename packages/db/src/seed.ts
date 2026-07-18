import { prisma } from "./client";

const PASSWORD_HASH =
  "f4f70d872ea8c190bbcc7dc668d2091e:bbed45b83dd139e00b2e7a6470f46867f7701690e0de60f550bf0c7978fabe65c125176f5cdd6041422c89664610810610967a75c6ce4371f78c110116eeca64";

const users = [
  {
    id: "seed-admin-001",
    name: "Aline Mukamana",
    email: "admin@indanga.test",
    phoneNumber: "+250788000001",
    nationalId: "1199980010000001",
    role: "ADMIN" as const,
    emailVerified: true,
    image: "https://i.pravatar.cc/300?img=47",
  },
  {
    id: "seed-landlord-001",
    name: "Jean Claude Habimana",
    email: "jean.habimana@indanga.test",
    phoneNumber: "+250788000002",
    nationalId: "1198880020000002",
    role: "LANDLORD" as const,
    emailVerified: true,
    image: "https://i.pravatar.cc/300?img=12",
  },
  {
    id: "seed-landlord-002",
    name: "Chantal Uwase",
    email: "chantal.uwase@indanga.test",
    phoneNumber: "+250788000003",
    nationalId: "1197770030000003",
    role: "LANDLORD" as const,
    emailVerified: true,
    image: "https://i.pravatar.cc/300?img=45",
  },
  {
    id: "seed-tenant-001",
    name: "Eric Ndayishimiye",
    email: "eric.ndayishimiye@indanga.test",
    phoneNumber: "+250788000004",
    nationalId: "1196660040000004",
    role: "TENANT" as const,
    emailVerified: true,
    image: "https://i.pravatar.cc/300?img=11",
  },
  {
    id: "seed-tenant-002",
    name: "Olive Nyirahabimana",
    email: "olive.nyirahabimana@indanga.test",
    phoneNumber: "+250788000005",
    nationalId: "1195550050000005",
    role: "TENANT" as const,
    emailVerified: false,
    image: "https://i.pravatar.cc/300?img=49",
  },
  {
    id: "seed-tenant-003",
    name: "Patrick Rukundo",
    email: "patrick.rukundo@indanga.test",
    phoneNumber: "+250788000006",
    nationalId: "1194440060000006",
    role: "TENANT" as const,
    emailVerified: true,
    image: "https://i.pravatar.cc/300?img=14",
  },
];

const houses = [
  {
    id: "seed-house-001",
    name: "Modern Apartment in Kimihurura",
    location: "Kimihurura, Kigali",
    address: "KG 670 St, Kimihurura, Kigali",
    price: 450000,
    media: [
      "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerId: "seed-landlord-001",
    description:
      "A bright two-bedroom apartment close to restaurants, offices, and public transport.",
    propertyType: "Apartment",
    bedrooms: 2,
    bathrooms: 2,
    status: "AVAILABLE" as const,
  },
  {
    id: "seed-house-002",
    name: "Family Home in Kacyiru",
    location: "Kacyiru, Kigali",
    address: "KG 548 St, Kacyiru, Kigali",
    price: 850000,
    media: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerId: "seed-landlord-001",
    description: "Spacious three-bedroom family house with a private garden and secure parking.",
    propertyType: "House",
    bedrooms: 3,
    bathrooms: 3,
    status: "BOOKED" as const,
  },
  {
    id: "seed-house-003",
    name: "Furnished Studio near Convention Centre",
    location: "Gishushu, Kigali",
    address: "KG 5 Ave, Gishushu, Kigali",
    price: 320000,
    media: [
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerId: "seed-landlord-002",
    description:
      "A fully furnished studio ideal for a professional looking for a convenient Kigali base.",
    propertyType: "Studio",
    bedrooms: 1,
    bathrooms: 1,
    status: "AVAILABLE" as const,
  },
  {
    id: "seed-house-004",
    name: "Quiet Two-Bedroom in Remera",
    location: "Remera, Kigali",
    address: "KN 5 Rd, Remera, Kigali",
    price: 380000,
    media: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
    ],
    ownerId: "seed-landlord-002",
    description:
      "Comfortable two-bedroom home in a peaceful neighbourhood, minutes from Kigali Arena.",
    propertyType: "House",
    bedrooms: 2,
    bathrooms: 2,
    status: "AVAILABLE" as const,
  },
];

async function upsertById<T extends { id: string }>(
  records: T[],
  upsert: (record: T) => Promise<unknown>,
) {
  await Promise.all(records.map(upsert));
}

async function seed() {
  await upsertById(users, (user) =>
    prisma.user.upsert({
      where: { id: user.id },
      update: { ...user, password: PASSWORD_HASH, status: "ACTIVE" },
      create: { ...user, password: PASSWORD_HASH, status: "ACTIVE" },
    }),
  );

  await upsertById(houses, (house) =>
    prisma.house.upsert({ where: { id: house.id }, update: house, create: house }),
  );

  await prisma.booking.upsert({
    where: { id: "seed-booking-001" },
    update: { clientId: "seed-tenant-001", houseId: "seed-house-002" },
    create: { id: "seed-booking-001", clientId: "seed-tenant-001", houseId: "seed-house-002" },
  });
  await prisma.booking.upsert({
    where: { id: "seed-booking-002" },
    update: { clientId: "seed-tenant-002", houseId: "seed-house-003" },
    create: { id: "seed-booking-002", clientId: "seed-tenant-002", houseId: "seed-house-003" },
  });

  await upsertById(
    [
      {
        id: "seed-payment-001",
        amount: "850000.00",
        bookingId: "seed-booking-001",
        status: "COMPLETED" as const,
        method: "Mobile Money",
        transactionReference: "MM-IND-000001",
      },
      {
        id: "seed-payment-002",
        amount: "320000.00",
        bookingId: "seed-booking-002",
        status: "PENDING" as const,
        method: "Bank Transfer",
        transactionReference: "BT-IND-000002",
      },
    ],
    (payment) =>
      prisma.payment.upsert({ where: { id: payment.id }, update: payment, create: payment }),
  );

  await upsertById(
    [
      {
        id: "seed-review-001",
        houseId: "seed-house-001",
        tenantId: "seed-tenant-001",
        rating: 5,
        comment: "Clean, comfortable, and perfectly located for work in Kigali.",
      },
      {
        id: "seed-review-002",
        houseId: "seed-house-002",
        tenantId: "seed-tenant-003",
        rating: 4,
        comment: "Great family home with a responsive landlord.",
      },
    ],
    (review) => prisma.review.upsert({ where: { id: review.id }, update: review, create: review }),
  );

  await upsertById(
    [
      { id: "seed-favorite-001", houseId: "seed-house-001", userId: "seed-tenant-002" },
      { id: "seed-favorite-002", houseId: "seed-house-004", userId: "seed-tenant-001" },
      { id: "seed-favorite-003", houseId: "seed-house-003", userId: "seed-tenant-003" },
    ],
    (favorite) =>
      prisma.favorite.upsert({ where: { id: favorite.id }, update: favorite, create: favorite }),
  );

  await prisma.session.upsert({
    where: { id: "seed-session-001" },
    update: {
      token: "seed-session-token-eric",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      userId: "seed-tenant-001",
      ipAddress: "127.0.0.1",
      userAgent: "Indanga seed client",
    },
    create: {
      id: "seed-session-001",
      token: "seed-session-token-eric",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
      userId: "seed-tenant-001",
      ipAddress: "127.0.0.1",
      userAgent: "Indanga seed client",
    },
  });
  await prisma.account.upsert({
    where: { id: "seed-account-001" },
    update: {
      accountId: "seed-tenant-001",
      providerId: "credential",
      userId: "seed-tenant-001",
      password: PASSWORD_HASH,
    },
    create: {
      id: "seed-account-001",
      accountId: "seed-tenant-001",
      providerId: "credential",
      userId: "seed-tenant-001",
      password: PASSWORD_HASH,
    },
  });
  await prisma.verification.upsert({
    where: { id: "seed-verification-001" },
    update: {
      identifier: "olive.nyirahabimana@indanga.test",
      value: "seed-email-verification-token",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
    },
    create: {
      id: "seed-verification-001",
      identifier: "olive.nyirahabimana@indanga.test",
      value: "seed-email-verification-token",
      expiresAt: new Date("2030-01-01T00:00:00.000Z"),
    },
  });
  await prisma.twoFactor.upsert({
    where: { id: "seed-two-factor-001" },
    update: {
      secret: "JBSWY3DPEHPK3PXP",
      backupCodes: '["INDANGA-BACKUP-001","INDANGA-BACKUP-002"]',
      userId: "seed-admin-001",
      verified: true,
    },
    create: {
      id: "seed-two-factor-001",
      secret: "JBSWY3DPEHPK3PXP",
      backupCodes: '["INDANGA-BACKUP-001","INDANGA-BACKUP-002"]',
      userId: "seed-admin-001",
      verified: true,
    },
  });

  console.log(
    "Seeded 6 users, 4 houses, 2 bookings, 2 payments, 2 reviews, 3 favorites, and auth support records.",
  );
}

seed()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
