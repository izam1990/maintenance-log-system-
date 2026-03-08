import { useState } from 'react';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { format } from 'date-fns';

const ExportSection = ({ logs }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(currentYear));

  const months = [
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);

  const handleExport = () => {
    const month = parseInt(selectedMonth);
    const year = parseInt(selectedYear);

    const filteredLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() + 1 === month && logDate.getFullYear() === year;
    });

    if (filteredLogs.length === 0) {
      toast.error('No logs found for selected month and year');
      return;
    }

    const exportData = filteredLogs.map(log => ({
      'Date': format(new Date(log.date), 'yyyy-MM-dd'),
      'Machine Name': log.machine_name,
      'Location': log.location,
      'Work Description': log.work_description,
      'Spare Parts Used': log.spare_parts,
      'Total Time': log.total_time,
      'Technician': log.technician_name
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Maintenance Logs');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const monthName = months.find(m => m.value === selectedMonth)?.label;
    const fileName = `Maintenance_Logs_${monthName}_${year}.xlsx`;
    
    saveAs(data, fileName);
    toast.success(`Excel file exported: ${fileName}`);
  };

  return (
    <Card className="bg-white border border-zinc-200 shadow-sm rounded-md" data-testid="export-section-card">
      <CardHeader className="border-b border-zinc-100 p-4 bg-zinc-50/50">
        <CardTitle className="text-xl font-semibold flex items-center gap-2" data-testid="export-title">
          <Download className="w-5 h-5" />
          Export to Excel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2 block">
              Month
            </label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="h-11 bg-white border-zinc-300 rounded-sm" data-testid="month-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent data-testid="month-select-content">
                {months.map(month => (
                  <SelectItem key={month.value} value={month.value} data-testid={`month-option-${month.value}`}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2 block">
              Year
            </label>
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="h-11 bg-white border-zinc-300 rounded-sm" data-testid="year-select">
                <SelectValue />
              </SelectTrigger>
              <SelectContent data-testid="year-select-content">
                {years.map(year => (
                  <SelectItem key={year} value={String(year)} data-testid={`year-option-${year}`}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleExport}
              className="bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium rounded-sm h-11 px-6 uppercase tracking-wide text-sm active:scale-[0.98] transition-all duration-200"
              data-testid="export-excel-button"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportSection;