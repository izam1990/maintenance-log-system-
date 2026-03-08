import { useState } from 'react';
import axios from 'axios';
import { X, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ConfigModal = ({ config, onClose, onUpdate }) => {
  const [newItem, setNewItem] = useState({ machines: '', technicians: '', spareParts: '' });

  const handleAddItem = async (type) => {
    const typeMap = {
      machines: 'machine',
      technicians: 'technician',
      spareParts: 'spare_part'
    };

    const name = newItem[type].trim();
    if (!name) {
      toast.error('Please enter a name');
      return;
    }

    try {
      await axios.post(`${API}/config`, {
        name,
        type: typeMap[type]
      });
      toast.success('Item added successfully');
      setNewItem({ ...newItem, [type]: '' });
      onUpdate();
    } catch (error) {
      console.error('Error adding config item:', error);
      toast.error(error.response?.data?.detail || 'Failed to add item');
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await axios.delete(`${API}/config/${id}`);
      toast.success('Item deleted successfully');
      onUpdate();
    } catch (error) {
      console.error('Error deleting config item:', error);
      toast.error('Failed to delete item');
    }
  };

  const renderSection = (title, items, type) => (
    <div className="space-y-3">
      <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-600">{title}</h3>
      <div className="flex gap-2">
        <Input
          value={newItem[type]}
          onChange={(e) => setNewItem({ ...newItem, [type]: e.target.value })}
          placeholder={`Add ${title.toLowerCase().slice(0, -1)}`}
          className="h-10 bg-white border-zinc-300 rounded-sm"
          data-testid={`${type}-input`}
          onKeyPress={(e) => e.key === 'Enter' && handleAddItem(type)}
        />
        <Button
          onClick={() => handleAddItem(type)}
          className="bg-slate-900 hover:bg-slate-800 text-white h-10 px-4 rounded-sm"
          data-testid={`add-${type}-button`}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="space-y-2 max-h-40 overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No items added yet</p>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 bg-zinc-50 rounded-sm border border-zinc-200"
              data-testid={`${type}-item-${item.name}`}
            >
              <span className="text-sm">{item.name}</span>
              <Button
                onClick={() => handleDeleteItem(item.id)}
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                data-testid={`delete-${type}-button-${item.id}`}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" data-testid="config-modal-overlay">
      <Card className="w-full max-w-2xl bg-white border border-zinc-200 shadow-lg rounded-md max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="border-b border-zinc-100 p-4 bg-zinc-50/50 flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold" data-testid="config-modal-title">
            Manage Dropdown Lists
          </CardTitle>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            data-testid="close-config-modal-button"
          >
            <X className="w-5 h-5" />
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-6 overflow-y-auto">
          {renderSection('Machines', config.machines, 'machines')}
          {renderSection('Technicians', config.technicians, 'technicians')}
          {renderSection('Spare Parts', config.spareParts, 'spareParts')}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConfigModal;