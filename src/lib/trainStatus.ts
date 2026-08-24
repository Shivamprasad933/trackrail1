import type { DelayTrend, TrainInstanceStatus } from '@/types';

export type StatusKind = 'on-time' | 'minor-delay' | 'major-delay' | 'recovering' | 'increasing' | 'at-station' | 'completed' | 'scheduled' | 'cancelled';

export interface StatusMeta {
  kind: StatusKind;
  label: string;
  dotClass: string;
  textClass: string;
  bgClass: string;
  icon: 'check' | 'alert' | 'alert-triangle' | 'trending-down' | 'trending-up' | 'circle' | 'flag' | 'minus';
}

export function getDelayStatus(delayMinutes: number, trend?: DelayTrend): StatusMeta {
  if (delayMinutes === 0) return onTime;
  if (trend === 'RECOVERING') return recovering;
  if (trend === 'INCREASING') return increasing;
  if (delayMinutes >= 15) return majorDelay;
  return minorDelay;
}

export function getInstanceStatus(status: TrainInstanceStatus): StatusMeta {
  switch (status) {
    case 'RUNNING': return running;
    case 'AT_STATION': return atStation;
    case 'COMPLETED': return completed;
    case 'SCHEDULED': return scheduled;
    case 'CANCELLED': return cancelled;
    case 'DELAYED': return majorDelay;
    default: return running;
  }
}

export const onTime: StatusMeta = {
  kind: 'on-time', label: 'On Time', dotClass: 'bg-success-500', textClass: 'text-success-700', bgClass: 'bg-success-50', icon: 'check',
};
export const minorDelay: StatusMeta = {
  kind: 'minor-delay', label: 'Minor Delay', dotClass: 'bg-warning-500', textClass: 'text-warning-700', bgClass: 'bg-warning-50', icon: 'alert',
};
export const majorDelay: StatusMeta = {
  kind: 'major-delay', label: 'Major Delay', dotClass: 'bg-error-500', textClass: 'text-error-700', bgClass: 'bg-error-50', icon: 'alert-triangle',
};
export const recovering: StatusMeta = {
  kind: 'recovering', label: 'Recovering', dotClass: 'bg-success-500', textClass: 'text-success-700', bgClass: 'bg-success-50', icon: 'trending-down',
};
export const increasing: StatusMeta = {
  kind: 'increasing', label: 'Delay Increasing', dotClass: 'bg-error-500', textClass: 'text-error-700', bgClass: 'bg-error-50', icon: 'trending-up',
};
export const running: StatusMeta = {
  kind: 'on-time', label: 'Running', dotClass: 'bg-primary-500', textClass: 'text-primary-700', bgClass: 'bg-primary-50', icon: 'circle',
};
export const atStation: StatusMeta = {
  kind: 'at-station', label: 'At Station', dotClass: 'bg-accent-500', textClass: 'text-accent-700', bgClass: 'bg-accent-50', icon: 'circle',
};
export const completed: StatusMeta = {
  kind: 'completed', label: 'Completed', dotClass: 'bg-neutral-400', textClass: 'text-neutral-600', bgClass: 'bg-neutral-100', icon: 'flag',
};
export const scheduled: StatusMeta = {
  kind: 'scheduled', label: 'Scheduled', dotClass: 'bg-neutral-400', textClass: 'text-neutral-600', bgClass: 'bg-neutral-100', icon: 'minus',
};
export const cancelled: StatusMeta = {
  kind: 'cancelled', label: 'Cancelled', dotClass: 'bg-error-500', textClass: 'text-error-700', bgClass: 'bg-error-50', icon: 'alert-triangle',
};

export const trendLabel: Record<DelayTrend, string> = {
  RECOVERING: 'Recovering',
  MAINTAINING: 'Maintaining delay',
  INCREASING: 'Getting more delayed',
  STABLE: 'Stable',
};
