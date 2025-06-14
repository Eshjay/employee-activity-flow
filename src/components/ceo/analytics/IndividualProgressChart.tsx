
import { useState } from "react";
import { TopPerformers } from "./TopPerformers";
import { EmployeeList } from "./EmployeeList";
import { ProgressChart } from "./ProgressChart";
import { processEmployeeData } from "./utils";
import type { IndividualProgressChartProps, ExtendedEmployeeData } from "./types";

export const IndividualProgressChart = ({ employees, activities, timeRange }: IndividualProgressChartProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<ExtendedEmployeeData | null>(null);

  const employeeData = processEmployeeData(employees, activities);
  const topPerformers = employeeData.slice(0, 3);

  return (
    <div className="space-y-6">
      <TopPerformers 
        topPerformers={topPerformers}
        timeRange={timeRange}
        onSelectEmployee={setSelectedEmployee}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <EmployeeList 
          employeeData={employeeData}
          selectedEmployee={selectedEmployee}
          onSelectEmployee={setSelectedEmployee}
        />

        <ProgressChart 
          selectedEmployee={selectedEmployee}
          activities={activities}
          timeRange={timeRange}
        />
      </div>
    </div>
  );
};
