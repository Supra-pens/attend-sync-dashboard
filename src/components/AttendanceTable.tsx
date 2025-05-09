
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AttendanceRecord, Employee, calculateAttendanceSummary } from "@/lib/googleSheetsService";

interface AttendanceTableProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  date: Date;
}

export function AttendanceTable({ 
  employees, 
  attendanceRecords, 
  date 
}: AttendanceTableProps) {
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  
  // Format date to DD-MM-YY
  const formattedDate = date.toLocaleDateString('en-GB', { 
    day: '2-digit', 
    month: '2-digit', 
    year: '2-digit' 
  }).replace(/\//g, '-');
  
  // Filter records for the selected date
  const filteredRecords = attendanceRecords.filter(r => r.date === formattedDate);
  
  // Get employees with attendance data for the day
  const employeesWithAttendance = employees.map(employee => {
    const record = filteredRecords.find(r => r.employeeId === employee.id);
    const summary = calculateAttendanceSummary(attendanceRecords, employee.id);
    
    return {
      ...employee,
      attendance: record,
      summary
    };
  });
  
  // Calculate pagination
  const totalPages = Math.ceil(employeesWithAttendance.length / rowsPerPage);
  const paginatedEmployees = employeesWithAttendance.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );
  
  const getStatusBadge = (status: string) => {
    return status === "PAYROLLED" ? (
      <Badge className="bg-status-payrolled">Payrolled</Badge>
    ) : (
      <Badge className="bg-status-nonpayrolled">Non-Payrolled</Badge>
    );
  };
  
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>In Time</TableHead>
            <TableHead>Out Time</TableHead>
            <TableHead>Working Hours</TableHead>
            <TableHead>Overtime</TableHead>
            <TableHead className="text-center">Present</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedEmployees.map((employee) => {
            const record = employee.attendance;
            
            return (
              <TableRow key={employee.id}>
                <TableCell className="font-medium">{employee.name}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="cursor-default">
                        {employee.department}
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{employee.department}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </TableCell>
                <TableCell>{getStatusBadge(employee.status)}</TableCell>
                <TableCell>{record?.inTime || "—"}</TableCell>
                <TableCell>{record?.outTime || "—"}</TableCell>
                <TableCell>{record?.workingHours || "—"}</TableCell>
                <TableCell>{record?.overtime !== "00:00" ? record?.overtime : "—"}</TableCell>
                <TableCell className="text-center">
                  {record?.isPresent ? (
                    <Badge className="bg-green-500">Present</Badge>
                  ) : (
                    <Badge variant="destructive">Absent</Badge>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          {paginatedEmployees.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-4">
                No attendance records for this date.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
