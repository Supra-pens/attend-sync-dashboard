
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DepartmentSummary as DepartmentSummaryType } from "@/lib/googleSheetsService";

interface DepartmentCardProps {
  department: DepartmentSummaryType;
}

export function DepartmentSummary({ department }: DepartmentCardProps) {
  const presentPercentage = department.totalEmployees > 0
    ? Math.round((department.presentToday / department.totalEmployees) * 100)
    : 0;

  const getDepartmentColor = () => {
    const deptLower = department.name.toLowerCase();
    if (deptLower.includes("moulding")) return "department-moulding";
    if (deptLower.includes("foiling")) return "department-foiling";
    if (deptLower.includes("refilling")) return "department-refilling";
    if (deptLower.includes("extrusion")) return "department-extrusion";
    if (deptLower.includes("assembling")) return "department-assembly";
    if (deptLower.includes("despatch")) return "department-despatch";
    if (deptLower.includes("office")) return "department-office";
    if (deptLower.includes("security")) return "department-security";
    return "primary";
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className={`bg-${getDepartmentColor()} text-white pb-2`}>
        <CardTitle className="text-sm font-medium">
          {department.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 pb-2">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-muted-foreground">Total</p>
            <p className="font-semibold">{department.totalEmployees}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Present</p>
            <p className="font-semibold text-green-600">{department.presentToday}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Absent</p>
            <p className="font-semibold text-red-600">{department.absentToday}</p>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs mb-1">
            <span>Attendance Rate</span>
            <span className="font-medium">{presentPercentage}%</span>
          </div>
          <Progress value={presentPercentage} className="h-1" />
        </div>
      </CardContent>
    </Card>
  );
}
