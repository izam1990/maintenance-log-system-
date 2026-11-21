import { useState } from 'react';
import { Edit2, Trash2, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';

const LogDetailModal = ({ log, onClose, onEdit, onDelete, isAdmin }) => {
  if (!log) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200 bg-zinc-50 rounded-t-lg">
          <h2 className="text-lg font-semibold text-zinc-800">Log Details</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-50 rounded p-3">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Date</p>
              <p className="text-sm text-zinc-800">{format(new Date(log.date), 'MMM dd, yyyy')}</p>
            </div>
            <div className="bg-zinc-50 rounded p-3">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Machine</p>
              <p className="text-sm text-zinc-800 font-medium">{log.machine_name}</p>
            </div>
            <div className="bg-zinc-50 rounded p-3">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Location</p>
              <p className="text-sm text-zinc-800">{log.location}</p>
            </div>
            <div className="bg-zinc-50 rounded p-3">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Total Time</p>
              <p className="text-sm text-zinc-800">{log.total_time}</p>
            </div>
            <div className="bg-zinc-50 rounded p-3">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Technician</p>
              <p className="text-sm text-zinc-800">{log.technician_name}</p>
            </div>
            <div className="bg-zinc-50 rounded p-3">
              <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Spare Parts</p>
              <p className="text-sm text-zinc-800">{log.spare_parts || '—'}</p>
            </div>
          </div>
          <div className="bg-zinc-50 rounded p-3">
            <p className="text-xs font-bold uppercase text-zinc-400 mb-1">Work Description</p>
            <p className="text-sm text-zinc-800 leading-relaxed">{log.work_description}</p>
          </div>
        </div>
        {isAdmin && (
          <div className="flex justify-end gap-2 p-4 border-t border-zinc-200">
            <Button onClick={() => { onDelete(log.id); onClose(); }} variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-1" /> Delete
            </Button>
            <Button onClick={() => { onEdit(log); onClose(); }} size="sm" className="bg-slate-900 text-white hover:bg-slate-700">
              <Edit2 className="w-4 h-4 mr-1" /> Edit
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

const LogsTable = ({ logs, onEdit, onDelete, loading, isAdmin }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

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
    <>
      <Card className="bg-white border border-zinc-200 shadow-sm rounded-md">
        <CardHeader className="border-b border-zinc-100 p-4 bg-zinc-50/50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-xl font-semibold">
              Maintenance Logs ({filteredLogs.length} records)
            </CardTitle>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 h-10 bg-white border-zinc-300 rounded-sm" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-zinc-500">Loading logs...</div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-zinc-500">{searchTerm ? 'No logs found.' : 'No logs yet.'}</div>
          ) : (
            <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-100 text-zinc-600 uppercase text-xs font-bold sticky top-0">
                  <tr>
                    <th className="py-3 px-3 bg-zinc-100">Date</th>
                    <th className="py-3 px-3 bg-zinc-100">Machine</th>
                    <th className="py-3 px-3 bg-zinc-100">Location</th>
                    <th className="py-3 px-3 bg-zinc-100">Technician</th>
                    <th className="py-3 px-3 bg-zinc-100">Total Time</th>
                    {isAdmin && <th className="py-3 px-3 bg-zinc-100 text-center">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="border-b border-zinc-100 hover:bg-blue-50 cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <td className="py-3 px-3">{format(new Date(log.date), 'MMM dd, yyyy')}</td>
                      <td className="py-3 px-3 font-medium">{log.machine_name}</td>
                      <td className="py-3 px-3">{log.location}</td>
                      <td className="py-3 px-3">{log.technician_name}</td>
                      <td className="py-3 px-3">{log.total_time}</td>
                      {isAdmin && (
                        <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
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

      <LogDetailModal
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onEdit={onEdit}
        onDelete={onDelete}
        isAdmin={isAdmin}
      />
    </>
  );
};

export default LogsTable;
