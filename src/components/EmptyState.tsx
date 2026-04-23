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
    <Card className="border-dashed border-2 border-white/5 bg-white/5 backdrop-blur-md rounded-[2.5rem] shadow-2xl">
      <CardContent className="p-16 text-center space-y-8">
        <div className="w-20 h-20 bg-white/10 rounded-3xl border border-white/10 flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(255,255,255,0.03)]">
          <Icon className="w-10 h-10 text-white/20" />
        </div>
        <div className="space-y-3">
          <h3 className="text-3xl font-heading uppercase text-white tracking-tight">{title}</h3>
          <p className="text-white/40 max-w-sm mx-auto font-mono text-[10px] uppercase tracking-widest leading-relaxed">{description}</p>
        </div>
        {(actionLabel && (actionLink || onAction)) && (
          <div className="pt-4">
            {actionLink ? (
              <Link to={actionLink}>
                <Button className="bg-white hover:bg-banana-green text-midnight rounded-xl font-heading text-lg uppercase px-10 h-14 transition-all">
                  {actionLabel}
                </Button>
              </Link>
            ) : (
              <Button onClick={onAction} className="bg-white hover:bg-banana-green text-midnight rounded-xl font-heading text-lg uppercase px-10 h-14 transition-all">
                {actionLabel}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
