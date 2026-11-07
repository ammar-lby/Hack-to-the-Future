<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Project rules

- All UI copy lives in per-language blocks in `src/i18n/translations.ts` and is accessed via `useLanguage().t`; the welcome screen explicitly uses English copy, with native language labels as the only script exceptions.
- Keep the language provider in the root shell so normal screens and error screens share saved language and document direction; the welcome screen overrides direction to LTR.
- Onboarding follows /welcome → /currency → /setup; typed browser-storage helpers persist language and currency independently so changing language preserves currency.
- Profile setup uses a versioned localStorage profile plus a separate resumable draft; keep the raw imported Adam JSON in the demo profile so its transaction history remains available without duplicated persona data.
- Outlook and dashboard preview share one presentation and use a typed, logic-preserving forecast engine; apply the configured demo date only to a cloned input so stored history remains untouched.
- Do not synthesize transaction history for forecasts; personal profiles without transactions show a clearly labelled Adam demo outlook.
- Voice notes and card speech share one audio controller to prevent simultaneous playback; future-message responses prepare without autoplay and use the exact webhook payload adapter.
- Risk actions persist as local plans/reminders, never money transfers or notifications; coach receives the saved risk context and only sends chat when its webhook is configured.
- Coach sends the complete role/content conversation with unchanged forecast output; risk context is a translated initial user turn, and retry resends the pending turn without duplicates.
- Browser recognition is detected after hydration and stopped on language changes, send and unmount; reply playback uses the shared audio controller.
- Demo simulation persists input overrides separately from persona history and notifies all forecast consumers; projected dashboard totals use engine events, never a second balance calculation.
