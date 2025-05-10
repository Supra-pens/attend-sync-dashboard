import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";
import { Employee, useEmployees } from "@/lib/googleSheetsService";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema using zod
const attendanceSchema = z.object({
  employeeId: z.string().min(1, "Please select an employee"),
  date: z.string().refine((val) => {
    // Basic date validation in DD-MM-YYYY format
    return /^\d{2}-\d{2}-\d{4}$/.test(val);
  }, "Date must be in DD-MM-YYYY format"),
  inTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Time must be in HH:MM format"),
  outTime: z.string().regex(/^\d{1,2}:\d{2}$/, "Time must be in HH:MM format"),
});

type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export function AttendanceRecordingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { data: employees = [] } = useEmployees();

  // Initialize form with validation
  const form = useForm<AttendanceFormValues>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: "",
      date: getCurrentDate(),
      inTime: "",
      outTime: "",
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

  // Function to calculate working hours based on in and out times
  function calculateWorkingHours(inTime: string, outTime: string, allocatedHours: string | undefined) {
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
    
    // If allocated hours exist and it's not Sunday
    if (allocatedHours && !isSunday(form.getValues().date)) {
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

  // Handle employee selection
  const handleEmployeeChange = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId) || null;
    setSelectedEmployee(employee);
    form.setValue("employeeId", employeeId);
  };

  // Form submission handler
  const onSubmit = async (values: AttendanceFormValues) => {
    setIsSubmitting(true);
    try {
      // Check if date is Sunday for automatic filling
      const isSundayDate = isSunday(values.date);
      let workingHours;
      
      if (isSundayDate && selectedEmployee) {
        // For Sunday, automatically use allocated hours
        workingHours = selectedEmployee.allocatedHours || "00:00";
      } else {
        // Calculate working hours with 10-min tolerance rule
        workingHours = calculateWorkingHours(
          values.inTime, 
          values.outTime, 
          selectedEmployee?.allocatedHours
        );
      }

      // In a real app, this would send data to an API
      console.log("Attendance data to submit:", {
        ...values,
        workingHours,
        isPresent: true,
        isLate: false, // Could be calculated based on shift start time
        isHoliday: false, // Could be determined from a holiday list
        isSunday: isSundayDate,
        overtime: "00:00", // Would need additional calculation logic
      });
      
      // For now, just simulate success with a toast notification
      toast({
        title: "Attendance recorded successfully!",
        description: `${selectedEmployee?.name}'s attendance for ${values.date} has been recorded.`,
      });
      
      // Reset form but keep employee and date
      form.reset({
        ...form.getValues(),
        inTime: "",
        outTime: "",
      });
    } catch (error) {
      console.error("Error recording attendance:", error);
      toast({
        title: "Error recording attendance",
        description: "There was a problem recording the attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update the date value
    form.setValue("date", e.target.value);
    
    // If the date is a Sunday, we can pre-fill working hours based on allocated hours
    if (isSunday(e.target.value) && selectedEmployee?.allocatedHours) {
      // Toast to notify that Sunday hours are automatically filled
      toast({
        title: "Sunday detected",
        description: "For Sundays, working hours are automatically filled with allocated hours.",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="employeeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee</FormLabel>
              <Select onValueChange={handleEmployeeChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an employee" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name} - {employee.department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the employee to record attendance
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  onChange={dateChangeHandler}
                />
              </FormControl>
              <FormDescription>
                Enter date in DD-MM-YYYY format (e.g., 01-05-2023)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>In Time</FormLabel>
              <FormControl>
                <Input placeholder="HH:MM" {...field} />
              </FormControl>
              <FormDescription>
                Enter check-in time in HH:MM format (e.g., 09:30)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="outTime"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Out Time</FormLabel>
              <FormControl>
                <Input placeholder="HH:MM" {...field} />
              </FormControl>
              <FormDescription>
                Enter check-out time in HH:MM format (e.g., 18:30)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {selectedEmployee && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Employee Details</h4>
            <p><span className="font-medium">Allocated Hours:</span> {selectedEmployee.allocatedHours || 'N/A'}</p>
            <p><span className="font-medium">Shift Start:</span> {selectedEmployee.shiftStart || 'N/A'}</p>
            {isSunday(form.getValues().date) && (
              <p className="text-blue-600 mt-2">
                Note: For Sundays, working hours will be automatically filled with allocated hours.
              </p>
            )}
          </div>
        )}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Recording..." : "Record Attendance"}
        </Button>
      </form>
    </Form>
  );
}
