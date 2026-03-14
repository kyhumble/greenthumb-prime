import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  const getEmail = (obj) =>
    obj?.metadata?.user_email || obj?.customer_email || null;

  const updateUser = async (email, data) => {
    if (!email) return;
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length > 0) {
      await base44.asServiceRole.entities.User.update(users[0].id, data);
      console.log(`Updated user ${email}:`, data);
    }
  };

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const email = getEmail(session);
      if (session.mode === 'subscription') {
        await updateUser(email, {
          subscription_status: session.status === 'complete' ? 'trialing' : 'active',
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
        });
      }
      break;
    }
    case 'customer.subscription.trial_will_end': {
      // Could send a reminder email here
      break;
    }
    case 'customer.subscription.updated': {
      const sub = event.data.object;
      const email = getEmail(sub);
      await updateUser(email, { subscription_status: sub.status });
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const email = getEmail(sub);
      await updateUser(email, {
        subscription_status: 'canceled',
        stripe_subscription_id: null,
      });
      break;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const email = invoice.customer_email;
      await updateUser(email, { subscription_status: 'past_due' });
      break;
    }
    case 'invoice.paid': {
      const invoice = event.data.object;
      const email = invoice.customer_email;
      await updateUser(email, { subscription_status: 'active' });
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return Response.json({ received: true });
});