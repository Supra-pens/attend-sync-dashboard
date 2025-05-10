
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceRecordingForm } from "@/components/AttendanceRecordingForm";
import { Navigation } from "@/components/Navigation";

export default function AttendanceRecording() {
  return (
    <div>
      <Navigation />
      
      <div className="container py-8 max-w-3xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Attendance Recording</h1>
            <p className="text-muted-foreground mt-2">
              Record daily attendance with in and out times
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Record Daily Attendance</CardTitle>
              <CardDescription>
                Enter check-in and check-out times for employees
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AttendanceRecordingForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
