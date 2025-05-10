
import { Navigation } from "@/components/Navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BulkAttendanceForm } from "@/components/BulkAttendanceForm";

export default function BulkAttendanceRecording() {
  return (
    <div>
      <Navigation />
      
      <div className="container py-8 max-w-5xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bulk Attendance Recording</h1>
            <p className="text-muted-foreground mt-2">
              Record attendance for all employees with a single submission
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Daily Attendance Entry</CardTitle>
              <CardDescription>
                Record attendance, leaves, and absences for multiple employees on the same date
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BulkAttendanceForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
