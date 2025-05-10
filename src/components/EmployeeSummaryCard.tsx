
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Employee, AttendanceRecord, calculateAttendanceSummary } from "@/lib/googleSheetsService";
import { Clock } from "lucide-react";

interface EmployeeSummaryCardProps {
  employee: Employee;
  attendanceRecords: AttendanceRecord[];
}

export function EmployeeSummaryCard({ 
  employee, 
  attendanceRecords 
}: EmployeeSummaryCardProps) {
  const summary = calculateAttendanceSummary(attendanceRecords, employee.id);
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle>{employee.name}</CardTitle>
          {employee.status === "PAYROLLED" ? (
            <Badge className="bg-status-payrolled">Payrolled</Badge>
          ) : (
            <Badge className="bg-status-nonpayrolled">Non-Payrolled</Badge>
          )}
        </div>
        <CardDescription className="truncate">{employee.department}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Days Present</p>
            <p className="text-2xl font-semibold text-blue-600">{summary.daysPresent}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Absents</p>
            <p className="text-2xl font-semibold text-red-600">{summary.absents}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Late Days</p>
            <p className="text-2xl font-semibold text-amber-600">{summary.lateDays}</p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Overtime</p>
            <p className="text-lg font-semibold text-emerald-600">{summary.overtime}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Sundays Impacted</p>
            <p className="text-lg font-semibold text-purple-600">{summary.sundaysImpacted}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Balance</p>
            <p className={`text-lg font-semibold ${summary.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {summary.balance >= 0 ? `+${summary.balance}` : summary.balance}
            </p>
          </div>
        </div>

        <Separator className="my-4" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Allocated Hours</p>
              <p className="text-lg font-semibold text-blue-600">{employee.allocatedHours || "N/A"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Shift Start</p>
              <p className="text-lg font-semibold text-blue-600">{employee.shiftStart || "N/A"}</p>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          Joined: {employee.doj}
        </p>
      </CardFooter>
    </Card>
  );
}
