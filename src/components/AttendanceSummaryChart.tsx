
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AttendanceRecord, Employee } from "@/lib/googleSheetsService";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

interface AttendanceSummaryChartProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  className?: string;
}

export function AttendanceSummaryChart({ 
  employees, 
  attendanceRecords,
  className
}: AttendanceSummaryChartProps) {
  // Get unique departments
  const departments = [...new Set(employees.map(e => e.department))];
  
  // Get data for current month by department
  const data = departments.map(department => {
    const departmentEmployees = employees.filter(e => e.department === department);
    const departmentRecords = attendanceRecords.filter(record => {
      const employee = employees.find(e => e.id === record.employeeId);
      return employee && employee.department === department;
    });
    
    const presentCount = departmentRecords.filter(r => r.isPresent).length;
    const absentCount = departmentEmployees.length * 30 - presentCount; // Approximation
    const lateCount = departmentRecords.filter(r => r.isLate).length;
    
    // Short department name for display
    let shortName = department.split(' ')[0];
    if (shortName.length > 8) {
      shortName = shortName.substring(0, 8);
    }
    
    return {
      department: shortName,
      present: presentCount,
      absent: absentCount,
      late: lateCount
    };
  });
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Monthly Department Summary</CardTitle>
        <CardDescription>
          Attendance metrics by department for the current month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="department" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="present" fill="#4ade80" name="Present" />
            <Bar dataKey="absent" fill="#f87171" name="Absent" />
            <Bar dataKey="late" fill="#fbbf24" name="Late" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
