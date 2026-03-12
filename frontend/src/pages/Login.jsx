import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Wrench, LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const response = await axios.post(`${API}${endpoint}`, formData);
      
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('role', response.data.role);
      
      if (response.data.role === 'admin') {
        toast.success(isLogin ? 'Welcome Admin!' : 'Admin account created!');
      } else {
        toast.success(isLogin ? 'Login successful!' : 'Account created!');
      }
      
      navigate('/');
    } catch (error) {
      console.error('Auth error:', error);
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border border-zinc-200 shadow-lg rounded-md" data-testid="login-card">
        <CardHeader className="border-b border-zinc-100 p-6 bg-zinc-50/50 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-slate-900 rounded-md flex items-center justify-center">
              <Wrench className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold uppercase tracking-tight" data-testid="login-title">
            Maintenance Log System
          </CardTitle>
          <p className="text-sm text-zinc-600 mt-2">
            {isLogin ? 'Sign in to access your logs' : 'Create an account to get started'}
          </p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
                className="h-11 bg-white border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-sm"
                placeholder="Enter your username"
                data-testid="username-input"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-zinc-600">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                className="h-11 bg-white border-zinc-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-sm"
                placeholder="Enter your password"
                data-testid="password-input"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-medium rounded-sm h-11 uppercase tracking-wide text-sm active:scale-[0.98] transition-all duration-200"
              data-testid="submit-button"
            >
              {loading ? (
                'Processing...'
              ) : isLogin ? (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Register
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center space-y-2">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:underline block w-full"
              data-testid="toggle-auth-button"
            >
              {isLogin ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
            {isLogin && (
              <button
                onClick={() => navigate('/reset-password')}
                className="text-sm text-zinc-600 hover:underline block w-full"
              >
                Forgot password? (Admin only)
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;