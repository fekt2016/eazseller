import { describe, expect, test } from 'vitest';
import {
  buyerContactVisibility,
  firstNameOnly,
  isPreShipment,
} from '../../shared/utils/orderPrivacy';

const POST_SHIPMENT_LIST = [
  'international_shipped',
  'customs_clearance',
  'arrived_destination',
  'local_dispatch',
  'out_for_delivery',
  'delivery_attempted',
  'delivered',
  'shipped',
  'delievered',
  'partially_shipped',
  'completed',
];

describe('orderPrivacy', () => {
  test.each(POST_SHIPMENT_LIST)(
    'isPreShipment is false when currentStatus is %s',
    (status) => {
      expect(isPreShipment({ currentStatus: status })).toBe(false);
    },
  );

  test('order with status=confirmed AND currentStatus=preparing → pre-shipment', () => {
    expect(
      isPreShipment({
        status: 'confirmed',
        currentStatus: 'preparing',
      }),
    ).toBe(true);
  });

  test('order with status=confirmed AND currentStatus=out_for_delivery → post-shipment', () => {
    expect(
      isPreShipment({
        status: 'confirmed',
        currentStatus: 'out_for_delivery',
      }),
    ).toBe(false);
  });

  test('order={} → pre-shipment (fail safe)', () => {
    expect(isPreShipment({})).toBe(true);
  });

  test('order=null → pre-shipment (fail safe)', () => {
    expect(isPreShipment(null)).toBe(true);
  });

  test('gates buyer contact data before shipment handoff', () => {
    const visibility = buyerContactVisibility({ currentStatus: 'processing' });

    expect(visibility.showFullName).toBe(false);
    expect(visibility.showEmail).toBe(false);
    expect(visibility.showPhone).toBe(false);
    expect(visibility.showExactAddress).toBe(false);
    expect(visibility.showFirstName).toBe(true);
    expect(visibility.showAreaAndRegion).toBe(true);
  });

  test('shows full contact details after shipment handoff', () => {
    const visibility = buyerContactVisibility({ currentStatus: 'shipped' });

    expect(visibility.showFullName).toBe(true);
    expect(visibility.showEmail).toBe(true);
    expect(visibility.showPhone).toBe(true);
    expect(visibility.showExactAddress).toBe(true);
    expect(visibility.showFirstName).toBe(true);
    expect(visibility.showAreaAndRegion).toBe(true);
  });

  test('extracts first name safely', () => {
    expect(firstNameOnly('Jane Doe')).toBe('Jane');
    expect(firstNameOnly('  Kojo   Mensah  ')).toBe('Kojo');
    expect(firstNameOnly('')).toBe('');
    expect(firstNameOnly(null)).toBe('');
  });
});
