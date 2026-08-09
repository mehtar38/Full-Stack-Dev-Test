import { Link } from 'react-router-dom'
import { Zap, Search, Wrench, FileCheck, Clock, ArrowRight, Flame } from 'lucide-react'
import Button from '../components/ui/Button'
import { Card } from '../components/ui/Primitives'

export default function Home() {
  return (
    <div>
      {/* Hero */}
      <section className="grid-texture border-b-2 border-[var(--color-ink)]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-4">
              <Flame size={14} /> Internal Field Tool
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[0.95] mb-5">
              Estimates built on-site, not back at the office.
            </h1>
            <p className="text-lg text-[var(--color-ink)]/70 leading-relaxed mb-8">
              Summit Air's estimate builder pulls customer, equipment, and labor data the moment
              you need it — so you can quote a job accurately while you're still standing in
              front of the customer, not typing it up later.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/estimate">
                <Button size="lg" icon={<ArrowRight size={18} />}>
                  Open Estimate Builder
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Problem framing */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-2">
              The Problem
            </div>
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
              Every extra minute is a minute the customer is waiting.
            </h2>
            <p className="text-[var(--color-ink)]/70 leading-relaxed">
              Looking up a customer's system, digging up equipment pricing, checking labor rates,
              doing the math by hand, then writing it all up — it adds up fast, and it all happens
              with the customer standing right there.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-2">
              The Approach
            </div>
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
              If we already know it, you shouldn't have to type it.
            </h2>
            <p className="text-[var(--color-ink)]/70 leading-relaxed">
              Pick a customer and their property details, system type, and history fill in
              automatically. Pick equipment and pricing populates from the catalog. You only enter
              what genuinely requires a judgment call — job type, hours, discount.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--color-ink)] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold mb-8">How an estimate comes together</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Step
              icon={<Search size={22} />}
              step="01"
              title="Find the customer"
              body="Search by name or address — property details and system type populate automatically."
            />
            <Step
              icon={<Wrench size={22} />}
              step="02"
              title="Confirm equipment"
              body="Relevant equipment is inferred from the system on file. Adjust brand, model, or pricing as needed."
            />
            <Step
              icon={<Clock size={22} />}
              step="03"
              title="Set labor & discount"
              body="Choose the job type and hours within the allowed range, then apply any discount."
            />
            <Step
              icon={<FileCheck size={22} />}
              step="04"
              title="Review & send"
              body="Review the numbers, then hand the customer a clean, professional PDF estimate."
            />
          </div>
        </div>
      </section>

      {/* Footer strip */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <Card className="flex flex-col sm:flex-row items-center justify-between gap-6 !p-8">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-2">
              <Zap size={13} /> For Technicians
            </div>
            <div className="font-display text-2xl font-bold">
              Log in with your shop passcode to start an estimate.
            </div>
          </div>
          <Link to="/estimate">
            <Button size="lg" icon={<ArrowRight size={18} />}>
              Get Started
            </Button>
          </Link>
        </Card>
      </section>
    </div>
  )
}

function Step({
  icon,
  step,
  title,
  body,
}: {
  icon: React.ReactNode
  step: string
  title: string
  body: string
}) {
  return (
    <div className="border-2 border-white/15 rounded-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[var(--color-accent)]">{icon}</span>
        <span className="font-mono text-xs text-white/30">{step}</span>
      </div>
      <div className="font-display text-lg font-bold mb-1.5">{title}</div>
      <p className="text-sm text-white/60 leading-relaxed">{body}</p>
    </div>
  )
}
