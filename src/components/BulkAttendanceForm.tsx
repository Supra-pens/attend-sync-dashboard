
import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Employee, useEmployees } from "@/lib/googleSheetsService";
import { Check, Edit, Save, Clock, Calendar, X } from "lucide-react";
import { EmployeeFilter } from "@/components/EmployeeFilter";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema using zod
const bulkAttendanceSchema = z.object({
  date: z.string().refine((val) => {
    // Basic date validation in DD-MM-YYYY format
    return /^\d{2}-\d{2}-\d{4}$/.test(val);
  }, "Date must be in DD-MM-YYYY format"),
});

type BulkAttendanceFormValues = z.infer<typeof bulkAttendanceSchema>;

interface EmployeeAttendance {
  employeeId: string;
  name: string;
  department: string;
  status: string;
  allocatedHours: string;
  shiftStart: string;
  shiftEnd: string;
  isSelected: boolean;
  inTime: string;
  outTime: string;
  isPresent: boolean;
  isAbsent: boolean;
  isLeave: boolean;
  isEditing: boolean;
}

export function BulkAttendanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeAttendances, setEmployeeAttendances] = useState<EmployeeAttendance[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeAttendance[]>([]);
  const { data: employees = [] } = useEmployees();
  
  // Initialize form with validation
  const form = useForm<BulkAttendanceFormValues>({
    resolver: zodResolver(bulkAttendanceSchema),
    defaultValues: {
      date: getCurrentDate(),
    },
  });

  // Get current date in DD-MM-YYYY format
  function getCurrentDate() {
    const now = new Date();
    return `${String(now.getDate()).padStart(2, '0')}-${String(now.getMonth() + 1).padStart(2, '0')}-${now.getFullYear()}`;
  }

  // Check if the selected date is a Sunday
  function isSunday(dateString: string) {
    // Parse DD-MM-YYYY format
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getDay() === 0; // 0 represents Sunday
  }

  // Function to load all employees for bulk attendance entry
  const loadEmployees = () => {
    const isSundayDate = isSunday(form.getValues().date);
    
    const attendances: EmployeeAttendance[] = employees.map(emp => ({
      employeeId: emp.id,
      name: emp.name,
      department: emp.department,
      status: emp.status,
      allocatedHours: emp.allocatedHours || "",
      shiftStart: emp.shiftStart || "",
      shiftEnd: emp.shiftEnd || "",
      isSelected: true, // Select all employees by default
      inTime: isSundayDate ? "" : emp.shiftStart || "",
      outTime: isSundayDate ? "" : emp.shiftEnd || "",
      isPresent: true, // Default to present
      isAbsent: false,
      isLeave: false,
      isEditing: false,
    }));
    
    setEmployeeAttendances(attendances);
    setFilteredEmployees(attendances);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("date", e.target.value);
    // Clear existing employee attendances when date changes
    setEmployeeAttendances([]);
    setFilteredEmployees([]);
  };
  
  // Handle filter change from EmployeeFilter component
  const handleFilterChange = (filteredEmployeeList: Employee[]) => {
    if (!employeeAttendances.length) return;
    
    const filteredIds = new Set(filteredEmployeeList.map(emp => emp.id));
    const filteredAttendances = employeeAttendances.filter(emp => 
      filteredIds.has(emp.employeeId)
    );
    
    setFilteredEmployees(filteredAttendances);
  };
  
  // Toggle employee selection
  const toggleEmployeeSelection = (index: number) => {
    const updatedAttendances = [...filteredEmployees];
    updatedAttendances[index].isSelected = !updatedAttendances[index].isSelected;
    setFilteredEmployees(updatedAttendances);
    
    // Find and update in the main array too
    const mainIndex = employeeAttendances.findIndex(
      emp => emp.employeeId === updatedAttendances[index].employeeId
    );
    
    if (mainIndex !== -1) {
      const mainUpdated = [...employeeAttendances];
      mainUpdated[mainIndex].isSelected = updatedAttendances[index].isSelected;
      setEmployeeAttendances(mainUpdated);
    }
  };
  
  // Toggle editing mode for an employee's times
  const toggleEditingMode = (index: number) => {
    const updatedAttendances = [...filteredEmployees];
    updatedAttendances[index].isEditing = !updatedAttendances[index].isEditing;
    setFilteredEmployees(updatedAttendances);
    
    // Find and update in the main array too
    const mainIndex = employeeAttendances.findIndex(
      emp => emp.employeeId === updatedAttendances[index].employeeId
    );
    
    if (mainIndex !== -1) {
      const mainUpdated = [...employeeAttendances];
      mainUpdated[mainIndex].isEditing = updatedAttendances[index].isEditing;
      setEmployeeAttendances(mainUpdated);
    }
  };
  
  // Update employee in/out times
  const updateEmployeeTimes = (index: number, field: 'inTime' | 'outTime', value: string) => {
    // Update in filtered array
    const updatedAttendances = [...filteredEmployees];
    updatedAttendances[index][field] = value;
    setFilteredEmployees(updatedAttendances);
    
    // Find and update in the main array too
    const mainIndex = employeeAttendances.findIndex(
      emp => emp.employeeId === updatedAttendances[index].employeeId
    );
    
    if (mainIndex !== -1) {
      const mainUpdated = [...employeeAttendances];
      mainUpdated[mainIndex][field] = value;
      setEmployeeAttendances(mainUpdated);
    }
  };
  
  // Set attendance status (present, absent, leave)
  const setAttendanceStatus = (index: number, status: 'present' | 'absent' | 'leave') => {
    // Update in filtered array
    const updatedAttendances = [...filteredEmployees];
    
    // Reset all status flags first
    updatedAttendances[index].isPresent = false;
    updatedAttendances[index].isAbsent = false;
    updatedAttendances[index].isLeave = false;
    
    // Then set the requested status
    switch (status) {
      case 'present':
        updatedAttendances[index].isPresent = true;
        break;
      case 'absent':
        updatedAttendances[index].isAbsent = true;
        break;
      case 'leave':
        updatedAttendances[index].isLeave = true;
        break;
    }
    
    setFilteredEmployees(updatedAttendances);
    
    // Find and update in the main array too
    const mainIndex = employeeAttendances.findIndex(
      emp => emp.employeeId === updatedAttendances[index].employeeId
    );
    
    if (mainIndex !== -1) {
      const mainUpdated = [...employeeAttendances];
      mainUpdated[mainIndex].isPresent = updatedAttendances[index].isPresent;
      mainUpdated[mainIndex].isAbsent = updatedAttendances[index].isAbsent;
      mainUpdated[mainIndex].isLeave = updatedAttendances[index].isLeave;
      setEmployeeAttendances(mainUpdated);
    }
  };

  // Open time picker dropdown for a specific field
  const openTimePicker = (index: number, field: 'inTime' | 'outTime', currentValue: string) => {
    // Create timepoints from 7:00 to 22:00 in 15-minute intervals
    const timePoints = [];
    for (let hour = 7; hour <= 22; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = String(hour).padStart(2, '0');
        const formattedMinute = String(minute).padStart(2, '0');
        timePoints.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="w-24 flex items-center justify-between">
            {currentValue || "--:--"}
            <Clock className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-24 max-h-60 overflow-y-auto">
          {timePoints.map((time) => (
            <DropdownMenuItem 
              key={time} 
              onClick={() => updateEmployeeTimes(index, field, time)}
              className={time === currentValue ? "bg-primary/10" : ""}
            >
              {time}
              {time === currentValue && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  // Function to calculate working hours based on in and out times
  function calculateWorkingHours(inTime: string, outTime: string, allocatedHours: string, isSundayDate: boolean) {
    // For Sunday, use allocated hours directly
    if (isSundayDate && allocatedHours) {
      return allocatedHours;
    }
    
    // If either time is missing, return allocated hours
    if (!inTime || !outTime) return allocatedHours;
    
    // Parse times into hours and minutes
    const [inHours, inMinutes] = inTime.split(':').map(Number);
    const [outHours, outMinutes] = outTime.split(':').map(Number);
    
    // Convert to total minutes
    const inTotalMinutes = inHours * 60 + inMinutes;
    const outTotalMinutes = outHours * 60 + outMinutes;
    
    // Calculate the difference
    let workingMinutes = outTotalMinutes - inTotalMinutes;
    
    // Handle negative values (e.g., overnight shifts)
    if (workingMinutes < 0) {
      workingMinutes += 24 * 60; // Add 24 hours in minutes
    }
    
    // If allocated hours exist and not Sunday
    if (allocatedHours && !isSundayDate) {
      const [allocatedHours_, allocatedMinutes] = allocatedHours.split(':').map(Number);
      const allocatedTotalMinutes = allocatedHours_ * 60 + allocatedMinutes;
      
      // Apply 10-minute tolerance rule
      if (allocatedTotalMinutes - workingMinutes <= 10 && allocatedTotalMinutes - workingMinutes > 0) {
        return allocatedHours; // Return allocated hours if within 10-min tolerance
      }
    }
    
    // Format result back to HH:MM
    const hours = Math.floor(workingMinutes / 60);
    const minutes = workingMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }
  
  // Form submission handler
  const onSubmit = async (values: BulkAttendanceFormValues) => {
    setIsSubmitting(true);
    try {
      const isSundayDate = isSunday(values.date);
      const selectedEmployees = employeeAttendances.filter(emp => emp.isSelected);
      
      if (selectedEmployees.length === 0) {
        toast({
          title: "No employees selected",
          description: "Please select at least one employee to record attendance.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      // Process each selected employee
      const attendanceRecords = selectedEmployees.map(emp => {
        // For Sunday, automatically use allocated hours
        const workingHours = emp.isLeave ? "00:00" : emp.isAbsent ? "00:00" : calculateWorkingHours(
          emp.inTime, 
          emp.outTime, 
          emp.allocatedHours,
          isSundayDate
        );
        
        return {
          employeeId: emp.employeeId,
          date: values.date,
          inTime: emp.isLeave || emp.isAbsent ? "" : isSundayDate ? "" : emp.inTime,
          outTime: emp.isLeave || emp.isAbsent ? "" : isSundayDate ? "" : emp.outTime,
          workingHours,
          isPresent: emp.isPresent,
          isAbsent: emp.isAbsent,
          isLeave: emp.isLeave,
          isLate: false, // Could be calculated based on shift start time
          isHoliday: false, // Could be determined from a holiday list
          isSunday: isSundayDate,
          overtime: "00:00", // Would need additional calculation logic
        };
      });
      
      // In a real app, this would send data to an API
      console.log("Bulk attendance data to submit:", attendanceRecords);
      
      // For now, just simulate success with a toast notification
      toast({
        title: "Attendance recorded successfully!",
        description: `Attendance for ${selectedEmployees.length} employees on ${values.date} has been recorded.`,
      });
      
      // Reset form but keep date
      setEmployeeAttendances([]);
      setFilteredEmployees([]);
    } catch (error) {
      console.error("Error recording bulk attendance:", error);
      toast({
        title: "Error recording attendance",
        description: "There was a problem recording the attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input 
                      placeholder="DD-MM-YYYY" 
                      {...field} 
                      onChange={handleDateChange}
                    />
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-gray-500" />
                  </div>
                </FormControl>
                <FormDescription>
                  Enter date in DD-MM-YYYY format (e.g., 01-05-2025)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="flex items-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={loadEmployees}
              className="mb-2"
            >
              Load Employees
            </Button>
            {isSunday(form.getValues().date) && (
              <p className="text-blue-600 ml-4 mb-2">
                Sunday detected: Working hours will use allocated hours.
              </p>
            )}
          </div>
        </div>
        
        {employeeAttendances.length > 0 && (
          <div className="space-y-4">
            <EmployeeFilter 
              employees={employees} 
              onFilterChange={handleFilterChange} 
            />
            
            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Select</TableHead>
                    <TableHead>Employee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Allocated Hours</TableHead>
                    {!isSunday(form.getValues().date) && (
                      <>
                        <TableHead>In Time</TableHead>
                        <TableHead>Out Time</TableHead>
                      </>
                    )}
                    <TableHead className="w-[120px]">Attendance Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEmployees.map((emp, index) => (
                    <TableRow key={emp.employeeId}>
                      <TableCell>
                        <Checkbox 
                          checked={emp.isSelected} 
                          onCheckedChange={() => toggleEmployeeSelection(index)}
                        />
                      </TableCell>
                      <TableCell className="font-medium">{emp.name}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{emp.department}</TableCell>
                      <TableCell>{emp.status}</TableCell>
                      <TableCell>{emp.allocatedHours || "—"}</TableCell>
                      
                      {!isSunday(form.getValues().date) && (
                        <>
                          <TableCell>
                            {(emp.isAbsent || emp.isLeave) ? (
                              "—"
                            ) : (
                              openTimePicker(index, 'inTime', emp.inTime)
                            )}
                          </TableCell>
                          <TableCell>
                            {(emp.isAbsent || emp.isLeave) ? (
                              "—"
                            ) : (
                              openTimePicker(index, 'outTime', emp.outTime)
                            )}
                          </TableCell>
                        </>
                      )}
                      
                      <TableCell>
                        <Select
                          value={emp.isPresent ? "present" : emp.isAbsent ? "absent" : "leave"}
                          onValueChange={(value) => {
                            setAttendanceStatus(index, value as 'present' | 'absent' | 'leave');
                          }}
                        >
                          <SelectTrigger className="w-28">
                            <SelectValue placeholder="Status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="present" className="flex items-center">
                              <Check className="mr-2 h-4 w-4 text-green-500" />
                              Present
                            </SelectItem>
                            <SelectItem value="absent" className="flex items-center">
                              <X className="mr-2 h-4 w-4 text-red-500" />
                              Absent
                            </SelectItem>
                            <SelectItem value="leave" className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-orange-500" />
                              Leave
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            {employeeAttendances.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {filteredEmployees.filter(e => e.isSelected).length} of {filteredEmployees.length} employees selected
              </p>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting || employeeAttendances.length === 0}>
            {isSubmitting ? "Recording..." : "Record Attendance"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
