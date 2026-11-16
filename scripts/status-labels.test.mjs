import assert from 'node:assert/strict';
import test from 'node:test';
import { loadModule } from './test-module.mjs';

const labels = loadModule('lib/status-labels.ts');
test('session, payment and subscription statuses retain domain meaning in FR/EN', () => {
  assert.equal(labels.getSessionStatusLabel('PENDING'), 'En attente de confirmation');
  assert.equal(labels.getSessionStatusLabel('CANCELLED'), 'Annulée');
  assert.equal(labels.getPaymentStatusLabel('CANCELED'), 'Annulé');
  assert.equal(labels.getSubscriptionStatusLabel('canceled'), 'Résilié');
  assert.equal(labels.getSubscriptionStatusLabel('past_due'), 'Paiement en retard');
  assert.equal(labels.getSessionStatusLabel('PENDING', 'en'), 'Awaiting confirmation');
  assert.equal(labels.getPaymentStatusLabel('PAID', 'en'), 'Paid');
});
test('unknown, empty and inherited property names never expose raw enum values', () => {
  for (const mapper of Object.values(labels)) {
    for (const value of [null, undefined, '', 'UNRECOGNIZED', '__proto__', 'constructor']) {
      assert.equal(mapper(value), 'Statut indisponible');
      assert.equal(mapper(value, 'en'), 'Status unavailable');
    }
  }
});
