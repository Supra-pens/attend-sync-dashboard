
import { useState } from "react";
import { 
  useEmployees, 
  useAttendanceRecords, 
  useDepartmentSummaries 
} from "@/lib/googleSheetsService";

import { StatCard } from "@/components/StatCard";
import { DepartmentSummary } from "@/components/DepartmentSummary";
import { AttendanceSummaryChart } from "@/components/AttendanceSummaryChart";
import { AttendanceDatePicker } from "@/components/AttendanceDatePicker";
import { EmployeeFilter } from "@/components/EmployeeFilter";
import { AttendanceTable } from "@/components/AttendanceTable";
import { EmployeeSummaryCard } from "@/components/EmployeeSummaryCard";
import { HolidayManager } from "@/components/HolidayManager";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Index = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTab, setSelectedTab] = useState<string>("daily");
  
  // Fetch data from our service
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  const { data: attendanceRecords = [], isLoading: isLoadingAttendance } = useAttendanceRecords();
  const { data: departmentSummaries = [], isLoading: isLoadingDepartments } = useDepartmentSummaries();
  
  // Filtered employees state
  const [filteredEmployees, setFilteredEmployees] = useState(employees);
  
  // Calculate overall statistics
  const presentCount = attendanceRecords.filter(r => r.isPresent).length;
  const absentCount = employees.length * 30 - presentCount; // Approximation for the month
  const lateCount = attendanceRecords.filter(r => r.isLate).length;
  const overtimeCount = attendanceRecords.filter(r => r.overtime && r.overtime !== "00:00").length;
  const sundayCount = attendanceRecords.filter(r => r.isSunday && r.isPresent).length;
  
  // Calculate average attendance rate
  const attendanceRate = employees.length > 0
    ? Math.round((presentCount / (employees.length * 30)) * 100)
    : 0;
  
  // Loading state
  const isLoading = isLoadingEmployees || isLoadingAttendance || isLoadingDepartments;
  
  return (
    <div className="container py-8 max-w-7xl">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Attendance Dashboard</h1>
          <p className="text-muted-foreground">
            Track and manage employee attendance across all departments
          </p>
        </div>
        
        {/* Main content */}
        <div className="grid gap-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <StatCard
              title="Present Days"
              value={presentCount}
              description="Total attendance records"
              trend="up"
            />
            <StatCard
              title="Absent Days"
              value={absentCount}
              description="Total absent records"
              trend="down"
            />
            <StatCard
              title="Late Days"
              value={lateCount}
              description="Employees arriving late"
              trend="down"
            />
            <StatCard
              title="Overtime Hours"
              value={overtimeCount}
              description="Total overtime records"
              trend="up"
            />
            <StatCard
              title="Sundays Worked"
              value={sundayCount}
              description="Sunday attendance"
              trend="up"
            />
            <StatCard
              title="Attendance Rate"
              value={`${attendanceRate}%`}
              description="Monthly average"
              trend={attendanceRate >= 80 ? "up" : "down"}
            />
          </div>
          
          {/* Departments Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departmentSummaries.map((dept, index) => (
              <DepartmentSummary key={index} department={dept} />
            ))}
          </div>
          
          {/* Charts and Reports */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <AttendanceSummaryChart
              employees={employees}
              attendanceRecords={attendanceRecords}
              className="col-span-2"
            />
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
                <CardDescription>
                  Manage holidays and system parameters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <HolidayManager />
              </CardContent>
            </Card>
          </div>
          
          {/* Tabs for Daily and Monthly View */}
          <Tabs 
            defaultValue="daily" 
            value={selectedTab} 
            onValueChange={setSelectedTab}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="daily">Daily Attendance</TabsTrigger>
                <TabsTrigger value="monthly">Monthly Report</TabsTrigger>
                <TabsTrigger value="employees">Employees</TabsTrigger>
              </TabsList>
              
              <AttendanceDatePicker date={selectedDate} setDate={setSelectedDate} />
            </div>
            
            <TabsContent value="daily" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Daily Attendance Report</CardTitle>
                  <CardDescription>
                    Detailed attendance records for the selected date
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeFilter 
                    employees={employees} 
                    onFilterChange={setFilteredEmployees} 
                  />
                  
                  <div className="mt-4">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p>Loading attendance data...</p>
                      </div>
                    ) : (
                      <AttendanceTable
                        employees={filteredEmployees}
                        attendanceRecords={attendanceRecords}
                        date={selectedDate}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="monthly" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Monthly Summary Report</CardTitle>
                  <CardDescription>
                    Attendance statistics for {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeFilter 
                    employees={employees} 
                    onFilterChange={setFilteredEmployees} 
                  />
                  
                  <div className="mt-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p>Loading monthly data...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredEmployees.slice(0, 6).map((employee) => (
                          <EmployeeSummaryCard
                            key={employee.id}
                            employee={employee}
                            attendanceRecords={attendanceRecords}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="employees" className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Employee Directory</CardTitle>
                  <CardDescription>
                    View and manage employee information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <EmployeeFilter 
                    employees={employees} 
                    onFilterChange={setFilteredEmployees} 
                  />
                  
                  <div className="mt-6">
                    {isLoading ? (
                      <div className="text-center py-8">
                        <p>Loading employee data...</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredEmployees.map((employee) => (
                          <EmployeeSummaryCard
                            key={employee.id}
                            employee={employee}
                            attendanceRecords={attendanceRecords}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
