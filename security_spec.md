# Security Specification for Barbershop App

## Data Invariants
1. Store configurations must be private and accessible only by their specific PIN.
2. The public main_config version is read-only for visitors but writable by admins.
3. PINs must be exactly 4 digits.
4. Users cannot modify the structure of other stores.

## The Dirty Dozen Payloads (Rejection Targets)
1. **Unauthenticated Read**: Attempt to read `stores/1234` without auth.
2. **Identity Spoofing**: Attempt to write to `stores/1235` using a different PID.
3. **Ghost Field Write**: Attempt to add `isAdmin: true` to a store document.
4. **Invalid PIN ID**: Attempt to create a document with ID `long-string-id` in the stores collection.
5. **PII Leak**: Unauthorized read of potential PII fields.
6. **Type Poisoning**: Sending an integer for `brandName`.
7. **Resource Exhaustion**: Sending a 2MB base64 string for `logoUrl` (if not compressed/limited).
8. **Unauthorized Public Write**: Visitors attempting to write to `public/main_config`.
9. **Malformed PIN**: Document ID like `abcd` (non-numeric).
10. **State Shortcut**: (Not applicable here yet).
11. **Orphaned Write**: Creating a product without a parent store.
12. **Timestamp Spoofing**: Sending a client-side `updatedAt`.

## Test Runner
Verified below in draft_firestore.rules.
