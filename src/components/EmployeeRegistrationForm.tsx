
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "@/hooks/use-toast";

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
import { useEmployees } from "@/lib/googleSheetsService";

// Form schema using zod
const employeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().min(1, "Please select a department"),
  status: z.enum(["PAYROLLED", "NON-PAYROLLED"]),
  doj: z.string().refine((val) => {
    // Basic date validation in DD-MM-YYYY format
    return /^\d{2}-\d{2}-\d{4}$/.test(val);
  }, "Date must be in DD-MM-YYYY format"),
  allocatedHours: z.string().regex(/^\d{1,2}:\d{2}$/, "Time must be in HH:MM format"),
  shiftStart: z.string().regex(/^\d{1,2}:\d{2}$/, "Time must be in HH:MM format"),
  shiftEnd: z.string().regex(/^\d{1,2}:\d{2}$/, "Time must be in HH:MM format"),
});

type EmployeeFormValues = z.infer<typeof employeeSchema>;

// Available departments
const departments = [
  "MOULDING DEPT. (A & B SHIFT)",
  "FOILING & HOT STAMPING DEPT. DAY SHIFT",
  "REFILLING DEPT.",
  "EXTRUSION DEPT. (A & B SHIFT)",
  "PEN ASSEMBLING DEPT.",
  "DESPATCH DEPT. DAY SHIFT",
  "OFFICE STAFF",
  "SECURITY DEPT.NIGHT SHIFT",
];

export function EmployeeRegistrationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { refetch } = useEmployees();

  // Initialize form with validation
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      name: "",
      department: "",
      status: "PAYROLLED",
      doj: "",
      allocatedHours: "",
      shiftStart: "",
      shiftEnd: "",
    },
  });

  // Form submission handler
  const onSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would send data to an API
      console.log("Employee data to submit:", values);
      
      // For now, just simulate success with a toast notification
      toast({
        title: "Employee registered successfully!",
        description: `${values.name} has been registered.`,
      });
      
      // Reset form after submission
      form.reset();
      
      // Refresh employee list
      refetch();
    } catch (error) {
      console.error("Error registering employee:", error);
      toast({
        title: "Error registering employee",
        description: "There was a problem registering the employee. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter employee name" {...field} />
              </FormControl>
              <FormDescription>
                Enter the full name of the employee
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Select the department for this employee
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="PAYROLLED">PAYROLLED</SelectItem>
                  <SelectItem value="NON-PAYROLLED">NON-PAYROLLED</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                Select the employment status
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="doj"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date of Joining</FormLabel>
              <FormControl>
                <Input placeholder="DD-MM-YYYY" {...field} />
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
          name="allocatedHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allocated Hours</FormLabel>
              <FormControl>
                <Input placeholder="HH:MM" {...field} />
              </FormControl>
              <FormDescription>
                Enter total working hours in HH:MM format (e.g., 08:30)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shiftStart"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift Start Time</FormLabel>
              <FormControl>
                <Input placeholder="HH:MM" {...field} />
              </FormControl>
              <FormDescription>
                Enter shift start time in HH:MM format (e.g., 10:00)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="shiftEnd"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Shift End Time</FormLabel>
              <FormControl>
                <Input placeholder="HH:MM" {...field} />
              </FormControl>
              <FormDescription>
                Enter shift end time in HH:MM format (e.g., 18:30)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registering..." : "Register Employee"}
        </Button>
      </form>
    </Form>
  );
}
