import { Controller, Get, Post, Res, UseGuards, NotFoundException } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../auth/current-user.decorator';
import express from 'express';

@Controller('attendance')
@UseGuards(AuthGuard('jwt'))
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /**
   * 🟢 Check In
   * - Creates a new attendance record (even if previous exists)
   */
  @Post('checkin')
  async checkIn(@CurrentUser() user: any) {
    return this.attendanceService.checkIn(user.employeeId);
  }

  /**
   * 🔴 Check Out
   * - Closes the most recent open attendance record
   */
  @Post('checkout')
  
  async checkOut(@CurrentUser() user: any) {
    return this.attendanceService.checkOut(user.employeeId);
  }

  /**
   * 💾 Backup Attendance (Admin)
   */
  @Get('backup')
  async downloadBackup(@Res() res: express.Response) {
    try {
      const { filePath } = await this.attendanceService.backupAttendance();

      // Use Express's res.download() — ensure you import Response from 'express'
      return res.download(filePath);
    } catch (err) {
      console.error('Error during backup:', err);
      throw new NotFoundException('Error creating or downloading backup');
    }
  }

  /**
   * 📅 Get all sessions for today
   */
  @Get('today')
  async getTodayAttendance(@CurrentUser() user: any) {
    return this.attendanceService.getTodayAttendance(user.employeeId);
  }

  @Get('today/all')
  async getAllTodayAttendance() {
    return this.attendanceService.getAllTodayAttendance();
  }
}
