import { it, expect } from 'vitest';
import {
  OPERATOR_NAME,
  aboutPageJsonLd,
  siteIdentity,
} from '../config/site.mjs';
it('運営者名を共通化し、aboutはPersonを作らずOrganizationをpublisherにする', () => {
  expect(OPERATOR_NAME).toBe('億率 運営者');
  const data = aboutPageJsonLd('https://okuritsu-soroban.com/');
  expect(data['@type']).toBe('AboutPage');
  expect(data.publisher.name).toBe('億率');
  expect(data.publisher['@id']).toBe(
    siteIdentity('https://okuritsu-soroban.com/')[1]['@id'],
  );
  expect(JSON.stringify(data)).not.toContain('Person');
});
