// This is a simplified version of Google Sheets API integration
// In a real application, you would use OAuth2 authentication

import { useQuery } from "@tanstack/react-query";

// Types for our attendance data
export interface Employee {
  id: string;
  name: string;
  department: string;
  status: 'PAYROLLED' | 'NON-PAYROLLED';
  doj: string; // Date of joining
  allocatedHours: string; // allocated hours for the employee
  shiftStart: string; // shift start time
  shiftEnd: string; // shift end time
}

export interface AttendanceRecord {
  employeeId: string;
  date: string;
  inTime: string;
  outTime: string;
  isPresent: boolean;
  isLate: boolean;
  isHoliday: boolean;
  isSunday: boolean;
  workingHours: string;
  overtime: string;
}

export interface DepartmentSummary {
  name: string;
  totalEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
}

// Mock data for development - this would be replaced by actual API calls
const mockEmployees: Employee[] = [
  { 
    id: "1", 
    name: "PALASH BAR", 
    department: "MOULDING DEPT. (A & B SHIFT)", 
    status: "PAYROLLED", 
    doj: "13-06-2023",
    allocatedHours: "08:30",
    shiftStart: "10:00",
    shiftEnd: "18:30"
  },
  { 
    id: "2", 
    name: "SUBINAY NASKAR", 
    department: "FOILING & HOT STAMPING DEPT. DAY SHIFT", 
    status: "PAYROLLED", 
    doj: "04-06-2024",
    allocatedHours: "08:30",
    shiftStart: "10:10",
    shiftEnd: "18:40"
  },
  { 
    id: "3", 
    name: "PRIYA SHARMA", 
    department: "REFILLING DEPT.", 
    status: "NON-PAYROLLED", 
    doj: "23-03-2024",
    allocatedHours: "08:00",
    shiftStart: "09:00",
    shiftEnd: "17:00"
  },
  { 
    id: "4", 
    name: "AMIT SINGH", 
    department: "EXTRUSION DEPT. (A & B SHIFT)", 
    status: "PAYROLLED", 
    doj: "05-08-2023",
    allocatedHours: "09:00",
    shiftStart: "11:00",
    shiftEnd: "20:00"
  },
  { 
    id: "5", 
    name: "NEHA GUPTA", 
    department: "PEN ASSEMBLING DEPT.", 
    status: "PAYROLLED", 
    doj: "17-11-2023",
    allocatedHours: "07:30",
    shiftStart: "10:30",
    shiftEnd: "18:00"
  },
  { 
    id: "6", 
    name: "SURESH PATEL", 
    department: "DESPATCH DEPT. DAY SHIFT", 
    status: "PAYROLLED", 
    doj: "02-02-2024",
    allocatedHours: "08:30",
    shiftStart: "10:00",
    shiftEnd: "18:30"
  },
  { 
    id: "7", 
    name: "MEENA VERMA", 
    department: "OFFICE STAFF", 
    status: "PAYROLLED", 
    doj: "14-07-2023",
    allocatedHours: "08:00",
    shiftStart: "09:30",
    shiftEnd: "17:30"
  },
  { 
    id: "8", 
    name: "RAVI KUMAR", 
    department: "SECURITY DEPT.NIGHT SHIFT", 
    status: "NON-PAYROLLED", 
    doj: "30-09-2023",
    allocatedHours: "12:00",
    shiftStart: "21:00",
    shiftEnd: "09:00" // Night shift ending next day
  }
];

// Generate mock attendance records for the current month
const generateMockAttendanceRecords = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  // Generate records for each employee for each day of the month up to today
  mockEmployees.forEach(employee => {
    for (let day = 1; day <= Math.min(daysInMonth, currentDate.getDate()); day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toLocaleDateString('en-GB', { 
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      }).replace(/\//g, '-');
      
      const isSunday = date.getDay() === 0;
      const isHoliday = [1, 15].includes(day); // Mock holidays on 1st and 15th
      
      // Skip some days randomly to simulate absences
      if (Math.random() > 0.85 && !isSunday && !isHoliday) {
        continue;
      }
      
      // Office staff gets special treatment - just count them as present
      const isOfficeStaff = employee.department === "OFFICE STAFF";
      
      // Different logic for different departments and days
      let inTime = "";
      let outTime = "";
      let isPresent = false;
      let isLate = false;
      let workingHours = "00:00";
      let overtime = "00:00";
      
      if (!isSunday || Math.random() > 0.7) { // Sometimes people work on Sundays
        isPresent = true;
        
        // Generate in time between 8:00 and 10:30
        const inHour = 8 + Math.floor(Math.random() * 2);
        const inMinute = Math.floor(Math.random() * 60);
        inTime = `${inHour.toString().padStart(2, '0')}:${inMinute.toString().padStart(2, '0')}`;
        
        // Late if after 10:10 for non-office staff
        isLate = !isOfficeStaff && (inHour > 10 || (inHour === 10 && inMinute > 10));
        
        // Generate out time between 16:00 and 20:00
        const outHour = 16 + Math.floor(Math.random() * 4);
        const outMinute = Math.floor(Math.random() * 60);
        outTime = `${outHour.toString().padStart(2, '0')}:${outMinute.toString().padStart(2, '0')}`;
        
        // Calculate working hours
        let hours = outHour - inHour;
        let minutes = outMinute - inMinute;
        
        if (minutes < 0) {
          hours--;
          minutes += 60;
        }
        
        // For non-office staff, we calculate the exact hours
        if (!isOfficeStaff) {
          workingHours = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          
          // Overtime if more than 8 hours
          if (hours > 8 || (hours === 8 && minutes > 0)) {
            const overtimeHours = hours - 8;
            const overtimeMinutes = hours === 8 ? minutes : minutes;
            overtime = `${overtimeHours.toString().padStart(2, '0')}:${overtimeMinutes.toString().padStart(2, '0')}`;
          }
        } else {
          // Office staff just gets counted as a full day
          workingHours = "08:00";
        }
      }
      
      records.push({
        employeeId: employee.id,
        date: dateStr,
        inTime,
        outTime,
        isPresent,
        isLate,
        isHoliday,
        isSunday,
        workingHours,
        overtime
      });
    }
  });
  
  return records;
};

// Mock holidays data
export const mockHolidays = [
  { date: "01-05-2024", name: "Labor Day" },
  { date: "15-05-2024", name: "Company Foundation Day" }
];

// Fetch all employees
export const useEmployees = () => {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      // In a real app, this would make an API call to your Google Sheets integration
      // For now, we'll return the mock data
      return mockEmployees;
    }
  });
};

// Fetch attendance records
export const useAttendanceRecords = (month?: number, year?: number) => {
  return useQuery({
    queryKey: ['attendance', month, year],
    queryFn: async () => {
      // In a real app, this would make an API call to your Google Sheets integration
      // For now, we'll return the mock data
      return generateMockAttendanceRecords();
    }
  });
};

// Fetch department summaries
export const useDepartmentSummaries = () => {
  const { data: employees } = useEmployees();
  const { data: attendanceRecords } = useAttendanceRecords();
  
  return useQuery({
    queryKey: ['department-summaries', employees, attendanceRecords],
    queryFn: async () => {
      if (!employees || !attendanceRecords) {
        return [];
      }
      
      // Get unique departments
      const departments = [...new Set(employees.map(e => e.department))];
      
      // Get today's date in format DD-MM-YY
      const today = new Date().toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: '2-digit', 
        year: '2-digit' 
      }).replace(/\//g, '-');
      
      // Calculate summaries
      return departments.map(department => {
        const departmentEmployees = employees.filter(e => e.department === department);
        const todayRecords = attendanceRecords.filter(
          record => {
            const employee = employees.find(e => e.id === record.employeeId);
            return employee && employee.department === department && record.date === today;
          }
        );
        
        return {
          name: department,
          totalEmployees: departmentEmployees.length,
          presentToday: todayRecords.filter(r => r.isPresent).length,
          absentToday: departmentEmployees.length - todayRecords.filter(r => r.isPresent).length,
          lateToday: todayRecords.filter(r => r.isLate).length
        };
      });
    },
    enabled: !!employees && !!attendanceRecords
  });
};

// Helper functions for calculations
export const calculateAttendanceSummary = (
  records: AttendanceRecord[],
  employeeId: string
) => {
  const employeeRecords = records.filter(r => r.employeeId === employeeId);
  
  const daysPresent = employeeRecords.filter(r => r.isPresent).length;
  const lateDays = employeeRecords.filter(r => r.isLate).length;
  const sundaysImpacted = employeeRecords.filter(r => r.isSunday && !r.isPresent).length;
  const absents = employeeRecords.length - daysPresent;
  
  // Calculate total overtime
  let totalOvertimeMinutes = 0;
  employeeRecords.forEach(record => {
    if (record.overtime) {
      const [hours, minutes] = record.overtime.split(':').map(Number);
      totalOvertimeMinutes += (hours * 60) + minutes;
    }
  });
  
  const overtimeHours = Math.floor(totalOvertimeMinutes / 60);
  const overtimeMinutes = totalOvertimeMinutes % 60;
  const overtime = `${overtimeHours}:${overtimeMinutes.toString().padStart(2, '0')}`;
  
  // Calculate balance (presents - absents + overtime days)
  // For simplicity, we're counting 8 hours of overtime as 1 day
  const overtimeDays = Math.floor(totalOvertimeMinutes / (8 * 60));
  const balance = daysPresent - absents + overtimeDays;
  
  return {
    daysPresent,
    lateDays,
    overtime,
    absents,
    sundaysImpacted,
    balance
  };
};
