import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import type { FilterReportsDto, ReviewReportDto } from "./dtos";

@Injectable()
export class ReportsService {
  constructor(private readonly db: PrismaService) {}
  async create(houseId: string, reporterId: string, reason: string) {
    const house = await this.db.house.findUnique({
      where: { id: houseId },
      select: { name: true },
    });
    if (!house) throw new NotFoundException("Listing not found");
    const existing = await this.db.listingReport.findFirst({
      where: { houseId, reporterId, status: "OPEN" },
    });
    if (existing) throw new ConflictException("You already have an open report for this listing");
    return this.db.listingReport.create({
      data: { houseId, listingName: house.name, reporterId, reason },
    });
  }
  async list({ page = 1, limit = 20, status }: FilterReportsDto) {
    const where = status ? { status } : {};
    const [data, total] = await Promise.all([
      this.db.listingReport.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { reporter: { select: { name: true, email: true } } },
      }),
      this.db.listingReport.count({ where }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
  async review(id: string, reviewedBy: string, data: ReviewReportDto) {
    const changed = await this.db.listingReport.updateMany({
      where: { id, status: "OPEN" },
      data: { ...data, reviewedBy, reviewedAt: new Date() },
    });
    if (!changed.count) throw new ConflictException("Report not found or already reviewed");
    return this.db.listingReport.findUniqueOrThrow({ where: { id } });
  }
}
