import { AppShell } from '@/components/layout'
import { Button } from '@/components/ui'
import { FadeInOnScroll, StaggerList, StaggerItem } from '@/components/motion'
import { useProfile } from '@/hooks/useProfile'
import { useAuthStore } from '@/stores/authStore'
import {
  ProfileHero,
  WorkoutSplitSection,
  ProfileSettings,
  SecuritySection,
  FeedbackSection,
  ExerciseDataSection,
} from '@/components/profile'
import { SignOut } from '@phosphor-icons/react'

function GradientDivider() {
  return (
    <div className="px-[var(--space-8)] py-[var(--space-2)]">
      <div className="h-px" style={{ background: 'linear-gradient(to right, transparent, var(--color-border-strong), transparent)' }} />
    </div>
  )
}

export function ProfilePage() {
  const signOut = useAuthStore((s) => s.signOut)
  const { isLoading } = useProfile()

  if (isLoading) {
    return (
      <AppShell title="Profile" showBack hideNav>
        <div className="p-[var(--space-4)] space-y-[var(--space-4)]">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--color-surface-hover)] animate-pulse rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Profile" showBack hideNav>
      <StaggerList className="pb-[var(--space-8)]">
        <StaggerItem>
          <ProfileHero />
        </StaggerItem>

        <StaggerItem>
          <WorkoutSplitSection />
        </StaggerItem>

        <StaggerItem>
          <ProfileSettings />
        </StaggerItem>

        <StaggerItem>
          <FadeInOnScroll direction="up" delay={0.1}>
            <GradientDivider />
          </FadeInOnScroll>
        </StaggerItem>

        <StaggerItem>
          <FadeInOnScroll direction="up">
            <SecuritySection />
          </FadeInOnScroll>
        </StaggerItem>

        <StaggerItem>
          <FadeInOnScroll direction="up" delay={0.1}>
            <FeedbackSection />
          </FadeInOnScroll>
        </StaggerItem>

        <StaggerItem>
          <FadeInOnScroll direction="up">
            <GradientDivider />
          </FadeInOnScroll>
        </StaggerItem>

        <StaggerItem>
          <FadeInOnScroll direction="up">
            <ExerciseDataSection />
          </FadeInOnScroll>
        </StaggerItem>

        <StaggerItem>
          <FadeInOnScroll direction="up" delay={0.05}>
            <div className="px-[var(--space-4)] pt-[var(--space-2)]">
              <Button
                variant="secondary"
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-[var(--space-2)]"
              >
                <SignOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>
          </FadeInOnScroll>
        </StaggerItem>
      </StaggerList>
    </AppShell>
  )
}
