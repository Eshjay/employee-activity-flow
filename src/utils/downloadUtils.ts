
import { supabase } from '@/integrations/supabase/client';

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

const calculateHoursWorked = (timeStarted: string | null, timeEnded: string | null): number => {
  if (!timeStarted || !timeEnded) return 0;
  
  const start = new Date(`1970-01-01T${timeStarted}`);
  const end = new Date(`1970-01-01T${timeEnded}`);
  
  const diffMs = end.getTime() - start.getTime();
  return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
};

export const generateDailyReport = async (): Promise<void> => {
  try {
    console.log('Generating daily report with real data...');
    
    // Get today's date
    const today = new Date().toISOString().split('T')[0];
    
    // Fetch today's activities with profile information
    const { data: activities, error } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          name,
          department
        )
      `)
      .eq('date', today)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching activities:', error);
      throw error;
    }

    console.log('Fetched activities:', activities?.length || 0);

    // Transform data for CSV export
    const reportData = (activities || []).map(activity => ({
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
    }));

    if (reportData.length === 0) {
      console.warn('No activities found for today');
      // Create a placeholder entry to indicate no data
      reportData.push({
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
      });
    }

    const filename = `daily-report-${today}.csv`;
    generateCSVContent(reportData, filename);
  } catch (error) {
    console.error('Error generating daily report:', error);
    throw error;
  }
};

export const generateWeeklyReport = async (): Promise<void> => {
  try {
    console.log('Generating weekly report with real data...');
    
    // Calculate date range for the past 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];

    // Fetch activities from the past week
    const { data: activities, error: activitiesError } = await supabase
      .from('activities')
      .select(`
        *,
        profiles:user_id (
          name,
          department
        )
      `)
      .gte('date', startDateStr)
      .lte('date', endDateStr);

    if (activitiesError) {
      console.error('Error fetching weekly activities:', activitiesError);
      throw activitiesError;
    }

    // Fetch total employee count
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('role', 'employee');

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }

    console.log('Fetched weekly activities:', activities?.length || 0);
    console.log('Total employees:', profiles?.length || 0);

    // Calculate statistics
    const totalEmployees = profiles?.length || 0;
    const uniqueSubmitters = new Set((activities || []).map(a => a.user_id)).size;
    const totalHours = (activities || []).reduce((sum, activity) => {
      return sum + calculateHoursWorked(activity.time_started, activity.time_ended);
    }, 0);
    const averageHoursPerEmployee = totalEmployees > 0 ? Math.round((totalHours / totalEmployees) * 100) / 100 : 0;

    const weekStart = startDate.toLocaleDateString();
    const weekEnd = endDate.toLocaleDateString();

    const reportData = [{
      week: `${weekStart} - ${weekEnd}`,
      totalEmployees: totalEmployees,
      employeesSubmitted: uniqueSubmitters,
      totalActivities: activities?.length || 0,
      totalHours: Math.round(totalHours * 100) / 100,
      averageHoursPerEmployee: averageHoursPerEmployee,
      completedActivities: activities?.length || 0,
      pendingActivities: Math.max(0, totalEmployees - uniqueSubmitters),
      submissionRate: totalEmployees > 0 ? Math.round((uniqueSubmitters / totalEmployees) * 100) : 0
    }];

    const filename = `weekly-summary-${endDateStr}.json`;
    generateJSONContent(reportData, filename);
  } catch (error) {
    console.error('Error generating weekly report:', error);
    throw error;
  }
};
