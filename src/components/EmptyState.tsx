import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-neutral-200 bg-neutral-50/50 rounded-2xl">
      <CardContent className="p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center mx-auto">
          <Icon className="w-8 h-8 text-neutral-400" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-neutral-900">{title}</h3>
          <p className="text-neutral-500 max-w-xs mx-auto">{description}</p>
        </div>
        {(actionLabel && (actionLink || onAction)) && (
          <div className="pt-2">
            {actionLink ? (
              <Link to={actionLink}>
                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                  {actionLabel}
                </Button>
              </Link>
            ) : (
              <Button onClick={onAction} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
