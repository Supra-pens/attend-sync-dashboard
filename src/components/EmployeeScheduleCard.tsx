
import { Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Employee } from "@/lib/googleSheetsService";

interface EmployeeScheduleCardProps {
  employee: Employee;
}

export function EmployeeScheduleCard({ employee }: EmployeeScheduleCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <span>Schedule Details</span>
        </CardTitle>
        <CardDescription>Shift information for {employee.name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">Allocated Hours</p>
              <p className="text-xl font-semibold text-blue-600">{employee.allocatedHours || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shift Start</p>
              <p className="text-xl font-semibold text-blue-600">{employee.shiftStart || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shift End</p>
              <p className="text-xl font-semibold text-blue-600">{employee.shiftEnd || "N/A"}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Department</p>
            <p className="text-lg font-medium">{employee.department}</p>
          </div>
          
          <div className="flex justify-between items-center pt-2 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Date Joined</p>
              <p className="font-medium">{employee.doj}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium">{employee.status}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
