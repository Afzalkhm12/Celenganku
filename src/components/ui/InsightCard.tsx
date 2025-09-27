import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';
import { Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';

const insightCardVariants = cva(
  'rounded-lg border p-4 flex items-start space-x-4',
  {
    variants: {
      variant: {
        info: 'bg-blue-50 border-blue-200 text-blue-800',
        warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
        positive: 'bg-green-50 border-green-200 text-green-800',
      },
    },
    defaultVariants: {
      variant: 'info',
    },
  }
);

const iconMap = {
  info: <Lightbulb className="h-5 w-5 text-blue-500" />,
  warning: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
  positive: <CheckCircle className="h-5 w-5 text-green-500" />,
};

export interface InsightCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof insightCardVariants> {}

const InsightCard: React.FC<InsightCardProps> = ({ className, variant, children, ...props }) => {
  const icon = variant ? iconMap[variant] : iconMap.info;
  
  return (
    <div className={clsx(insightCardVariants({ variant }), className)} {...props}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 text-sm">{children}</div>
    </div>
  );
};

export { InsightCard };
