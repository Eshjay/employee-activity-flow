import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Activity } from '@/hooks/useActivities';

interface EmployeeReportData {
  employeeName: string;
  activities: Activity[];
  reportDate: string;
}

export const generateEmployeePDFReport = async (
  employeeName: string,
  activities: Activity[],
  reportType: 'daily' | 'full' = 'daily'
): Promise<void> => {
  try {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Header
    doc.setFontSize(20);
    doc.setTextColor(44, 62, 80);
    doc.text(`Employee Activity Report`, pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`${reportType === 'daily' ? 'Daily Report' : 'Full History'} - ${today}`, pageWidth / 2, 30, { align: 'center' });

    // Employee Info
    doc.setFontSize(16);
    doc.setTextColor(52, 73, 94);
    doc.text(`Employee: ${employeeName}`, 20, 50);
    
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(`Total Activities: ${activities.length}`, 20, 60);

    if (activities.length === 0) {
      doc.setFontSize(14);
      doc.setTextColor(150, 150, 150);
      doc.text('No activities found for this period.', pageWidth / 2, 100, { align: 'center' });
    } else {
      // Prepare table data
      const tableData = activities.map((activity, index) => {
        const activityDate = new Date(activity.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        
        const timeRange = activity.time_started && activity.time_ended
          ? `${formatTime(activity.time_started)} - ${formatTime(activity.time_ended)}`
          : 'Not specified';

        const hours = calculateHours(activity);
        
        return [
          index + 1,
          activity.title,
          activity.description.length > 60 
            ? activity.description.substring(0, 60) + '...'
            : activity.description,
          activityDate,
          timeRange,
          `${hours}h`
        ];
      });

      // Create table
      autoTable(doc, {
        head: [['#', 'Title', 'Description', 'Date', 'Time', 'Hours']],
        body: tableData,
        startY: 75,
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
          1: { cellWidth: 40 },
          2: { cellWidth: 60 },
          3: { cellWidth: 25 },
          4: { cellWidth: 30 },
          5: { halign: 'center', cellWidth: 20 }
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

      // Summary section
      const finalY = (doc as any).lastAutoTable.finalY || 120;
      
      if (finalY < doc.internal.pageSize.getHeight() - 60) {
        doc.setFontSize(14);
        doc.setTextColor(52, 73, 94);
        doc.text('Summary', 20, finalY + 20);
        
        const totalHours = activities.reduce((sum, activity) => sum + calculateHours(activity), 0);
        const averageHours = activities.length > 0 ? (totalHours / activities.length).toFixed(1) : 0;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`• Total Hours Logged: ${totalHours} hours`, 25, finalY + 35);
        doc.text(`• Average Hours per Activity: ${averageHours} hours`, 25, finalY + 45);
        doc.text(`• Report Period: ${reportType === 'daily' ? 'Today' : 'All Time'}`, 25, finalY + 55);
      }
    }

    // Generate filename
    const sanitizedName = employeeName.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `${sanitizedName}_activity_report_${dateStr}.pdf`;

    // Save the PDF
    doc.save(filename);
    
    console.log(`PDF report generated: ${filename}`);
  } catch (error) {
    console.error('Error generating PDF report:', error);
    throw error;
  }
};

// Helper functions
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

const calculateHours = (activity: Activity): number => {
  if (activity.time_started && activity.time_ended) {
    try {
      const start = new Date(`2000-01-01T${activity.time_started}`);
      const end = new Date(`2000-01-01T${activity.time_ended}`);
      const diffMs = end.getTime() - start.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      return Math.max(0, Math.round(diffHours * 2) / 2); // Round to nearest 0.5
    } catch {
      return 8; // Default fallback
    }
  }
  return 8; // Default 8 hours if no time specified
};
