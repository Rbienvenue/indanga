import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Prisma } from "@indanga/db";
import { PrismaService } from "src/prisma/prisma.service";
import { StorageBucket, StorageService } from "src/storage/storage.service";
import { NotificationsService } from "src/notifications/notifications.service";
import { env } from "src/lib/env";
import { GetKycDto } from "./dtos";
import { formatNidaResponse } from "./nida";

export const kycUserSelect = {
  id: true,
  name: true,
  email: true,
  phoneNumber: true,
  nationalId: true,
  role: true,
  image: true,
  kycStatus: true,
  kycRejectionReason: true,
  kycSubmittedAt: true,
  kycReviewedAt: true,
  createdAt: true,
  updatedAt: true,
  kycDocuments: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class KycService {
  constructor(
    private readonly db: PrismaService,
    private readonly storageService: StorageService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async submitKyc(
    userId: string,
    files: { ID_DOCUMENT?: Express.Multer.File[] },
  ) {
    const file = files?.ID_DOCUMENT?.[0];
    if (!file) {
      throw new BadRequestException("ID document is required");
    }

    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, kycStatus: true },
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    if (user.kycStatus === "PENDING") {
      throw new BadRequestException("verification already in progress");
    }
    if (user.kycStatus === "APPROVED") {
      throw new BadRequestException("already verified");
    }

    const uploaded = await this.storageService.uploadFile(file.buffer, {
      bucket: StorageBucket.DOCUMENTS,
    });

    const existing = await this.db.kycDocument.findUnique({
      where: { userId_type: { userId, type: "ID_DOCUMENT" } },
    });

    const result = await this.db.$transaction(async (tx) => {
      const document = await tx.kycDocument.upsert({
        where: { userId_type: { userId, type: "ID_DOCUMENT" } },
        create: {
          userId,
          type: "ID_DOCUMENT",
          url: uploaded.url,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        },
        update: {
          url: uploaded.url,
          mimeType: uploaded.mimeType,
          size: uploaded.size,
        },
      });
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: {
          kycStatus: "PENDING",
          kycSubmittedAt: new Date(),
          kycRejectionReason: null,
        },
        select: kycUserSelect,
      });
      return { user: updatedUser, document };
    });

    if (existing) {
      const oldKey = this.keyFromUrl(existing.url);
      if (oldKey && oldKey !== this.keyFromUrl(uploaded.url)) {
        await this.storageService.deleteFile(oldKey).catch(() => undefined);
      }
    }

    const admins = await this.db.user.findMany({
      where: { role: "admin" },
      select: { id: true },
    });
    await Promise.all(
      admins.map((admin) =>
        this.notificationsService.create({
          userId: admin.id,
          type: "SYSTEM",
          title: "New KYC Verification submitted",
          message: `${user.name} submitted their KYC document for review.`,
        }),
      ),
    );

    return result;
  }

  async getMyKyc(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: kycUserSelect,
    });
    if (!user) {
      throw new NotFoundException("User not found");
    }
    return user;
  }

  async listKyc(data: GetKycDto) {
    const { page = 1, limit = 20, search, status } = data;
    const where: Prisma.UserWhereInput = { role: "landlord", kycDocuments: { some: {} }, };
    if (status) where.kycStatus = status;
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { nationalId: { contains: search, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      this.db.user.findMany({
        where,
        orderBy: { kycSubmittedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: kycUserSelect,
      }),
      this.db.user.count({ where }),
    ]);

    return {
      data: users,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getKycByUserId(userId: string) {
    const user = await this.db.user.findUnique({
      where: { id: userId },
      select: kycUserSelect,
    });
    if (!user || user.role !== "landlord") {
      throw new NotFoundException("Agent not found");
    }
    return user;
  }

  async approveKyc(userId: string) {
    const user = await this.getKycByUserId(userId);
    if (user.kycStatus !== "PENDING") {
      throw new BadRequestException("Only pending applications can be approved");
    }

    const updated = await this.db.user.update({
      where: { id: userId },
      data: { kycStatus: "APPROVED", kycReviewedAt: new Date() },
      select: kycUserSelect,
    });

    await this.notificationsService.create({
      userId,
      type: "SYSTEM",
      title: "Verification approved",
      message: "Your verification was approved. You can now manage properties.",
    });

    return updated;
  }

  async rejectKyc(userId: string, reason: string) {
    const user = await this.getKycByUserId(userId);
    if (user.kycStatus !== "PENDING" && user.kycStatus !== "APPROVED") {
      throw new BadRequestException("Only pending or approved applications can be rejected");
    }

    const updated = await this.db.user.update({
      where: { id: userId },
      data: {
        kycStatus: "REJECTED",
        kycReviewedAt: new Date(),
        kycRejectionReason: reason,
      },
      select: kycUserSelect,
    });

    await this.notificationsService.create({
      userId,
      type: "SYSTEM",
      title: "Verification rejected",
      message: reason,
    });

    return updated;
  }

  async verifyNationalId(id: string) {
    const response = await fetch(`${env.NIDA_API_URL}/${id}`);
    console.log(response)
    if (response.status === 500) {
      throw new ServiceUnavailableException("nida service is unavailable");
    }
    if (!response.ok) {
      throw new NotFoundException("national id is invalid");
    }
    return formatNidaResponse(await response.json());
  }

  private keyFromUrl(url: string): string | null {
    const prefix = `${env.STORAGE_URL}/`;
    if (url.startsWith(prefix)) return url.slice(prefix.length);
    return null;
  }
}
