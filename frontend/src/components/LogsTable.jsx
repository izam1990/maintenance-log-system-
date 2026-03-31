import { useState } from 'react';
import { Edit2, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const LogsTable = ({ logs, onEdit, onDelete, loading, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <Card className="bg-white border border-zinc-200 shadow-sm rounded-md">
      <CardHeader className="border-b border-zinc-100 p-4 bg-zinc-50/50">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <CardTitle className="text-xl font-semibold">
            Maintenance Logs ({filteredLogs.length} records)
          </CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <Input
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-white border-zinc-300 rounded-sm"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="p-8 text-center text-zinc-500">Loading logs...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            {searchTerm ? 'No logs found.' : 'No logs yet.'}
          </div>
        ) : (
          <div className="overflow-auto" style={{maxHeight: '600px'}}>
            <table className="w-full text-sm text-left min-w-[900px]">
              <thead className="bg-zinc-100 text-zinc-600 uppercase text-xs font-bold sticky top-0">
                <tr>
                  <th className="py-3 px-4 bg-zinc-100">Date</th>
                  <th className="py-3 px-4 bg-zinc-100">Machine</th>
                  <th className="py-3 px-4 bg-zinc-100">Location</th>
                  <th className="py-3 px-4 bg-zinc-100">Work Description</th>
                  <th className="py-3 px-4 bg-zinc-100">Spare Parts</th>
                  <th className="py-3 px-4 bg-zinc-100">Total Time</th>
                  <th className="py-3 px-4 bg-zinc-100">Technician</th>
                  {isAdmin && <th className="py-3 px-4 bg-zinc-100 text-center">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-zinc-100 hover:bg-zinc-50">
                    <td className="py-3 px-4 whitespace-nowrap">{format(new Date(log.date), 'MMM dd, yyyy')}</td>
                    <td className="py-3 px-4 font-medium whitespace-nowrap">{log.machine_name}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{log.location}</td>
                    <td className="py-3 px-4" style={{maxWidth: '400px', wordWrap: 'break-word'}}>{log.work_description}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{log.spare_parts}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{log.total_time}</td>
                    <td className="py-3 px-4 whitespace-nowrap">{log.technician_name}</td>
                    {isAdmin && (
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button onClick={() => onEdit(log)} variant="ghost" size="sm" className="h-8 w-8 p-0"><Edit2 className="w-4 h-4" /></Button>
                          <Button onClick={() => onDelete(log.id)} variant="ghost" size="sm" className="h-8 w-8 p-0"><Trash2 className="w-4 h-4" /></Button>
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
  );
};

export default LogsTable;
