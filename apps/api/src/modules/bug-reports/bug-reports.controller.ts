import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { BugReportsService } from './bug-reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BugReportKind, User } from '@prisma/client';

class CreateBugReportDto {
  kind!: BugReportKind;
  subject!: string;
  body!: string;
}

@Controller('bug-reports')
@UseGuards(JwtAuthGuard)
export class BugReportsController {
  constructor(private readonly bugReports: BugReportsService) {}

  /**
   * Submit a bug report or improvement suggestion. Accepts up to 4 image
   * attachments via multipart/form-data ("images" field). The form fields
   * (kind, subject, body) come through as flat strings on the body.
   */
  @Post()
  @UseInterceptors(FilesInterceptor('images', 4))
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateBugReportDto,
    @UploadedFiles() images: Array<{ buffer: Buffer; originalname: string; mimetype: string }> = [],
  ) {
    return this.bugReports.create(
      user.id,
      { kind: dto.kind, subject: dto.subject, body: dto.body },
      images ?? [],
    );
  }

  @Get('mine')
  listMine(@CurrentUser() user: User) {
    return this.bugReports.listMine(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id') id: string) {
    return this.bugReports.findOne(id, user.id);
  }
}
