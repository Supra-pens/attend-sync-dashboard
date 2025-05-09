
import { useEffect, useState } from "react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Employee } from "@/lib/googleSheetsService";

interface EmployeeFilterProps {
  employees: Employee[];
  onFilterChange: (filtered: Employee[]) => void;
}

export function EmployeeFilter({ employees, onFilterChange }: EmployeeFilterProps) {
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Get unique departments
  const departments = ["all", ...new Set(employees.map(e => e.department))];
  
  // Get unique statuses
  const statuses = ["all", ...new Set(employees.map(e => e.status))];
  
  // Filter employees based on selected filters
  useEffect(() => {
    let filteredEmployees = [...employees];
    
    // Filter by department
    if (selectedDepartment !== "all") {
      filteredEmployees = filteredEmployees.filter(e => e.department === selectedDepartment);
    }
    
    // Filter by status
    if (selectedStatus !== "all") {
      filteredEmployees = filteredEmployees.filter(e => e.status === selectedStatus);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredEmployees = filteredEmployees.filter(e => 
        e.name.toLowerCase().includes(query) ||
        e.department.toLowerCase().includes(query)
      );
    }
    
    onFilterChange(filteredEmployees);
  }, [selectedDepartment, selectedStatus, searchQuery, employees, onFilterChange]);

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex-1 min-w-[200px]">
        <Input
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full"
        />
      </div>
      <div>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>
                {dept === "all" ? "All Departments" : dept}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statuses.map((status) => (
              <SelectItem key={status} value={status}>
                {status === "all" ? "All Statuses" : status}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
