import assert from "node:assert/strict";
import test from "node:test";
import { appointmentMailto, calendarUrl, contactEmail, contactPhone, localDate, optionalCalendarUrl, requestedAppointmentDate } from "../src/lib/profile-appointment.ts";

test("calendar links require HTTPS and do not accept credentials or executable schemes", () => {
  assert.equal(calendarUrl(" https://calendly.com/example?month=2026-10 "), "https://calendly.com/example?month=2026-10");
  for (const value of [undefined, "", "calendar", "/calendar", "//example.com", "http://example.com", "javascript:alert(1)", "data:text/html,hello", "https://user:password@example.com/"]) {
    assert.equal(calendarUrl(value), undefined, String(value));
  }
});

test("optional admin calendar links are accepted only when usable by the public profile", () => {
  for (const value of [undefined, "", "   "]) assert.equal(optionalCalendarUrl(value), undefined);
  const valid = " https://calendly.com/example?month=2026-10 ";
  assert.equal(optionalCalendarUrl(valid), calendarUrl(valid));
  for (const value of ["http://example.com/agenda", "/calendar", "javascript:alert(1)", "https://user:password@example.com/"]) {
    assert.throws(() => optionalCalendarUrl(value), /lien de rendez-vous HTTPS valide/, value);
  }
});

test("email contacts support common valid addresses and reject injected headers", () => {
  for (const address of ["hello@example.com", "first.last+meeting@company.sn", "o'connor@example.com"]) assert.equal(contactEmail(address), address);
  for (const address of ["", "a@", ".a@example.com", "a..b@example.com", "a@-example.com", "a@example.com?bcc=other@example.com", "a@example.com\r\nBcc: other@example.com", "a%0d%0abcc@example.com", "a@example.com,other@example.com"]) assert.equal(contactEmail(address), undefined, address);
});

test("mailto links encode each field so message content cannot create recipient headers", () => {
  const message = "Projet A & B ?\nMerci.\nbcc=unintended@example.com";
  const href = appointmentMailto("hello+meeting@example.com", "Awa\r\nBcc: test", message);
  const url = new URL(href);
  assert.equal(decodeURIComponent(url.pathname), "hello+meeting@example.com");
  assert.deepEqual([...url.searchParams.keys()], ["subject", "body"]);
  assert.equal(url.searchParams.get("body"), message);
  assert.doesNotMatch(url.searchParams.get("subject"), /[\r\n]/);
  assert.equal(appointmentMailto("hello@example.com?bcc=other@example.com", "Awa", message), undefined);
});

test("WhatsApp normalizes international numbers and rejects short or contaminated values", () => {
  assert.equal(contactPhone("+221 77 000 00 00"), "221770000000");
  assert.equal(contactPhone("00221 (77) 000-00-00"), "221770000000");
  for (const value of [undefined, "", "123", "0770000000", "+221 77 000 00 00?text=other", "+221letters770000000", "+1234567890123456"]) assert.equal(contactPhone(value), undefined, String(value));
});

test("appointment dates reject past dates, elapsed times and invalid calendar dates", () => {
  const now = new Date(2026, 9, 1, 12, 0, 0);
  for (const [date, time] of [["2026-09-30", ""], ["2026-10-01", "11:59"], ["2026-10-01", "12:00"], ["2027-02-30", "12:00"], ["invalid", ""], ["2026-10-02", "24:00"], ["2026-10-02", "12:60"], ["2026-10-02", "9:00"]]) assert.equal(requestedAppointmentDate(date, time, now), undefined, `${date} ${time}`);
});

test("appointments allow a later time or an unspecified time today and valid leap days", () => {
  const now = new Date(2026, 9, 1, 12, 0, 0);
  assert.equal(localDate(requestedAppointmentDate("2026-10-01", "12:01", now)), "2026-10-01");
  assert.equal(localDate(requestedAppointmentDate("2026-10-01", "", new Date(2026, 9, 1, 23, 59, 30))), "2026-10-01");
  assert.equal(localDate(requestedAppointmentDate("2028-02-29", "10:00", now)), "2028-02-29");
  assert.equal(localDate(new Date(2026, 9, 1, 0, 5)), "2026-10-01");
});
