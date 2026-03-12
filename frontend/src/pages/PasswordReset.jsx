import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Key, ArrowLeft, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuthHeader, isAdmin } from '@/utils/auth';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const PasswordReset = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useState(() => {
    if (!isAdmin()) {
      navigate('/login');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/auth/users`, { headers: getAuthHeader() });
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (!selectedUsername || !newPassword) {
      toast.error('Please select a user and enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${API}/auth/reset-password`,
        { username: selectedUsername, new_password: newPassword },
        { headers: getAuthHeader() }
      );
      
      toast.success(`Password reset successfully for ${selectedUsername}`);
      setSelectedUsername('');
      setNewPassword('');
    } catch (error) {
      console.error('Error resetting password:', error);
      toast.error(error.response?.data?.detail || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-zinc-200 shadow-lg rounded-md">
        <CardHeader className="border-b border-zinc-100 p-6 bg-zinc-50/50">
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="mr-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <CardTitle className="text-xl font-bold uppercase tracking-tight">
              Reset User Password
            </CardTitle>
          </div>
          <p className="text-sm text-zinc-600 mt-2">Admin only - Reset password for any user</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                <Users className="w-3 h-3 inline mr-1" />
                Select User
              </Label>
              <select
                value={selectedUsername}
                onChange={(e) => setSelectedUsername(e.target.value)}
                className="w-full h-11 bg-white border border-zinc-300 rounded-sm px-3 focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                required
              >
                <option value="">-- Select a user --</option>
                {users.map((user) => (
                  <option key={user.username} value={user.username}>
                    {user.username} {user.role === 'admin' ? '(Admin)' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                <Key className="w-3 h-3 inline mr-1" />
                New Password
              </Label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                className="h-11 bg-white border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-sm"
                placeholder="Enter new password (min 6 characters)"
              />
              <p className="text-xs text-zinc-500 mt-1">Minimum 6 characters</p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium rounded-sm h-11 uppercase tracking-wide text-sm"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-sm">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After resetting a password, the user should login with their username and the new password you set.
            </p>
          </div>

          <div className="mt-4">
            <Button
              onClick={() => navigate('/')}
              variant="outline"
              className="w-full"
            >
              Back to Dashboard
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordReset;
