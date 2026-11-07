import { afterEach, describe, expect, it, vi } from "vitest";
vi.mock("@/config", () => ({ FUTURE_MESSAGE_WEBHOOK_URL: "https://example.test/webhook/future-message", DEMO_TODAY: "2026-11-07" }));
import { prepareFutureMessage } from "@/lib/future-message";
import { buildOutlook } from "@/lib/outlook-data";

afterEach(() => vi.unstubAllGlobals());
describe("future-message response", () => {
  it("posts risk, language and persona and reads the exact text and audio fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ text: "Your saved voice note.", audio: "bXAz" }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const data = buildOutlook(null), risk = data.risks[0];
    if (!risk) throw new Error("Expected demo risk");
    const result = await prepareFutureMessage(risk, "en", data.persona, new AbortController().signal);
    expect(result).toEqual({ text: "Your saved voice note.", audio: "bXAz" });
    expect(fetchMock.mock.calls[0]?.[0]).toBe("https://example.test/webhook/future-message");
    const request = fetchMock.mock.calls[0]?.[1];
    expect(request.method).toBe("POST");
    expect(Object.keys(JSON.parse(request.body))).toEqual(["risk", "language", "persona"]);
  });
  it("rejects failed requests so the card can offer retry and its bundled fallback", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("Unavailable", { status: 503 })));
    const data = buildOutlook(null), risk = data.risks[0];
    if (!risk) throw new Error("Expected demo risk");
    await expect(prepareFutureMessage(risk, "en", data.persona, new AbortController().signal)).rejects.toThrow("Message 503");
  });
  it("rejects responses without audio rather than leaving a broken player", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ text: "Missing audio" }), { status: 200 })));
    const data = buildOutlook(null), risk = data.risks[0];
    if (!risk) throw new Error("Expected demo risk");
    await expect(prepareFutureMessage(risk, "en", data.persona, new AbortController().signal)).rejects.toThrow("Incomplete message");
  });
});