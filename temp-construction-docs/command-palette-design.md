# Linear-Style Command Palette Design

## Goals and Success Criteria

- Deliver a global palette that opens in ~30 ms perceived latency on shortcut (Cmd+/ / Ctrl+/, avoiding the Chrome search conflict) with Shift+mod+P fallback.
- Ensure fully keyboard-driven, screen-reader compatible interactions that mirror Linear's clarity.
- Provide fuzzy, typo-tolerant search across commands and entities, with context awareness by route, selection, and user role.
- Offer an extensible registry for teams to register commands, providers, and slash verbs without modifying core.
- Operate offline-first where possible and degrade gracefully when network resources are unavailable.

## User Experience Overview

- **Invocation**: Global shortcut listener (Cmd+/ on macOS, Ctrl+/ otherwise) plus Shift+mod+P fallback; this bypasses Chrome's Cmd/Ctrl+K search shortcut; header hint with omnibox icon.
- **Modes**: Normal fuzzy search; command-only (`>`); id/tag search (`#`); slash verbs (`/verb args`) with autocomplete and inline help.
- **Layout**: 640 px centered modal; 56 px input field; grouped result sections (Top results, Commands, Recent, Projects, Tickets, Docs, Settings, Admin); row format with icon, primary label, right-aligned shortcut, secondary subtitle; optional right-panel preview for supported items.
- **Keyboard Map**: Up/Down navigate; Enter executes; Cmd/Ctrl+Enter alternate action; Esc closes; Cmd+Backspace clears; Cmd+[ / Cmd+] cycles groups; slash mode adds Tab autocomplete, Space confirm token, Alt+Right insert suggestion.
- **Context Awareness**: Query payload includes route, selected entity, user role, feature flags to allow providers to boost or suppress items.
- **Empty/Error States**: Show recents and recommended commands when idle; offer create flows on zero results; inline toast with retry on provider errors.

## Architecture

### Core Modules

- **Command Registry**: Declarative API to register commands (id, title, keywords, guard, run, preview, shortcut, icon, dynamic children). Commands load lazily and gate on guard checks.
- **Provider System**: Asynchronous providers returning grouped `Result` items with scores, hints, subtitles, icons, selection handlers. Supports `search` and optional `empty` for recents.
- **Slash Verb Registry**: Defines verbs, descriptions, args (with suggestors), and run handlers. Parser produces `{verb, args, free}` and drives structured UI.
- **Search Engine**: Hybrid local fuzzy matcher (command sets, cached routes) plus server search for large datasets (entities, docs). Handles typo tolerance, synonyms, and provider scoring.
- **Palette Shell**: Modal shell handling focus trap, input state, debounced queries, virtualized results, preview panel, keyboard map, aria roles, analytics hooks.
- **Execution Router**: Resolves selected result to a handler, passing context, telemetry, and undo hooks. Supports optimistic updates and alternate actions.

### Data Flow

1. Shortcut fires global event; palette shell opens, focuses input, loads pre-warmed resources.
2. Input updates feed dual-mode parser (normal vs slash) and schedule provider queries after 75 ms debounce.
3. Providers run in parallel with 150 ms per-frame budget; client aborts stale requests via `AbortController`.
4. Results stream back, deduped and merged; top 7 render immediately, remainder virtualized.
5. Selection triggers execution router; palette closes (unless handler keeps it open) and analytics log open/query/impression/selection latencies.

### Extensibility Model

- Core exports simple `registerCommand`, `registerProvider`, and `registerSlashVerb` APIs.
- Feature modules register commands/providers during lazy module init. Registrations support feature flags and role-based guards.
- Providers declare priority weights and context filters to tune ranking per environment.

## Performance Strategy

- Preload palette shell bundle during idle; precompute fuzzy index for commands.
- Use web worker or requestAnimationFrame batching for heavy scoring to keep input responsive.
- Cache recent entity queries and apply request coalescing server-side; use HTTP caching headers.
- Instrument open-to-first-paint, query latency, abort counts. Target: <16 ms shell paint, <80 ms command results, <200 ms P50 entity results, <400 ms P95.

## Accessibility

- `role="dialog"` with `aria-modal="true"`; input labeled via `aria-labelledby`.
- Result rows as buttons with `aria-describedby`, `aria-keyshortcuts`, active descendant management for screen readers.
- Focus trap with restoration to origin; support `prefers-reduced-motion` and high-contrast theme tokens.
- Announce result count and mode changes via `aria-live` region.

## Offline and Error Handling

- Commands and local providers run offline; entity provider caches last successful payload for offline fallback.
- Graceful degradation: show offline banner, limit to local commands, queue actions where possible.
- Retries: exponential backoff with inline feedback; telemetry logs provider failures.

## Security and Permissions

- Context includes scoped auth token; server filters unauthorized entities.
- Client-side guards prevent showing commands user cannot execute but never expose sensitive data.
- Provider results sanitize all labels/descriptions; avoid executing arbitrary code from registration payloads.

## Analytics

- Log events: palette_opened, query_changed, result_impression, result_selected, execution_success/failure.
- Capture latency metrics, zero-result queries, aborted sessions, slash verb usage.
- Weekly dashboard for top commands, dead queries, high-error handlers.

## Implementation Roadmap

### Phase 1 (Foundations, 2-3 days)

- Build palette shell, global shortcut listener, focus trap, accessibility scaffolding.
- Implement command registry, command provider, local fuzzy search, analytics skeleton.
- Seed core commands: navigation, create item, open settings, search docs.

### Phase 2 (Entity Search, 3-5 days)

- Ship server endpoints: `/api/palette/entities`, `/api/palette/recent` with context payloads, caching, and permission filtering.
- Implement entities provider with streaming, abort support, scoring boosts.
- Add context injection (route, selection, role) to query pipeline.

### Phase 3 (Slash Verbs and Previews, 2-3 days)

- Add slash verb parser, registry, UI affordances, and autocomplete suggestions.
- Implement preview panel with lazy-loaded detail cards; support alternate action (Cmd/Ctrl+Enter).

### Phase 4 (Polish and Quality, 2-4 days)

- Accessibility validation, keyboard edge cases, synonyms, empty states, offline fallbacks.
- Performance tuning, prefetching, analytics dashboards, instrumentation.

## Testing Plan

- Unit tests for parser, fuzzy search, providers merging, context guards.
- Integration tests simulating keyboard flows (playwright/cypress) for open-search-execute.
- Accessibility smoke tests with VoiceOver, NVDA; verify aria attributes.
- Performance regression tests on mid-tier hardware and throttled networks.
- Permissions matrix ensuring users only see authorized results.

## Rollout Strategy

- Feature flag the palette; dogfood internally; collect telemetry.
- Add subtle header tooltip promoting shortcut; optionally show first-run helper modal.
- Monitor analytics and logs; iterate on synonyms and provider tuning before full rollout.

## Future Enhancements

- Macro workflows chaining commands.
- Inline natural language parsing for dates/people (`+3d`, `@me`).
- Collaborative presence hints showing teammate actions.
- Offline cache expansion with IndexedDB for entity recents.
