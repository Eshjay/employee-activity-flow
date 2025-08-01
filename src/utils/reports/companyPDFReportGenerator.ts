import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { supabase } from '@/integrations/supabase/client';

interface CompanyReportData {
  employee_name: string;
  department: string;
  activities_count: number;
  total_hours: number;
  activities: Array<{
    title: string;
    description: string;
    date: string;
    time_started: string;
    time_ended: string;
    hours: number;
  }>;
}

export const generateCompanyDailyPDFReport = async (): Promise<void> => {
  try {
    console.log('Starting company daily PDF report generation...');
    
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

    // Process data for the report
    const reportData: CompanyReportData[] = [];
    const employeeMap = new Map();

    (activities || []).forEach((activity: any) => {
      const employeeName = activity.profiles?.name || 'Unknown Employee';
      const department = activity.profiles?.department || 'Unknown Department';
      
      if (!employeeMap.has(employeeName)) {
        employeeMap.set(employeeName, {
          employee_name: employeeName,
          department: department,
          activities_count: 0,
          total_hours: 0,
          activities: []
        });
      }
      
      const employee = employeeMap.get(employeeName);
      const hours = calculateActivityHours(activity);
      
      employee.activities_count++;
      employee.total_hours += hours;
      employee.activities.push({
        title: activity.title,
        description: activity.description,
        date: activity.date,
        time_started: activity.time_started || '',
        time_ended: activity.time_ended || '',
        hours: hours
      });
    });

    reportData.push(...employeeMap.values());

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Company Daily Activity Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    const reportDate = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    doc.text(`Report Date: ${reportDate}`, pageWidth / 2, 30, { align: 'center' });

    // Summary statistics
    const totalEmployees = reportData.length;
    const totalActivities = reportData.reduce((sum, emp) => sum + emp.activities_count, 0);
    const totalHours = reportData.reduce((sum, emp) => sum + emp.total_hours, 0);

    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Summary', 20, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`• Active Employees: ${totalEmployees}`, 25, 60);
    doc.text(`• Total Activities: ${totalActivities}`, 25, 70);
    doc.text(`• Total Hours Logged: ${totalHours.toFixed(1)} hours`, 25, 80);

    if (reportData.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(150, 150, 150);
      doc.text('No activities found for today.', pageWidth / 2, 110, { align: 'center' });
    } else {
      // Create employee summary table
      const summaryTableData = reportData.map((emp, index) => [
        index + 1,
        emp.employee_name,
        emp.department,
        emp.activities_count,
        emp.total_hours.toFixed(1) + 'h'
      ]);

      autoTable(doc, {
        head: [['#', 'Employee', 'Department', 'Activities', 'Hours']],
        body: summaryTableData,
        startY: 95,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 },
          1: { cellWidth: 50 },
          2: { cellWidth: 40 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'center', cellWidth: 20 }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          // Footer
          const pageCount = doc.getNumberOfPages();
          const currentPage = doc.getCurrentPageInfo().pageNumber;
          
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Generated on ${new Date().toLocaleString()} | Page ${currentPage} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      });

      // Detailed activities section
      if (reportData.some(emp => emp.activities.length > 0)) {
        doc.addPage();
        
        doc.setFontSize(16);
        doc.setTextColor(52, 73, 94);
        doc.text('Detailed Activities', 20, 20);
        
        let currentY = 35;
        
        reportData.forEach((employee) => {
          if (employee.activities.length > 0) {
            // Check if we need a new page
            if (currentY > doc.internal.pageSize.getHeight() - 60) {
              doc.addPage();
              currentY = 20;
            }
            
            doc.setFontSize(12);
            doc.setTextColor(52, 73, 94);
            doc.text(`${employee.employee_name} (${employee.department})`, 20, currentY);
            currentY += 10;
            
            const activityTableData = employee.activities.map((activity, index) => [
              index + 1,
              activity.title,
              activity.description.length > 50 ? activity.description.substring(0, 50) + '...' : activity.description,
              activity.time_started && activity.time_ended 
                ? `${formatTime(activity.time_started)} - ${formatTime(activity.time_ended)}`
                : 'Not specified',
              activity.hours.toFixed(1) + 'h'
            ]);
            
            autoTable(doc, {
              head: [['#', 'Title', 'Description', 'Time', 'Hours']],
              body: activityTableData,
              startY: currentY,
              styles: {
                fontSize: 8,
                cellPadding: 2,
              },
              headStyles: {
                fillColor: [70, 130, 180],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                fontSize: 9,
              },
              alternateRowStyles: {
                fillColor: [248, 249, 250],
              },
              columnStyles: {
                0: { halign: 'center', cellWidth: 15 },
                1: { cellWidth: 35 },
                2: { cellWidth: 70 },
                3: { cellWidth: 35 },
                4: { halign: 'center', cellWidth: 20 }
              },
              margin: { left: 20, right: 20 },
            });
            
            currentY = (doc as any).lastAutoTable.finalY + 15;
          }
        });
      }
    }

    // Generate filename and save
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Company_Daily_Report_${dateStr}.pdf`;
    doc.save(filename);
    
    console.log(`Company daily PDF report generated: ${filename}`);
  } catch (error) {
    console.error('Error generating company daily PDF report:', error);
    throw error;
  }
};

export const generateCompanyWeeklyPDFReport = async (): Promise<void> => {
  try {
    console.log('Starting company weekly PDF report generation...');
    
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

    // Process data for the report
    const reportData: CompanyReportData[] = [];
    const employeeMap = new Map();
    const dailyStats = new Map();

    (activities || []).forEach((activity: any) => {
      const employeeName = activity.profiles?.name || 'Unknown Employee';
      const department = activity.profiles?.department || 'Unknown Department';
      const activityDate = activity.date;
      
      // Employee summary
      if (!employeeMap.has(employeeName)) {
        employeeMap.set(employeeName, {
          employee_name: employeeName,
          department: department,
          activities_count: 0,
          total_hours: 0,
          activities: []
        });
      }
      
      const employee = employeeMap.get(employeeName);
      const hours = calculateActivityHours(activity);
      
      employee.activities_count++;
      employee.total_hours += hours;
      employee.activities.push({
        title: activity.title,
        description: activity.description,
        date: activity.date,
        time_started: activity.time_started || '',
        time_ended: activity.time_ended || '',
        hours: hours
      });

      // Daily stats
      if (!dailyStats.has(activityDate)) {
        dailyStats.set(activityDate, { activities: 0, hours: 0, employees: new Set() });
      }
      const dayStats = dailyStats.get(activityDate);
      dayStats.activities++;
      dayStats.hours += hours;
      dayStats.employees.add(employeeName);
    });

    reportData.push(...employeeMap.values());

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text('Company Weekly Activity Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    const reportPeriod = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    doc.text(`Report Period: ${reportPeriod}`, pageWidth / 2, 30, { align: 'center' });

    // Summary statistics
    const totalEmployees = profiles?.length || 0;
    const activeEmployees = reportData.length;
    const totalActivities = reportData.reduce((sum, emp) => sum + emp.activities_count, 0);
    const totalHours = reportData.reduce((sum, emp) => sum + emp.total_hours, 0);
    const avgActivitiesPerEmployee = activeEmployees > 0 ? (totalActivities / activeEmployees).toFixed(1) : '0';

    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text('Weekly Summary', 20, 50);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`• Total Employees: ${totalEmployees}`, 25, 60);
    doc.text(`• Active Employees: ${activeEmployees}`, 25, 70);
    doc.text(`• Total Activities: ${totalActivities}`, 25, 80);
    doc.text(`• Total Hours Logged: ${totalHours.toFixed(1)} hours`, 25, 90);
    doc.text(`• Average Activities per Employee: ${avgActivitiesPerEmployee}`, 25, 100);

    // Employee performance table
    if (reportData.length > 0) {
      const performanceTableData = reportData
        .sort((a, b) => b.total_hours - a.total_hours)
        .map((emp, index) => [
          index + 1,
          emp.employee_name,
          emp.department,
          emp.activities_count,
          emp.total_hours.toFixed(1) + 'h',
          emp.activities_count > 0 ? (emp.total_hours / emp.activities_count).toFixed(1) + 'h' : '0h'
        ]);

      autoTable(doc, {
        head: [['Rank', 'Employee', 'Department', 'Activities', 'Total Hours', 'Avg Hours']],
        body: performanceTableData,
        startY: 115,
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [52, 73, 94],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          fontSize: 10,
        },
        alternateRowStyles: {
          fillColor: [248, 249, 250],
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 20 },
          1: { cellWidth: 45 },
          2: { cellWidth: 35 },
          3: { halign: 'center', cellWidth: 25 },
          4: { halign: 'center', cellWidth: 25 },
          5: { halign: 'center', cellWidth: 25 }
        },
        margin: { left: 20, right: 20 },
        didDrawPage: (data) => {
          // Footer
          const pageCount = doc.getNumberOfPages();
          const currentPage = doc.getCurrentPageInfo().pageNumber;
          
          doc.setFontSize(8);
          doc.setTextColor(150, 150, 150);
          doc.text(
            `Generated on ${new Date().toLocaleString()} | Page ${currentPage} of ${pageCount}`,
            pageWidth / 2,
            doc.internal.pageSize.getHeight() - 10,
            { align: 'center' }
          );
        }
      });
    }

    // Generate filename and save
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `Company_Weekly_Report_${dateStr}.pdf`;
    doc.save(filename);
    
    console.log(`Company weekly PDF report generated: ${filename}`);
  } catch (error) {
    console.error('Error generating company weekly PDF report:', error);
    throw error;
  }
};

// Helper functions
const calculateActivityHours = (activity: any): number => {
  if (activity.time_started && activity.time_ended) {
    try {
      const start = new Date(`2000-01-01T${activity.time_started}`);
      const end = new Date(`2000-01-01T${activity.time_ended}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, Math.round(diffHours * 2) / 2);
    } catch {
      return 8;
    }
  }
  return 8;
};

const formatTime = (timeString: string): string => {
  if (!timeString) return '';
  try {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return timeString;
  }
};
