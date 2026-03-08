import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Wrench, Calendar, Download, Plus, Settings, FileSpreadsheet } from 'lucide-react';
import LogForm from '@/components/LogForm';
import LogsTable from '@/components/LogsTable';
import StatsCard from '@/components/StatsCard';
import ExportSection from '@/components/ExportSection';
import ConfigModal from '@/components/ConfigModal';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const [logs, setLogs] = useState([]);
  const [config, setConfig] = useState({ machines: [], technicians: [], spareParts: [] });
  const [editingLog, setEditingLog] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
    fetchConfig();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API}/logs`);
      setLogs(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching logs:', error);
      toast.error('Failed to fetch logs');
      setLoading(false);
    }
  };

  const fetchConfig = async () => {
    try {
      const response = await axios.get(`${API}/config`);
      const configData = response.data;
      
      setConfig({
        machines: configData.filter(item => item.type === 'machine'),
        technicians: configData.filter(item => item.type === 'technician'),
        spareParts: configData.filter(item => item.type === 'spare_part')
      });
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleLogSubmit = async (logData) => {
    try {
      if (editingLog) {
        await axios.put(`${API}/logs/${editingLog.id}`, logData);
        toast.success('Log updated successfully');
        setEditingLog(null);
      } else {
        await axios.post(`${API}/logs`, logData);
        toast.success('Log added successfully');
      }
      fetchLogs();
    } catch (error) {
      console.error('Error saving log:', error);
      toast.error('Failed to save log');
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (logId) => {
    if (!window.confirm('Are you sure you want to delete this log?')) return;
    
    try {
      await axios.delete(`${API}/logs/${logId}`);
      toast.success('Log deleted successfully');
      fetchLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Failed to delete log');
    }
  };

  const handleCancelEdit = () => {
    setEditingLog(null);
  };

  const getMonthStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return logDate.getMonth() === currentMonth && logDate.getFullYear() === currentYear;
    });

    const machineCount = {};
    monthLogs.forEach(log => {
      machineCount[log.machine_name] = (machineCount[log.machine_name] || 0) + 1;
    });

    const mostActiveMachine = Object.entries(machineCount).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    return {
      totalLogs: monthLogs.length,
      mostActiveMachine,
      totalMachines: new Set(logs.map(log => log.machine_name)).size
    };
  };

  const stats = getMonthStats();

  return (
    <div className="min-h-screen bg-zinc-100/50">
      <header className="sticky top-0 z-50 h-16 bg-slate-900 text-white flex items-center px-6 shadow-md" data-testid="app-header">
        <div className="flex items-center gap-3">
          <Wrench className="w-6 h-6" />
          <h1 className="text-2xl font-bold uppercase tracking-tight" data-testid="app-title">
            Maintenance Log System
          </h1>
        </div>
        <div className="ml-auto">
          <Button
            onClick={() => setShowConfigModal(true)}
            variant="outline"
            className="bg-white/10 border-white/20 hover:bg-white/20 text-white"
            data-testid="config-button"
          >
            <Settings className="w-4 h-4 mr-2" />
            Manage Dropdowns
          </Button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <StatsCard
            title="Total Logs (This Month)"
            value={stats.totalLogs}
            icon={<FileSpreadsheet className="w-5 h-5" />}
            data-testid="stat-total-logs"
          />
          <StatsCard
            title="Most Active Machine"
            value={stats.mostActiveMachine}
            icon={<Wrench className="w-5 h-5" />}
            data-testid="stat-active-machine"
          />
          <StatsCard
            title="Total Machines"
            value={stats.totalMachines}
            icon={<Settings className="w-5 h-5" />}
            data-testid="stat-total-machines"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 xl:col-span-3 h-fit lg:sticky lg:top-20">
            <LogForm
              onSubmit={handleLogSubmit}
              config={config}
              editingLog={editingLog}
              onCancelEdit={handleCancelEdit}
            />
          </div>

          <div className="lg:col-span-8 xl:col-span-9 space-y-6">
            <ExportSection logs={logs} />
            <LogsTable
              logs={logs}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
            />
          </div>
        </div>
      </main>

      {showConfigModal && (
        <ConfigModal
          config={config}
          onClose={() => setShowConfigModal(false)}
          onUpdate={fetchConfig}
        />
      )}
    </div>
  );
};

export default Dashboard;