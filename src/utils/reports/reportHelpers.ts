
export const calculateHoursWorked = (timeStarted: string | null, timeEnded: string | null): number => {
  if (!timeStarted || !timeEnded) return 0;
  
  const start = new Date(`1970-01-01T${timeStarted}`);
  const end = new Date(`1970-01-01T${timeEnded}`);
  
  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
};

export const createEmptyDailyReportData = (today: string) => {
  return [{
    employee: 'No submissions',
    department: 'N/A',
    date: today,
    hoursWorked: 0,
    title: 'No activities submitted today',
    description: 'No activities were submitted for this date',
    activities: 'No activities submitted today',
    timeStarted: 'N/A',
    timeEnded: 'N/A',
    status: 'No Data'
  }];
};

export const createEmptyWeeklyReportData = (startDate: Date, endDate: Date) => {
  const startDateStr = startDate.toISOString().split('T')[0];
  return [{
    employee: 'No submissions',
    department: 'N/A',
    date: startDateStr,
    hoursWorked: 0,
    title: 'No activities submitted this week',
    description: 'No activities were submitted for this week period',
    activities: 'No activities submitted this week',
    timeStarted: 'N/A',
    timeEnded: 'N/A',
    status: 'No Data',
    weekPeriod: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  }];
};

export const transformActivityToReportData = (activity: any) => ({
  employee: activity.profiles?.name || 'Unknown Employee',
  department: activity.profiles?.department || 'Unknown Department',
  date: activity.date,
  hoursWorked: calculateHoursWorked(activity.time_started, activity.time_ended),
  title: activity.title,
  description: activity.description,
  activities: activity.comments || activity.description,
  timeStarted: activity.time_started || 'Not specified',
  timeEnded: activity.time_ended || 'Not specified',
  status: 'Completed'
});

export const transformActivityToWeeklyReportData = (activity: any, startDate: Date, endDate: Date) => ({
  ...transformActivityToReportData(activity),
  weekPeriod: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
});

export const createWeeklySummaryData = (
  activities: any[], 
  profiles: any[], 
  startDate: Date, 
  endDate: Date
) => {
  const totalEmployees = profiles?.length || 0;
  const uniqueSubmitters = new Set((activities || []).map(a => a.user_id)).size;
  const totalHours = (activities || []).reduce((sum, activity) => {
    return sum + calculateHoursWorked(activity.time_started, activity.time_ended);
  }, 0);

  return {
    employee: 'SUMMARY',
    department: 'Statistics',
    date: 'Week Summary',
    hoursWorked: Math.round(totalHours * 100) / 100,
    title: 'Total Statistics',
    description: `Total Employees: ${totalEmployees}, Submitted: ${uniqueSubmitters}`,
    activities: `${activities?.length || 0} total activities submitted`,
    timeStarted: 'N/A',
    timeEnded: 'N/A',
    status: `${Math.round((uniqueSubmitters / Math.max(totalEmployees, 1)) * 100)}% submission rate`,
    weekPeriod: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
  };
};
