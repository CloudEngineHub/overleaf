import { Trans, useTranslation } from 'react-i18next'
import { RecurlySubscription } from '../../../../../../types/subscription/dashboard/subscription'
import { PausedSubscription } from './states/active/paused'
import { ActiveSubscriptionNew } from '@/features/subscription/components/dashboard/states/active/active-new'
import { CanceledSubscription } from './states/canceled'
import { ExpiredSubscription } from './states/expired'
import { useSubscriptionDashboardContext } from '../../context/subscription-dashboard-context'
import PersonalSubscriptionRecurlySyncEmail from './personal-subscription-recurly-sync-email'
import OLNotification from '@/features/ui/components/ol/ol-notification'

function PastDueSubscriptionAlert({
  subscription,
}: {
  subscription: RecurlySubscription
}) {
  const { t } = useTranslation()
  return (
    <OLNotification
      type="error"
      content={
        <>
          {t('account_has_past_due_invoice_change_plan_warning')}{' '}
          <a
            href={subscription.recurly.accountManagementLink}
            target="_blank"
            rel="noreferrer noopener"
          >
            {t('view_your_invoices')}
          </a>
        </>
      }
    />
  )
}

function PersonalSubscriptionStates({
  subscription,
}: {
  subscription: RecurlySubscription
}) {
  const { t } = useTranslation()
  const state = subscription?.recurly.state

  if (state === 'active') {
    // This version handles subscriptions with and without addons
    return <ActiveSubscriptionNew subscription={subscription} />
  } else if (state === 'canceled') {
    return <CanceledSubscription subscription={subscription} />
  } else if (state === 'expired') {
    return <ExpiredSubscription subscription={subscription} />
  } else if (state === 'paused') {
    return <PausedSubscription subscription={subscription} />
  } else {
    return <>{t('problem_with_subscription_contact_us')}</>
  }
}

function PersonalSubscription() {
  const { t } = useTranslation()
  const { personalSubscription, recurlyLoadError } =
    useSubscriptionDashboardContext()

  if (!personalSubscription) return null

  if (!('recurly' in personalSubscription)) {
    return (
      <p>
        <Trans
          i18nKey="please_contact_support_to_makes_change_to_your_plan"
          components={[<a href="/contact" />]} // eslint-disable-line react/jsx-key, jsx-a11y/anchor-has-content
        />
      </p>
    )
  }

  return (
    <>
      {personalSubscription.recurly.account.has_past_due_invoice._ ===
        'true' && (
        <PastDueSubscriptionAlert subscription={personalSubscription} />
      )}
      <PersonalSubscriptionStates
        subscription={personalSubscription as RecurlySubscription}
      />
      {recurlyLoadError && (
        <OLNotification
          type="warning"
          content={<strong>{t('payment_provider_unreachable_error')}</strong>}
        />
      )}
      <hr />
      <PersonalSubscriptionRecurlySyncEmail />
    </>
  )
}

export default PersonalSubscription
