import { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';

const LogForm = ({ onSubmit, config, editingLog, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    machine_name: '',
    location: '',
    work_description: '',
    spare_parts: '',
    total_time: '',
    technician_name: ''
  });
  const [calendarDate, setCalendarDate] = useState(new Date());

  useEffect(() => {
    if (editingLog) {
      setFormData({
        date: editingLog.date,
        machine_name: editingLog.machine_name,
        location: editingLog.location,
        work_description: editingLog.work_description,
        spare_parts: editingLog.spare_parts,
        total_time: editingLog.total_time,
        technician_name: editingLog.technician_name
      });
      setCalendarDate(new Date(editingLog.date));
    }
  }, [editingLog]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    if (!editingLog) {
      setFormData({
        date: format(new Date(), 'yyyy-MM-dd'),
        machine_name: '',
        location: '',
        work_description: '',
        spare_parts: '',
        total_time: '',
        technician_name: ''
      });
      setCalendarDate(new Date());
    }
  };

  const handleDateSelect = (date) => {
    if (date) {
      setCalendarDate(date);
      setFormData({ ...formData, date: format(date, 'yyyy-MM-dd') });
    }
  };

  return (
    <Card className="bg-white border border-zinc-200 shadow-sm rounded-md" data-testid="log-form-card">
      <CardHeader className="border-b border-zinc-100 p-4 bg-zinc-50/50">
        <CardTitle className="text-xl font-semibold flex items-center gap-2" data-testid="form-title">
          <Plus className="w-5 h-5" />
          {editingLog ? 'Edit Log Entry' : 'Add Log Entry'}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="date" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Date
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal h-11 bg-white border-zinc-300 hover:bg-zinc-50 rounded-sm"
                  data-testid="date-picker-trigger"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {format(calendarDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" data-testid="date-picker-popover">
                <CalendarComponent
                  mode="single"
                  selected={calendarDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label htmlFor="machine_name" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Machine Name
            </Label>
            <Select
              value={formData.machine_name}
              onValueChange={(value) => setFormData({ ...formData, machine_name: value })}
              required
            >
              <SelectTrigger className="h-11 bg-white border-zinc-300 rounded-sm" data-testid="machine-select">
                <SelectValue placeholder="Select machine" />
              </SelectTrigger>
              <SelectContent data-testid="machine-select-content">
                {config.machines.length === 0 ? (
                  <SelectItem value="none" disabled>No machines configured</SelectItem>
                ) : (
                  config.machines.map((machine) => (
                    <SelectItem key={machine.id} value={machine.name} data-testid={`machine-option-${machine.name}`}>
                      {machine.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Location
            </Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              required
              className="h-11 bg-white border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-sm"
              placeholder="Enter machine location"
              data-testid="location-input"
            />
          </div>

          <div>
            <Label htmlFor="work_description" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Work Description
            </Label>
            <Textarea
              id="work_description"
              value={formData.work_description}
              onChange={(e) => setFormData({ ...formData, work_description: e.target.value })}
              required
              className="min-h-[100px] bg-white border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-sm resize-none"
              placeholder="Describe the maintenance work performed"
              data-testid="work-description-input"
            />
          </div>

          <div>
            <Label htmlFor="spare_parts" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Spare Parts Used
            </Label>
            <Select
              value={formData.spare_parts}
              onValueChange={(value) => setFormData({ ...formData, spare_parts: value })}
              required
            >
              <SelectTrigger className="h-11 bg-white border-zinc-300 rounded-sm" data-testid="spare-parts-select">
                <SelectValue placeholder="Select spare parts" />
              </SelectTrigger>
              <SelectContent data-testid="spare-parts-select-content">
                {config.spareParts.length === 0 ? (
                  <SelectItem value="none" disabled>No spare parts configured</SelectItem>
                ) : (
                  config.spareParts.map((part) => (
                    <SelectItem key={part.id} value={part.name} data-testid={`spare-part-option-${part.name}`}>
                      {part.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="total_time" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Total Time
            </Label>
            <Input
              id="total_time"
              value={formData.total_time}
              onChange={(e) => setFormData({ ...formData, total_time: e.target.value })}
              required
              className="h-11 bg-white border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-sm"
              placeholder="e.g., 2 hours, 30 mins"
              data-testid="total-time-input"
            />
          </div>

          <div>
            <Label htmlFor="technician_name" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
              Done By (Technician)
            </Label>
            <Select
              value={formData.technician_name}
              onValueChange={(value) => setFormData({ ...formData, technician_name: value })}
              required
            >
              <SelectTrigger className="h-11 bg-white border-zinc-300 rounded-sm" data-testid="technician-select">
                <SelectValue placeholder="Select technician" />
              </SelectTrigger>
              <SelectContent data-testid="technician-select-content">
                {config.technicians.length === 0 ? (
                  <SelectItem value="none" disabled>No technicians configured</SelectItem>
                ) : (
                  config.technicians.map((tech) => (
                    <SelectItem key={tech.id} value={tech.name} data-testid={`technician-option-${tech.name}`}>
                      {tech.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="submit"
              className="flex-1 bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium rounded-sm h-10 uppercase tracking-wide text-sm active:scale-[0.98] transition-all duration-200"
              data-testid="submit-log-button"
            >
              {editingLog ? 'Update Log' : 'Add Log'}
            </Button>
            {editingLog && (
              <Button
                type="button"
                onClick={onCancelEdit}
                variant="outline"
                className="bg-white border border-zinc-300 hover:bg-zinc-50 text-slate-900 shadow-sm font-medium rounded-sm h-10 px-6 active:scale-[0.98] transition-all duration-200"
                data-testid="cancel-edit-button"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default LogForm;