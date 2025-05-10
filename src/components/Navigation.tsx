
import { Link } from "react-router-dom";

export function Navigation() {
  return (
    <nav className="bg-white border-b">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link to="/" className="text-xl font-bold">
            HR System
          </Link>
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Dashboard
          </Link>
          <Link to="/register-employee" className="text-sm font-medium transition-colors hover:text-primary">
            Register Employee
          </Link>
          <Link to="/record-attendance" className="text-sm font-medium transition-colors hover:text-primary">
            Record Attendance
          </Link>
          <Link to="/bulk-attendance" className="text-sm font-medium transition-colors hover:text-primary">
            Bulk Attendance
          </Link>
        </div>
      </div>
    </nav>
  );
}
