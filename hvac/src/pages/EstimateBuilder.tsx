import { useEstimate } from '../context/EstimateContext'
import StepTracker from '../components/builder/StepTracker'
import EstimateSummary, { MobileTotalBar } from '../components/builder/EstimateSummary'
import StepCustomer from '../components/builder/StepCustomer'
import StepWork from '../components/builder/StepWork'
import StepDiscount from '../components/builder/StepDiscount'
import StepReview from '../components/builder/StepReview'
import CustomerEstimateView from '../components/builder/CustomerEstimateView'

const STEP_TITLES: Record<string, { eyebrow: string; title: string }> = {
  customer: { eyebrow: 'Step 1 of 4', title: 'Find the Customer' },
  work: { eyebrow: 'Step 2 of 4', title: 'Work' },
  discount: { eyebrow: 'Step 3 of 4', title: 'Discount' },
  review: { eyebrow: 'Step 4 of 4', title: 'Review Estimate' },
}

export default function EstimateBuilder() {
  const { step } = useEstimate()

  if (step === 'customer-view') {
    return <CustomerEstimateView />
  }

  const meta = STEP_TITLES[step]

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-24 lg:pb-8">
      <div className="mb-6">
        <StepTracker />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
        <div>
          <div className="mb-5">
            <div className="text-xs font-bold uppercase tracking-widest text-[var(--color-accent)] mb-1">
              {meta.eyebrow}
            </div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold leading-none">{meta.title}</h1>
          </div>

          {step === 'customer' && <StepCustomer />}
          {step === 'work' && <StepWork />}
          {step === 'discount' && <StepDiscount />}
          {step === 'review' && <StepReview />}
        </div>

        <div className="hidden lg:block">
          <EstimateSummary />
        </div>
      </div>

      <MobileTotalBar />
    </div>
  )
}
