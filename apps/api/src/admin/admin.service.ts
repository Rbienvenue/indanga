import { Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import {
  AdminBookingsFilterDto,
  AdminPaymentsFilterDto,
  AdminReviewsFilterDto,
} from "./dtos";

@Injectable()
export class AdminService {
  constructor(private readonly db: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalTenants,
      totalLandlords,
      totalProperties,
      totalBookings,
      pendingBookings,
      approvedBookings,
      revenueResult,
    ] = await Promise.all([
      this.db.user.count(),
      this.db.user.count({ where: { role: "TENANT" } }),
      this.db.user.count({ where: { role: "LANDLORD" } }),
      this.db.house.count(),
      this.db.booking.count(),
      this.db.booking.count({ where: { status: "PENDING" } }),
      this.db.booking.count({ where: { status: "APPROVED" } }),
      this.db.payment.aggregate({
        _sum: { amount: true },
        where: { status: "COMPLETED" },
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

  async deleteReview(id: string) {
    const review = await this.db.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException("Review not found");
    }
    return this.db.review.delete({ where: { id } });
  }
}
