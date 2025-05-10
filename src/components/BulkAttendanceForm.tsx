import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Employee, useEmployees } from "@/lib/googleSheetsService";
import { Check, Edit, Save } from "lucide-react";

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
  allocatedHours: string;
  shiftStart: string;
  shiftEnd: string;
  isSelected: boolean;
  inTime: string;
  outTime: string;
  isEditing: boolean;
}

export function BulkAttendanceForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [employeeAttendances, setEmployeeAttendances] = useState<EmployeeAttendance[]>([]);
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
      allocatedHours: emp.allocatedHours || "",
      shiftStart: emp.shiftStart || "",
      shiftEnd: emp.shiftEnd || "",
      isSelected: true, // Select all employees by default
      inTime: isSundayDate ? "" : emp.shiftStart || "",
      outTime: isSundayDate ? "" : emp.shiftEnd || "",
      isEditing: false,
    }));
    
    setEmployeeAttendances(attendances);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("date", e.target.value);
    // Clear existing employee attendances when date changes
    setEmployeeAttendances([]);
  };
  
  // Toggle employee selection
  const toggleEmployeeSelection = (index: number) => {
    const updatedAttendances = [...employeeAttendances];
    updatedAttendances[index].isSelected = !updatedAttendances[index].isSelected;
    setEmployeeAttendances(updatedAttendances);
  };
  
  // Toggle editing mode for an employee's times
  const toggleEditingMode = (index: number) => {
    const updatedAttendances = [...employeeAttendances];
    updatedAttendances[index].isEditing = !updatedAttendances[index].isEditing;
    setEmployeeAttendances(updatedAttendances);
  };
  
  // Update employee in/out times
  const updateEmployeeTimes = (index: number, field: 'inTime' | 'outTime', value: string) => {
    const updatedAttendances = [...employeeAttendances];
    updatedAttendances[index][field] = value;
    setEmployeeAttendances(updatedAttendances);
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
        const workingHours = calculateWorkingHours(
          emp.inTime, 
          emp.outTime, 
          emp.allocatedHours,
          isSundayDate
        );
        
        return {
          employeeId: emp.employeeId,
          date: values.date,
          inTime: isSundayDate ? "" : emp.inTime,
          outTime: isSundayDate ? "" : emp.outTime,
          workingHours,
          isPresent: true,
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
                  <Input 
                    placeholder="DD-MM-YYYY" 
                    {...field} 
                    onChange={handleDateChange}
                  />
                </FormControl>
                <FormDescription>
                  Enter date in DD-MM-YYYY format (e.g., 01-05-2023)
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
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Select</TableHead>
                  <TableHead>Employee</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Allocated Hours</TableHead>
                  {!isSunday(form.getValues().date) && (
                    <>
                      <TableHead>In Time</TableHead>
                      <TableHead>Out Time</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {employeeAttendances.map((emp, index) => (
                  <TableRow key={emp.employeeId}>
                    <TableCell>
                      <Checkbox 
                        checked={emp.isSelected} 
                        onCheckedChange={() => toggleEmployeeSelection(index)}
                      />
                    </TableCell>
                    <TableCell>{emp.name}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{emp.department}</TableCell>
                    <TableCell>{emp.allocatedHours || "—"}</TableCell>
                    
                    {!isSunday(form.getValues().date) && (
                      <>
                        <TableCell>
                          {emp.isEditing ? (
                            <Input 
                              value={emp.inTime}
                              onChange={(e) => updateEmployeeTimes(index, 'inTime', e.target.value)}
                              placeholder="HH:MM"
                              className="w-24"
                            />
                          ) : (
                            emp.inTime || "—"
                          )}
                        </TableCell>
                        <TableCell>
                          {emp.isEditing ? (
                            <Input 
                              value={emp.outTime}
                              onChange={(e) => updateEmployeeTimes(index, 'outTime', e.target.value)}
                              placeholder="HH:MM"
                              className="w-24"
                            />
                          ) : (
                            emp.outTime || "—"
                          )}
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleEditingMode(index)}
                          >
                            {emp.isEditing ? <Save size={16} /> : <Edit size={16} />}
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div>
            {employeeAttendances.length > 0 && (
              <p className="text-sm text-muted-foreground">
                {employeeAttendances.filter(e => e.isSelected).length} of {employeeAttendances.length} employees selected
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
