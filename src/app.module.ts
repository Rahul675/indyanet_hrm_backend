import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { EmployeesModule } from './employees/employees.module';
import { LeaveModule } from './leave/leave.module';
import { PayrollModule } from './payroll/payroll.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { InsuranceModule } from './insurance/insurance.module';
import { AttendanceModule } from './attendance/attendance.module'; // ✅ Add this

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    EmployeesModule,
    LeaveModule,
    PayrollModule,
    InsuranceModule,
    DashboardModule,
    AttendanceModule, // ✅ Add this line
  ],
  providers: [PrismaService],
})
export class AppModule {}
