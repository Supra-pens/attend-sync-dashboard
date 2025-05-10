
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmployeeRegistrationForm } from "@/components/EmployeeRegistrationForm";
import { Navigation } from "@/components/Navigation";

export default function EmployeeRegistration() {
  return (
    <div>
      <Navigation />
      
      <div className="container py-8 max-w-3xl">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Employee Registration</h1>
            <p className="text-muted-foreground mt-2">
              Register new employees and their shift details
            </p>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Register New Employee</CardTitle>
              <CardDescription>
                Enter employee details including shift timings and allocated hours
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EmployeeRegistrationForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
