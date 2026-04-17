---
name: new-device
description: "Reusable workflow for adding a new device driver to the device catalog: analyze the ticket or manufacturer documentation, create the driver, profiles, models, mappings, validate with examples, and update the changelog."
argument-hint: "Describe the new device to add, or provide a ticket number or manufacturer documentation reference."
user-invocable: true
---

# New Device

## Purpose
This skill captures the standard workflow for adding a new device (driver, profiles, models, mappings) to the device catalog in a reusable, repeatable way.

## When to use
- A ticket or manufacturer documentation describes a new device to integrate.
- A new driver JS file, profiles, models and/or mappings need to be created.
- The change requires validation with examples and a changelog entry.

## Workflow

1. Analyze the source
   - Read the ticket (if any) or the manufacturer documentation.
   - Identify the vendor name, device model(s), protocol, payload format, and measurement fields.
   - Locate or create the target vendor folder under `vendors/<vendor>/`.

2. Create the driver
   - Implement `decodeUplink()` (and optionally `encodeDownlink()`) in `index.js`.
   - Implement `extractPoints()` to map decoded fields to catalog points.
   - Ensure all values are JSON-serializable (no BigInt, no undefined).

3. Create examples
   - Add representative payloads and expected outputs in `examples.json`.
   - Cover at least one uplink per supported message format.
   - Cover `extractPoints` output for each example.

4. Create profiles and models
   - Add device profile YAML files under `profiles/`.
   - Add device model YAML files under `models/`.
   - Reference the driver correctly in each profile.

5. Create mappings (if applicable)
   - Add BACnet or other protocol mappings under the relevant mapping folder.

6. Verify
   - Run the driver examples through the shared test harness.
   - Confirm all examples pass with no errors or warnings.
   - Remove any temporary files used during development.

7. Update the changelog
   - Add an entry in `change-log-drivers.txt` in the `device-catalog-private` repository.
   - Add the entry under the **existing** current version section. Only create a new version section if a new catalog release is being prepared.
   - Include the ticket number (if any) and a concise description of the new device.

## Acceptance criteria
- Driver decodes all documented payload types correctly.
- All `examples.json` entries pass the test harness.
- Profiles, models and mappings are present and coherent.
- No temporary debug files remain.
- The changelog contains the ticket reference (if any) and proper version section.

## Example prompts
- "Add a new device driver for the Elvaco CMi4200 from ticket TXIF-5001."
- "Create the full catalog entry (driver, profiles, models) for a new Honeywell sensor from the manufacturer documentation."

## Notes
- Follow the existing folder structure: `vendors/<vendor>/drivers/<model>/`.
- Use existing drivers of the same vendor as reference when available.
- Commit the driver, profiles, models and mappings on the `device-catalog` repository and the changelog update on the `device-catalog-private` repository.
- Start the commit message with the ticket number if one exists, e.g.: `TXIF-5001: Add Elvaco CMi4200 driver and extractPoints`.
