---
name: driver-fix
description: "Reusable workflow for fixing a device catalog driver issue: analyze the ticket, patch the driver, validate with payloads and examples, clean temporary files, and update the changelog."
argument-hint: "Describe the driver bug or ticket to fix."
user-invocable: true
---

# Driver Fix

## Purpose
This skill captures the standard workflow for fixing a device catalog driver issue in a reusable, repeatable way.

## When to use
- A ticket reports a driver decoding, parsing, serialization, or example regression.
- The fix must be validated against the reported payload and existing driver examples.
- The change requires a changelog entry and cleanup of temporary debug artifacts.

## Workflow
1. Analyze the issue
   - Read the ticket report and identify the exact error message.
   - Locate the driver implementation for the affected vendor/model.
   - Determine whether the bug is in payload parsing, value serialization, or mapping logic.

2. Fix the driver
   - Reproduce the error with the reported payload or a representative example.
   - Apply a minimal, targeted code change in the driver.
   - Ensure the fix preserves existing behavior and produces valid JSON-serializable output.

3. Verify the fix
   - Run the failing payload through the updated driver.
   - Run existing examples from `examples.json` or the shared test harness.
   - Confirm there are no regressions and the driver still decodes previous cases correctly.

4. Clean up
   - Remove any temporary test or debug files created during investigation.
   - Keep the driver folder limited to production files only.

5. Update the changelog
   - Add an entry in `change-log-drivers.txt` in the `device-catalog-private` repository.
   - Add the entry under the **existing** current version section. Only create a new version section if a new catalog release is being prepared.
   - Include the ticket number and a concise description of the fix.

## Acceptance criteria
- The ticket bug is reproduced and fixed.
- Existing driver examples still pass.
- No temporary debug files remain.
- The changelog contains the ticket reference and proper version section.

## Example prompts
- "Fix the BigInt serialization error for the Elvaco CMi41xx driver and update the changelog for TXIF-4062."
- "Apply a driver fix workflow for a payload parsing bug in the device catalog."

## Notes
- Prefer small, targeted fixes that preserve existing driver behavior.
- Validate with both the ticket payload and official driver examples.
- Document the driver fix clearly in the changelog, including the ticket ID.
- Commit the driver changes on the `device-catalog` repository and the changelog update on the `device-catalog-private` repository.
- Start the commit message with the ticket number, for example: `TXIF-4062: Fix BigInt serialization error in Elvaco CMi41xx driver`.
