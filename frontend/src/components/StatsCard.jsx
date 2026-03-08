import { Card, CardContent } from '@/components/ui/card';

const StatsCard = ({ title, value, icon }) => {
  return (
    <Card className="bg-white border border-zinc-200 shadow-sm rounded-md hover:shadow-md hover:border-zinc-300 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-zinc-600 mb-2">
              {title}
            </p>
            <p className="text-3xl font-bold text-slate-900">
              {value}
            </p>
          </div>
          <div className="w-12 h-12 bg-zinc-100 rounded-md flex items-center justify-center text-slate-900">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;