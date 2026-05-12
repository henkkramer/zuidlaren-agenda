# 11 - AI Card Assistant

## Goal

Provide AI-assisted activity card creation while keeping humans in control.

## Scope

- Provider-agnostic AI service interface.
- Prompt templates and usage logs.
- Business UI actions for text help.
- Cost/usage tracking foundations.

## Non-Goals

- Auto-publishing AI output.
- Unreviewed image generation.
- Complex multilingual translation in MVP.

## AI Actions

- `Verbeter tekst`
- `Maak korter`
- `Maak enthousiaster`
- `Maak formeler`
- `Maak geschikt voor gezinnen`
- `Suggest tags`
- `Suggest category/type`
- `Maak een banner prompt`
- `Controleer op ontbrekende informatie`

## Technical Decisions

- Store prompts in `AiPromptTemplate` with version.
- Log every request in `AiUsageLog`.
- Keep provider behind an interface such as `AiProvider`.
- UI shows suggestions that users explicitly apply.
- Admin can disable AI with a feature flag.

## API Changes

- `POST /api/businesses/:businessId/ai/activity-assist`
- Admin later: prompt template management.

## Validation Rules

- User must be active business member.
- Request action must be allowlisted.
- Input length must be capped.
- Generated content must not directly publish activity.

## Tests

- AI endpoint rejects unauthorized users.
- Usage log is created for each request.
- Disabled feature flag blocks requests.
- Suggestions require explicit apply/save action.

## Acceptance Criteria

- AI improves creation workflow without controlling publication.
- Provider can be swapped without changing business UI code.

