COPY ALL OF THIS CODE and paste it:

import { useState } from 'react';
import { Edit2, Trash2, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const LogsTable = ({ logs, onEdit, onDelete, loading, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDescription, setExpandedDescription] = useState(null);

  const filteredLogs = logs.filter(log => {
    const search = searchTerm.toLowerCase();
    return (
      log.machine_name.toLowerCase().includes(search) ||
      log.location.toLowerCase().includes(search) ||
      log.work_description.toLowerCase().includes(search) ||
      log.spare_parts.toLowerCase().includes(search) ||
      log.total_time.toLowerCase().includes(search) ||
      log.technician_name.toLowerCase().includes(search) ||
      log.date.includes(search)
    );
  });

  const handleDescriptionClick = (log) => {
    setExpandedDescription(log);
  };

  const closeDescriptionModal = () => {
    setExpandedDescription(null);
  };

  const TABLE_MAX_HEIGHT = 624;

  return (
    <>
      <Card className="bg-white border border-zinc-200 shadow-sm rounded-md" data-testid="logs-table-card">
        <CardHeader className="border-b border-zinc-100 p-4 bg-zinc-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl font-semibold" data-testid="logs-table-title">
              Maintenance Logs
              {filteredLogs.length > 0 && (
                <span className="ml-2 text-sm font-normal text-zinc-500">
                  ({filteredLogs.length} {filteredLogs.length === 1 ? 'record' : 'records'})
                </span>
              )}
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
            <div 
              className="overflow-auto"
              style={{ maxHeight: `${TABLE_MAX_HEIGHT}px` }}
            >
              <table className="w-full text-sm text-left min-w-[900px]" data-testid="logs-table">
                <thead className="bg-zinc-100 text-zinc-600 uppercase text-xs font-bold tracking-wider sticky top-0 z-10 shadow-sm">
                  <tr>
                    <th className="py-3 px-4 bg-zinc-100">Date</th>
                    <th className="py-3 px-4 bg-zinc-100">Machine</th>
                    <th className="py-3 px-4 bg-zinc-100">Location</th>
                    <th className="py-3 px-4 bg-zinc-100 min-w-[200px]">Work Description</th>
                    <th className="py-3 px-4 bg-zinc-100">Spare Parts</th>
                    <th className="py-3 px-4 bg-zinc-100">Total Time</th>
                    <th className="py-3 px-4 bg-zinc-100">Technician</th>
                    {isAdmin && <th className="py-3 px-4 bg-zinc-100 text-center">Actions</th>}
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
                      <td className="py-3 px-4 align-middle font-medium whitespace-nowrap" data-testid={`log-machine-${log.id}`}>
                        {log.machine_name}
                      </td>
                      <td className="py-3 px-4 align-middle whitespace-nowrap" data-testid={`log-location-${log.id}`}>
                        {log.location}
                      </td>
                      <td 
                        className="py-3 px-4 align-middle max-w-[200px] cursor-pointer hover:bg-blue-50 rounded transition-colors" 
                        data-testid={`log-description-${log.id}`}
                        onClick={() => handleDescriptionClick(log)}
                        title="Click to view full description"
                      >
                        <div className="truncate text-blue-600 underline decoration-dotted underline-offset-2">
                          {log.work_description}
                        </div>
                      </td>
                      <td className="py-3 px-4 align-middle whitespace-nowrap" data-testid={`log-spare-parts-${log.id}`}>
                        {log.spare_parts}
                      </td>
                      <td className="py-3 px-4 align-middle whitespace-nowrap" data-testid={`log-total-time-${log.id}`}>
                        {log.total_time}
                      </td>
                      <td className="py-3 px-4 align-middle whitespace-nowrap" data-testid={`log-technician-${log.id}`}>
                        {log.technician_name}
                      </td>
                      {isAdmin && (
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
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {expandedDescription && (
        <div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeDescriptionModal}
          data-testid="description-modal-overlay"
        >
          <div 
            className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            data-testid="description-modal"
          >
            <div className="flex items-center justify-between p-4 border-b bg-slate-900 text-white">
              <h3 className="font-semibold text-lg">Work Description</h3>
              <Button
                onClick={closeDescriptionModal}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-white/20 text-white"
                data-testid="close-description-modal"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="p-4 space-y-3 overflow-y-auto max-h-[calc(80vh-60px)]">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-zinc-500">Date:</div>
                <div className="font-medium">{format(new Date(expandedDescription.date), 'MMM dd, yyyy')}</div>
                <div className="text-zinc-500">Machine:</div>
                <div className="font-medium">{expandedDescription.machine_name}</div>
                <div className="text-zinc-500">Location:</div>
                <div className="font-medium">{expandedDescription.location}</div>
                <div className="text-zinc-500">Technician:</div>
                <div className="font-medium">{expandedDescription.technician_name}</div>
              </div>
              <hr className="my-3" />
              <div>
                <div className="text-zinc-500 text-sm mb-2">Full Description:</div>
                <div className="bg-zinc-50 p-3 rounded-md text-zinc-800 whitespace-pre-wrap">
                  {expandedDescription.work_description}
                </div>
              </div>
              {expandedDescription.spare_parts && (
                <div>
                  <div className="text-zinc-500 text-sm mb-1">Spare Parts Used:</div>
                  <div className="font-medium">{expandedDescription.spare_parts}</div>
                </div>
              )}
              {expandedDescription.total_time && (
                <div>
                  <div className="text-zinc-500 text-sm mb-1">Total Time:</div>
                  <div className="font-medium">{expandedDescription.total_time}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LogsTable;
