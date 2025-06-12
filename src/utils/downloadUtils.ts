
export const generateCSVContent = (data: any[], filename: string): void => {
  if (!data || data.length === 0) {
    console.error('No data to export');
    return;
  }

  // Get headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    headers.join(','), // Header row
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes in values
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadFile(csvContent, filename, 'text/csv');
};

export const generateJSONContent = (data: any, filename: string): void => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json');
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateDailyReport = () => {
  const mockData = [
    {
      employee: "John Smith",
      department: "Development",
      date: "2024-06-12",
      hoursWorked: 8,
      activities: "Code review and bug fixes",
      status: "Completed"
    },
    {
      employee: "Emma Davis",
      department: "Design",
      date: "2024-06-12",
      hoursWorked: 7.5,
      activities: "UI/UX design for new features",
      status: "Completed"
    },
    {
      employee: "Sarah Johnson",
      department: "Executive",
      date: "2024-06-12",
      hoursWorked: 8,
      activities: "Strategic planning and team meetings",
      status: "Completed"
    }
  ];

  const filename = `daily-report-${new Date().toISOString().split('T')[0]}.csv`;
  generateCSVContent(mockData, filename);
};

export const generateWeeklyReport = () => {
  const mockData = [
    {
      week: "June 10-16, 2024",
      totalEmployees: 12,
      totalHours: 480,
      completedActivities: 47,
      pendingActivities: 3,
      averageHoursPerEmployee: 8
    }
  ];

  const filename = `weekly-summary-${new Date().toISOString().split('T')[0]}.json`;
  generateJSONContent(mockData, filename);
};
