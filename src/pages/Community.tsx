import { useState } from 'react'
import { Users, MessageCircle, Trophy, Heart, Cpu, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { AppShell } from '@/components/layout/AppShell'

export function CommunityPage() {
  const [showOpenClaw, setShowOpenClaw] = useState(false)

  return (
    <AppShell title="Community">
      <div className="px-4 py-8 flex flex-col items-center text-center">
        {/* Coming Soon Badge */}
        <div className="w-20 h-20 rounded-full bg-[var(--color-primary)]/15 flex items-center justify-center mb-6">
          <Users className="w-10 h-10 text-[var(--color-primary)]" />
        </div>

        <h2 className="text-2xl font-bold text-[var(--color-text)] mb-2">
          Coming Soon
        </h2>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-sm font-medium mb-8">
          <Heart className="w-3.5 h-3.5" />
          Under Construction
        </div>

        {/* Message */}
        <div className="max-w-sm space-y-4 text-[var(--color-text-secondary)] text-[15px] leading-relaxed text-left">
          <p>
            Hey friends! We're still getting the app up and running and locking in the basics — schedules, workout tracking, history, and all that good stuff. I hope you've been enjoying it so far!
          </p>

          <p>
            If you spot any bugs, just text me. Everyone on the app right now is a close friend of mine, so don't be shy.
          </p>

          {/* What's Coming */}
          <div className="rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] p-4 my-6">
            <p className="text-sm font-semibold text-[var(--color-text)] mb-3">What's coming to Community:</p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-[var(--color-primary)] mt-0.5 shrink-0" />
                <span className="text-sm">See your friends' workouts and cheer them on</span>
              </div>
              <div className="flex items-start gap-3">
                <Trophy className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
                <span className="text-sm">Fun competitions and a leaderboard</span>
              </div>
              <div className="flex items-start gap-3">
                <MessageCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                <span className="text-sm">Share tips, motivation, and progress</span>
              </div>

              {/* OpenClaw expandable item */}
              <div>
                <button
                  onClick={() => setShowOpenClaw(!showOpenClaw)}
                  className="flex items-start gap-3 w-full text-left group"
                >
                  <Cpu className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                  <span className="text-sm flex-1">See what we're building with OpenClaw</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[var(--color-text-muted)] mt-0.5 shrink-0 transition-transform duration-200 ${showOpenClaw ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {showOpenClaw && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-3 ml-7 p-3 rounded-lg bg-[var(--color-background)] border border-[var(--color-border)] text-[13px] text-[var(--color-text-secondary)] leading-relaxed space-y-2">
                        <p>
                          We've set up a dedicated Mac Mini running as an always-on development server powered by <span className="text-orange-500 font-medium">OpenClaw</span> — an open-source autonomous AI agent that connects to large language models like Claude to execute real coding tasks.
                        </p>
                        <p>
                          Here's the plan: soon you'll be able to submit feature requests and bug reports directly through the app. Each submission gets picked up by our OpenClaw instance, which autonomously generates a pull request with the proposed changes using Claude Code.
                        </p>
                        <p>
                          Every few days, I review these PRs, verify the quality, and merge them into the live app. Your ideas go from request to reality — with AI doing the heavy lifting.
                        </p>
                        <p>
                          This isn't just my app. It's <span className="text-[var(--color-text)] font-medium">our app, built together as a community</span>.
                        </p>
                        <p className="text-orange-500 font-medium">
                          Welcome to the future, my friends.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <p>
            But for right now, let's focus on getting the base functionality dialed in. I hope you all have a great time working out, avoiding injuries, and staying fit.
          </p>

          <p className="text-[var(--color-text)] font-medium">
            Age well, my friends.
          </p>
        </div>
      </div>
    </AppShell>
  )
}
