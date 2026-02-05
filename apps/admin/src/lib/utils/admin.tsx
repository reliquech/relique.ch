import React from 'react';
import { CheckCircle2, FileEdit, Archive, Clock, ShieldCheck } from 'lucide-react';

/**
 * Get status pill component for displaying status badges
 */
export function getStatusPill(status: string) {
  const s = status.toLowerCase();
  
  if (s === 'published') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-success/30 bg-success/10 text-success shadow-[0_0_12px_rgba(16,185,129,0.15)]">
        <CheckCircle2 className="w-3 h-3" />
        {status}
      </div>
    );
  }
  
  if (s === 'draft') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-white/5 text-gray-400">
        <FileEdit className="w-3 h-3" />
        {status}
      </div>
    );
  }

  if (s === 'archived' || s === 'disqualified' || s === 'closed') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-destructive/30 bg-destructive/10 text-destructive">
        <Archive className="w-3 h-3" />
        {status}
      </div>
    );
  }
  
  if (s === 'in_review' || s === 'inconclusive') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-warning/30 bg-warning/10 text-warning">
        <Clock className="w-3 h-3" />
        {status}
      </div>
    );
  }

  if (s === 'qualified') {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-accent/30 bg-accent/10 text-accent">
        <ShieldCheck className="w-3 h-3" />
        {status}
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/10 bg-gray-500/10 text-gray-400">
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {status.replace('_', ' ')}
    </div>
  );
}

/**
 * Map route pathname to tab id
 */
export const routeToTabMap: Record<string, string> = {
  '/admin': 'dashboard',
  '/admin/items': 'items',
  '/admin/featured': 'featured',
  '/admin/verify': 'verify',
  '/admin/logs': 'logs',
  '/admin/settings': 'settings',
  '/admin/profile': 'settings',
  '/admin/customers': 'customers',
  '/admin/leads': 'leads',
  '/admin/deals': 'deals',
  '/admin/messages': 'messages',
  '/admin/tasks': 'tasks',
  '/admin/automations': 'automations',
  '/admin/pipeline-stages': 'pipeline-stages',
  '/admin/custom-fields': 'custom-fields',
  '/admin/users': 'users',
  '/admin/submissions': 'subs-auth',
};

/**
 * Map tab id to route path
 */
export const tabToRouteMap: Record<string, string> = {
  'dashboard': '/admin',
  'items': '/admin/items',
  'featured': '/admin/featured',
  'verify': '/admin/verify',
  'logs': '/admin/logs',
  'settings': '/admin/settings',
  'customers': '/admin/customers',
  'leads': '/admin/leads',
  'deals': '/admin/deals',
  'messages': '/admin/messages',
  'tasks': '/admin/tasks',
  'automations': '/admin/automations',
  'pipeline-stages': '/admin/pipeline-stages',
  'custom-fields': '/admin/custom-fields',
  'users': '/admin/users',
  'subs-auth': '/admin/submissions?tab=verifications',
  'subs-consign': '/admin/submissions?tab=consignments',
};

/**
 * Map route/tab to display name
 */
export const tabNames: Record<string, string> = {
  'dashboard': 'Global Overview',
  'items': 'Marketplace Management',
  'featured': 'Featured Carousel Manager',
  'verify': 'Verification Records',
  'subs-auth': 'Authenticate Submissions',
  'subs-consign': 'Consign Submissions',
  'messages': 'Contact Inquiries',
  'customers': 'Customers',
  'leads': 'Leads',
  'deals': 'Deals',
  'tasks': 'Tasks',
  'automations': 'Automations',
  'pipeline-stages': 'Pipeline Stages',
  'custom-fields': 'Custom Fields',
  'users': 'User Management',
  'logs': 'Security Audit Trail',
  'settings': 'System Configurations'
};
