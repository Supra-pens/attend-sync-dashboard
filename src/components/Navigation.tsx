
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="border-b">
      <div className="container flex items-center justify-between h-16">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-bold">Attendance System</h1>
          
          <div className="flex items-center space-x-4 ml-8">
            <Button 
              asChild 
              variant={location.pathname === "/" ? "default" : "ghost"}
            >
              <Link to="/">Dashboard</Link>
            </Button>
            
            <Button 
              asChild 
              variant={location.pathname === "/register-employee" ? "default" : "ghost"}
            >
              <Link to="/register-employee">Register Employee</Link>
            </Button>
            
            <Button 
              asChild 
              variant={location.pathname === "/record-attendance" ? "default" : "ghost"}
            >
              <Link to="/record-attendance">Record Attendance</Link>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
