import { Link } from 'react-router-dom'
import { Zap, Search, Wrench, FileCheck, Clock, ArrowRight } from 'lucide-react'
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
              {/* <Flame size={14} /> Internal Field Tool */}
            </div>
            <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[0.95] mb-5">
              Best in business because we make YOU wait LESS!
            </h1>
            <p className="text-lg text-[var(--color-ink)]/70 leading-relaxed mb-8">
              We are a full-service heating and cooling contractor, specializing in installation, maintenance, and repair for all HVAC systems.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/estimate">
                <Button size="lg">
                  Contact to get an Estimate
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
              Our Team
            </div>
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
             Experienced people, supported by better tools.
            </h2>
            <p className="text-[var(--color-ink)]/70 leading-relaxed">
             Our technicians bring the expertise. We give them the information they need to put it to work.
            </p>
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-2">
              Our Standards
            </div>
            <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
              Straightforward work. Transparent pricing.
            </h2>
            <p className="text-[var(--color-ink)]/70 leading-relaxed">
              We keep estimates clear and detailed, so customers understand the work before making a decision.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="bg-[var(--color-ink)] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="font-display text-3xl font-bold mb-8">Our Services</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Step
              icon={<FileCheck size={22} />}
              step="01"
              title="Installation"
              body="We have a wide catalog of brands and models"
            />
            <Step
              icon={<Wrench size={22} />}
              step="02"
              title="Repair"
              body="Old is gold, and so we make sure your old turns to gold again!"
            />
            <Step
              icon={<Search size={22} />}
              step="03"
              title="Diagnostic and Tune Ups"
              body="Our experienced technicians at the rescue!"
            />
            <Step
              icon={<Clock size={22} />}
              step="04"
              title="Instant Estimates"
              body="Imagine less waiting and more work... well you don't have to imagine anymore"
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
