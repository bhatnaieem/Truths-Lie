import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import type { Activity as ActivityType, User } from "@shared/schema";

export default function ActivityFeed() {
  const { data: activitiesData, isLoading } = useQuery({
    queryKey: ['/api/activities', { limit: 5 }],
    queryFn: async () => {
      const response = await fetch('/api/activities?limit=5');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  const activities: (ActivityType & { user: User })[] = activitiesData?.activities || [];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'game_created': return 'bg-blue-500';
      case 'stumped_players': return 'bg-green-500';
      case 'earned_badge': return 'bg-purple-500';
      case 'milestone': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - new Date(date).getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Activity className="h-5 w-5" />
          <span>Recent Activity</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-start space-x-3">
                <div className="w-2 h-2 bg-gray-200 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-full mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${getActivityColor(activity.type)}`}></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-semibold">@{activity.user.farcasterUsername}</span>{' '}
                    {activity.description}
                  </p>
                  <p className="text-xs text-gray-500">{formatTimeAgo(activity.createdAt)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500 text-sm">No recent activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
