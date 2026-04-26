import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { StorageService } from '../../common/services/storage.service';
import {
  BugReportKind,
  BugReportStatus,
} from '@prisma/client';

const MAX_IMAGES = 4;
const MAX_BODY_LEN = 5000;
const MAX_SUBJECT_LEN = 200;

@Injectable()
export class BugReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: StorageService,
  ) {}

  /**
   * Resolve every image key on a report into a fresh presigned URL. Run in
   * parallel for snappy renders. Failures fall back to null so a single bad
   * key doesn't break the whole row.
   */
  private async withImageUrls<T extends { imageKeys: string[] }>(
    report: T,
  ): Promise<T & { imageUrls: (string | null)[] }> {
    const imageUrls = await Promise.all(
      report.imageKeys.map((k) => this.storage.resolveImageUrl(k)),
    );
    return { ...report, imageUrls };
  }

  // ─── User actions ─────────────────────────────────────────────────────────

  async create(
    userId: string,
    input: {
      kind: BugReportKind;
      subject: string;
      body: string;
    },
    images: Array<{ buffer: Buffer; originalname: string; mimetype: string }> = [],
  ) {
    const subject = input.subject?.trim();
    const body = input.body?.trim();
    if (!subject) throw new BadRequestException('Subject is required');
    if (!body) throw new BadRequestException('Description is required');
    if (subject.length > MAX_SUBJECT_LEN) {
      throw new BadRequestException(`Subject must be ${MAX_SUBJECT_LEN} characters or fewer`);
    }
    if (body.length > MAX_BODY_LEN) {
      throw new BadRequestException(`Description must be ${MAX_BODY_LEN} characters or fewer`);
    }
    if (images.length > MAX_IMAGES) {
      throw new BadRequestException(`Attach at most ${MAX_IMAGES} images`);
    }

    // Upload all images first; if any fail, we abort before creating the row
    // so we don't end up with a half-attached report.
    const imageKeys: string[] = [];
    for (const file of images) {
      if (!file.mimetype?.startsWith('image/')) {
        throw new BadRequestException('Attachments must be images');
      }
      const { filePath } = await this.storage.uploadFile(file, 'bug-reports');
      imageKeys.push(filePath);
    }

    const created = await this.prisma.bugReport.create({
      data: {
        userId,
        kind: input.kind,
        subject,
        body,
        imageKeys,
      },
    });
    return this.withImageUrls(created);
  }

  async listMine(userId: string) {
    const reports = await this.prisma.bugReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return Promise.all(reports.map((r) => this.withImageUrls(r)));
  }

  async findOne(id: string, userId: string) {
    const report = await this.prisma.bugReport.findUnique({ where: { id } });
    if (!report) throw new NotFoundException();
    if (report.userId !== userId) throw new ForbiddenException();
    return this.withImageUrls(report);
  }

  // ─── Admin actions ────────────────────────────────────────────────────────

  async listAll(params: {
    kind?: BugReportKind;
    status?: BugReportStatus;
    cursor?: string;
    limit?: number;
  } = {}) {
    const limit = Math.min(Math.max(params.limit ?? 50, 1), 200);
    const items = await this.prisma.bugReport.findMany({
      where: {
        ...(params.kind ? { kind: params.kind } : {}),
        ...(params.status ? { status: params.status } : {}),
      },
      take: limit + 1,
      ...(params.cursor ? { skip: 1, cursor: { id: params.cursor } } : {}),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true, accountType: true } },
      },
    });
    const hasMore = items.length > limit;
    const rows = hasMore ? items.slice(0, limit) : items;
    const withUrls = await Promise.all(rows.map((r) => this.withImageUrls(r)));
    return {
      reports: withUrls,
      nextCursor: hasMore ? rows[rows.length - 1]?.id ?? null : null,
    };
  }

  async adminFindOne(id: string) {
    const report = await this.prisma.bugReport.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, accountType: true, country: true } },
      },
    });
    if (!report) throw new NotFoundException();
    return this.withImageUrls(report);
  }

  /**
   * Admin reply to a report. Stores the reply text + flips status to REPLIED
   * + records who replied. Idempotent in the sense that re-replying just
   * overwrites — keep it simple, no thread.
   *
   * `adminId` may be null when the actor is the env-bootstrap super admin
   * (no DB row); we persist null in that case rather than fabricating an id.
   */
  async adminReply(id: string, adminId: string | null, reply: string) {
    const text = reply?.trim();
    if (!text) throw new BadRequestException('Reply cannot be empty');
    if (text.length > MAX_BODY_LEN) {
      throw new BadRequestException(`Reply must be ${MAX_BODY_LEN} characters or fewer`);
    }
    const existing = await this.prisma.bugReport.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException();

    const updated = await this.prisma.bugReport.update({
      where: { id },
      data: {
        adminReply: text,
        repliedAt: new Date(),
        repliedByAdminId: adminId,
        status: BugReportStatus.REPLIED,
      },
      // Include user so the response shape matches adminFindOne() — the
      // detail page renders the same component for both flows and crashes
      // if `user` is missing here.
      include: {
        user: { select: { id: true, name: true, email: true, accountType: true, country: true } },
      },
    });
    return this.withImageUrls(updated);
  }

  async adminClose(id: string) {
    const updated = await this.prisma.bugReport.update({
      where: { id },
      data: { status: BugReportStatus.CLOSED },
      include: {
        user: { select: { id: true, name: true, email: true, accountType: true, country: true } },
      },
    });
    return this.withImageUrls(updated);
  }

  /** Lightweight count groupings for the admin TabFilter badges. */
  async adminCounts() {
    const groups = await this.prisma.bugReport.groupBy({
      by: ['status'],
      _count: { _all: true },
    });
    const counts: Record<BugReportStatus, number> = {
      OPEN: 0,
      REPLIED: 0,
      CLOSED: 0,
    };
    groups.forEach((g) => {
      counts[g.status] = g._count._all;
    });
    return counts;
  }
}
