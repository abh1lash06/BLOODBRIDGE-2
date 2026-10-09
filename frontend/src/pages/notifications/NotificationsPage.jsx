import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  CheckCircle,
  Clock,
  CheckCheck,
  AlertCircle,
  Inbox,
} from 'lucide-react';
import { notificationApi } from '@/api/notification.api';
import { formatDateTime, extractErrorMessage } from '@/lib/formatters';
import { useToast } from '@/context/ToastContext';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import Pagination from '@/components/common/Pagination';
import EmptyState from '@/components/common/EmptyState';
import { TableSkeleton } from '@/components/feedback/Skeleton';

export const NotificationsPage = () => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  // Fetch notifications list
  const { data, isLoading, error } = useQuery({
    queryKey: ['notifications', 'list', page],
    queryFn: () => notificationApi.getNotifications({ page, size: 10 }),
  });

  // Mark single as read
  const markReadMutation = useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    },
  });

  // Mark all as read
  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read.');
    },
    onError: (err) => {
      const msg = extractErrorMessage(err, 'Failed to update notifications.');
      toast.error(msg);
    },
  });

  const notifications = data?.content || [];
  const totalPages = data?.totalPages || 0;
  const totalElements = data?.totalElements || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-charcoal-900">
            Notifications
          </h1>
          <p className="text-sm text-charcoal-500 mt-1">
            System notices, verification updates, and blood request alerts.
          </p>
        </div>

        {notifications.some((n) => !n.readStatus) && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllReadMutation.mutate()}
            isLoading={markAllReadMutation.isPending}
          >
            <CheckCheck className="w-4 h-4 mr-1.5" />
            Mark All as Read
          </Button>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-6">
            <TableSkeleton rows={4} cols={3} />
          </div>
        ) : error ? (
          <div className="p-6 text-sm text-red-600">
            Failed to load notifications.
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8">
            <EmptyState
              icon={Bell}
              title="No notifications"
              description="You have no notifications in your inbox at this time."
            />
          </div>
        ) : (
          <div className="divide-y divide-charcoal-100">
            {notifications.map((item) => (
              <div
                key={item.id}
                className={`p-4 sm:p-5 flex items-start gap-4 transition-colors ${
                  item.readStatus ? 'bg-white' : 'bg-crimson-50/40'
                }`}
              >
                <div
                  className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                    item.readStatus
                      ? 'bg-charcoal-100 text-charcoal-500'
                      : 'bg-crimson-100 text-crimson-600'
                  }`}
                >
                  <Bell className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-bold text-charcoal-900 truncate">
                      {item.title}
                    </h4>
                    {!item.readStatus && (
                      <span className="w-2 h-2 rounded-full bg-crimson-600 shrink-0"></span>
                    )}
                  </div>
                  <p className="text-sm text-charcoal-600 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-charcoal-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDateTime(item.createdAt)}
                    </span>
                    <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 bg-charcoal-100 text-charcoal-600 rounded">
                      {item.notificationType}
                    </span>
                  </div>
                </div>

                {!item.readStatus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-charcoal-500 hover:text-charcoal-800 shrink-0"
                    onClick={() => markReadMutation.mutate(item.id)}
                  >
                    Mark as Read
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onPageChange={(newPage) => setPage(newPage)}
        />
      </Card>
    </div>
  );
};

export default NotificationsPage;
