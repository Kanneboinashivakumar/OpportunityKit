import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, daysUntil, urgencyLabel, truncate } from '@/lib/utils';
import { Search, Clock, CheckCircle, AlertCircle, Plus } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Fetch real data
  const [{ data: profile }, { data: opportunities }] = await Promise.all([
    supabase.from('profiles').select('full_name, skills, cgpa, academic_year').eq('user_id', user!.id).single(),
    supabase.from('opportunities').select('id, title, type, status, deadline, created_at').eq('owner_id', user!.id).order('created_at', { ascending: false }).limit(5),
  ]);

  const profileComplete = profile && profile.full_name && profile.cgpa !== null;
  const upcomingDeadlines = (opportunities ?? []).filter(o => {
    const days = daysUntil(o.deadline);
    return days !== null && days >= 0 && days <= 30;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-navy)]">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}
        </h1>
        <p className="text-sm text-[var(--color-text-muted)] mt-1">
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Profile incomplete banner */}
      {!profileComplete && (
        <div className="flex items-start gap-3 p-4 rounded-lg bg-[var(--color-missing-bg)] border border-[var(--color-missing-border)]">
          <AlertCircle className="w-5 h-5 text-[var(--color-missing)] shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-[var(--color-missing)]">Complete your profile</p>
            <p className="text-sm text-[var(--color-text-muted)] mt-0.5">
              Add your CGPA, skills, and degree to get accurate eligibility checks.
            </p>
          </div>
          <Link href="/app/profile">
            <Button size="sm" variant="outline">Update profile</Button>
          </Link>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/app/analyze" className="block">
          <Card className="hover:border-[var(--color-navy)] transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-navy-50)] flex items-center justify-center shrink-0">
                <Search className="w-5 h-5 text-[var(--color-navy)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-navy)] text-sm">Analyze Opportunity</h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Paste an announcement and get a deterministic eligibility audit.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/profile" className="block">
          <Card className="hover:border-[var(--color-sage)] transition-colors cursor-pointer h-full">
            <CardContent className="pt-6 flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-sage-light)] flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-[var(--color-sage)]" />
              </div>
              <div>
                <h3 className="font-semibold text-[var(--color-navy)] text-sm">
                  {profileComplete ? 'Profile ready' : 'Set up profile'}
                </h3>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Your reusable profile is compared across every analysis.
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming deadlines */}
      {upcomingDeadlines.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" /> Upcoming deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {upcomingDeadlines.map((opp) => {
                const days = daysUntil(opp.deadline);
                return (
                  <Link key={opp.id} href={`/app/opportunities/${opp.id}`} className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--color-surface)] transition-colors">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-text)]">{truncate(opp.title, 60)}</p>
                      <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">{formatDate(opp.deadline)}</p>
                    </div>
                    <Badge variant={days !== null && days <= 7 ? 'mismatch' : days !== null && days <= 14 ? 'missing' : 'secondary'}>
                      {urgencyLabel(days)}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent analyses */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Recent analyses</CardTitle>
            <Link href="/app/opportunities">
              <Button variant="ghost" size="sm">View all</Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!opportunities || opportunities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-[var(--color-text-muted)]">No analyses yet.</p>
              <Link href="/app/analyze">
                <Button size="sm" className="mt-3">
                  <Plus className="w-4 h-4" /> Analyze your first opportunity
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-1">
              {opportunities.map((opp) => (
                <Link key={opp.id} href={`/app/opportunities/${opp.id}`} className="flex items-center justify-between p-3 rounded-md hover:bg-[var(--color-surface)] transition-colors">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--color-text)] truncate">{opp.title}</p>
                    <p className="text-xs text-[var(--color-text-subtle)] mt-0.5">{formatDate(opp.created_at)}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 ml-2 capitalize">{opp.status}</Badge>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
