import { useState } from 'react';
import { Edit2, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const LogsTable = ({ logs, onEdit, onDelete, loading }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    return (
      log.machine_name.toLowerCase().includes(search) ||
      log.location.toLowerCase().includes(search) ||
      log.work_description.toLowerCase().includes(search) ||
      log.spare_parts.toLowerCase().includes(search) ||
      log.technician_name.toLowerCase().includes(search) ||
      log.date.includes(search)
    );
  });

  return (
    <Card className="bg-white border border-zinc-200 shadow-sm rounded-md" data-testid="logs-table-card">
      <CardHeader className="border-b border-zinc-100 p-4 bg-zinc-50/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-xl font-semibold" data-testid="logs-table-title">
            Maintenance Logs
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-zinc-300 rounded-sm"
              data-testid="search-logs-input"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-zinc-500" data-testid="loading-message">
            Loading logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500" data-testid="no-logs-message">
            {searchTerm ? 'No logs found matching your search.' : 'No logs yet. Add your first maintenance log!'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left" data-testid="logs-table">
              <thead className="bg-zinc-100 text-zinc-600 uppercase text-xs font-bold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Machine</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Work Description</th>
                  <th className="py-3 px-4">Spare Parts</th>
                  <th className="py-3 px-4">Technician</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50/80 transition-colors"
                    data-testid={`log-row-${log.id}`}
                  >
                    <td className="py-3 px-4 align-middle whitespace-nowrap" data-testid={`log-date-${log.id}`}>
                      {format(new Date(log.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4 align-middle font-medium" data-testid={`log-machine-${log.id}`}>
                      {log.machine_name}
                    </td>
                    <td className="py-3 px-4 align-middle" data-testid={`log-location-${log.id}`}>
                      {log.location}
                    </td>
                    <td className="py-3 px-4 align-middle max-w-xs truncate" data-testid={`log-description-${log.id}`}>
                      {log.work_description}
                    </td>
                    <td className="py-3 px-4 align-middle" data-testid={`log-spare-parts-${log.id}`}>
                      {log.spare_parts}
                    </td>
                    <td className="py-3 px-4 align-middle" data-testid={`log-technician-${log.id}`}>
                      {log.technician_name}
                    </td>
                    <td className="py-3 px-4 align-middle">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          onClick={() => onEdit(log)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          data-testid={`edit-log-button-${log.id}`}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => onDelete(log.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          data-testid={`delete-log-button-${log.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LogsTable;