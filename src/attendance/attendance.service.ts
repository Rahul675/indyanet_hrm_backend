import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { promises as fs } from 'fs';
import path from 'path/win32';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  /**
   * ✅ Allows multiple check-ins per day
   * - Each call creates a new attendance session
   */
  async checkIn(employeeId: string) {
    if (!employeeId) throw new BadRequestException('Invalid employee');

    // Simply create a new session entry
    return this.prisma.attendance.create({
      data: {
        employeeId,
        checkInTime: new Date(),
        date: new Date(), // keep today's date for grouping
        year: new Date().getFullYear(),
      },
    });
  }

  /**
   * ✅ Check-out logic:
   * - Finds the latest open (un-checked-out) session for this employee
   * - Updates it with the current time
   */
  async checkOut(employeeId: string) {
    if (!employeeId) throw new BadRequestException('Invalid employee');

    // Find the most recent record without a checkout
    const lastRecord = await this.prisma.attendance.findFirst({
      where: { employeeId, checkOutTime: null },
      orderBy: { checkInTime: 'desc' },
    });

    if (!lastRecord) {
      throw new NotFoundException(
        'No active check-in found. Please check in first.',
      );
    }

    return this.prisma.attendance.update({
      where: { id: lastRecord.id },
      data: { checkOutTime: new Date() },
    });
  }

  /**
   * ✅ Backup attendance records by year
   */
  async backupAttendance() {
    const year = new Date().getFullYear();
    const data = await this.prisma.attendance.findMany({ where: { year } });

    if (!data.length) {
      throw new NotFoundException('No attendance data to backup');
    }

    const uploadDir = path.resolve('uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const filePath = path.join(uploadDir, `attendance_${year}.json`);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));

    await this.prisma.attendanceBackup.create({
      data: { year, fileUrl: filePath },
    });

    // optional: remove this for safety
    // await this.prisma.attendance.deleteMany({ where: { year } });

    return { filePath };
  }

  /**
   * ✅ Returns all check-in/out records for today (for dashboard display)
   */
  async getTodayAttendance(employeeId: string) {
    
    if (!employeeId) throw new BadRequestException('Invalid employee');
  
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  
    return this.prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      orderBy: { checkInTime: 'asc' },
    });
  }
  
  async getAllTodayAttendance() {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
  
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);
  
    return this.prisma.attendance.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        employeeId: true,
        date: true,
        checkInTime: true,
        checkOutTime: true,
        status: true,
      },
      orderBy: { checkInTime: 'asc' },
    });
  }
  }
