# Telemetry & Inference Schemas

This directory houses versioned contracts for payloads exchanged between
PhishSentry components. Keeping schemas alongside the repository ensures
front-end, API, and model-engine changes stay coordinated during releases.

## Available Schemas

- **Browser Extension → Scoring API**: [`extension-event.v1.json`](./extension-event.v1.json)
  documents the telemetry payload emitted by the browser extension when a
  suspicious URL is detected.
- **Scoring API ↔ Model Engine**: [`model-engine.proto`](./model-engine.proto)
  defines the protobuf service contract for exchanging feature vectors and
  scoring responses.

## Versioning Guidelines

Each schema file includes the version identifier in its filename. When a
breaking change is introduced, create a new versioned file (for example,
`extension-event.v2.json`) and update downstream consumers incrementally. If a
change is additive and backward compatible, update the schema in-place while
bumping the `schema_version` field in emitted payloads.

## Regenerating Artifacts

- JSON schemas are authored manually and can be linted using
  [`ajv`](https://ajv.js.org/) or similar tooling.
- Protobuf definitions can be compiled with `buf` or `protoc` once the build
  pipeline is wired up. The `model-engine.proto` contract is compatible with
  `protoc >= 3.20`.

Consumers should pin schema versions during rollout and only advance after
integration tests confirm compatibility across services.
