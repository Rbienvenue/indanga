import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import {
  AdminBookingsFilterDto,
  AdminPaymentsFilterDto,
  AdminPropertiesFilterDto,
  AdminReviewsFilterDto,
  AdminUsersFilterDto,
} from "./dtos";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function bucketRevenueByMonth(payments: { amount: Prisma.Decimal; createdAt: Date }[]) {
  const totals = Array.from({ length: 12 }, () => 0);

  for (const payment of payments) {
    totals[payment.createdAt.getMonth()] += payment.amount.toNumber();
  }

  return MONTH_LABELS.map((month, index) => ({
    month,
    revenue: totals[index] ?? 0,
  }));
}

@Injectable()
export class AdminService {
  constructor(private readonly db: PrismaService) {}

  async getUsers(data: AdminUsersFilterDto) {
    const { page = 1, limit = 20, search, role } = data;
    const where: Prisma.UserWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phoneNumber: { contains: search, mode: "insensitive" } },
        { nationalId: { contains: search, mode: "insensitive" } },
      ];
    }
    if (role) where.role = role;

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phoneNumber: true,
          nationalId: true,
          role: true,
          image: true,
          status: true,
          banned: true,
          banReason: true,
          banExpires: true,
          emailVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getStats() {
    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const [
      totalUsers,
      totalTenants,
      totalLandlords,
      totalProperties,
      totalBookings,
      pendingBookings,
      approvedBookings,
      revenueResult,
      yearPayments,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.user.count({ where: { role: "tenant" } }),
      this.db.user.count({ where: { role: "landlord" } }),
      this.db.house.count(),
      this.db.booking.count(),
      this.db.booking.count({ where: { status: "PENDING" } }),
      this.db.booking.count({ where: { status: "APPROVED" } }),
      this.db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
      }),
      this.db.payment.findMany({
        where: { status: "COMPLETED", createdAt: { gte: startOfYear } },
        select: { amount: true, createdAt: true },
      }),
    ]);

    return {
      totalUsers,
      totalTenants,
      totalLandlords,
      totalProperties,
      totalBookings,
      pendingBookings,
      approvedBookings,
      totalRevenue: revenueResult._sum.amount?.toNumber() ?? 0,
      revenueByMonth: bucketRevenueByMonth(yearPayments),
    };
  }

  async getBookings(data: AdminBookingsFilterDto) {
    const { page = 1, limit = 20, status } = data;
    const where: Prisma.BookingWhereInput = {};
    if (status) where.status = status;

    const [bookings, total] = await Promise.all([
      this.db.booking.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          house: true,
          client: true,
        },
      }),
      this.db.booking.count({ where }),
    ]);

    return {
      data: bookings,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPayments(data: AdminPaymentsFilterDto) {
    const { page = 1, limit = 20, status } = data;
    const where: Prisma.PaymentWhereInput = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      this.db.payment.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          booking: {
            include: { house: true, client: true },
          },
        },
      }),
      this.db.payment.count({ where }),
    ]);

    return {
      data: payments,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getReviews(data: AdminReviewsFilterDto) {
    const { page = 1, limit = 20, houseId } = data;
    const where: Prisma.ReviewWhereInput = {};
    if (houseId) where.houseId = houseId;

    const [reviews, total] = await Promise.all([
      this.db.review.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          house: true,
          tenant: true,
        },
      }),
      this.db.review.count({ where }),
    ]);

    return {
      data: reviews,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getProperties(data: AdminPropertiesFilterDto) {
    const { page = 1, limit = 20, search, status } = data;
    const where: Prisma.HouseWhereInput = {};

    if (search) where.name = { startsWith: search, mode: "insensitive" };
    if (status) where.status = status;

    const [properties, total] = await Promise.all([
      this.db.house.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          owner: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      this.db.house.count({ where }),
    ]);

    return {
      data: properties,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async publishProperty(id: string) {
    const property = await this.getProperty(id);
    if (property.status !== "PENDING") {
      throw new BadRequestException("Only pending properties can be published");
    }

    return this.db.house.update({
      where: { id },
      data: { status: "AVAILABLE" },
    });
  }

  async unpublishProperty(id: string) {
    const property = await this.getProperty(id);
    if (property.status === "BOOKED") {
      throw new BadRequestException("Booked properties cannot be unpublished");
    }
    if (property.status !== "AVAILABLE") {
      throw new BadRequestException("Only available properties can be unpublished");
    }

    return this.db.house.update({
      where: { id },
      data: { status: "PENDING" },
    });
  }

  async deleteProperty(id: string) {
    await this.getProperty(id);
    return this.db.house.delete({ where: { id } });
  }

  async deleteReview(id: string) {
    const review = await this.db.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException("Review not found");
    }
    return this.db.review.delete({ where: { id } });
  }

  private async getProperty(id: string) {
    const property = await this.db.house.findUnique({ where: { id } });
    if (!property) {
      throw new NotFoundException("Property not found");
    }
    return property;
  }
}
