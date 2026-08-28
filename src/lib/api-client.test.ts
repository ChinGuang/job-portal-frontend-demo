import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiFetch,
  resetAuthTokenProvider,
  setAuthTokenProvider,
} from "./api-client";
import { ApiError } from "./api-error";

const BASE = "http://backend.test/api";

function mockFetchOnce(init: {
  ok?: boolean;
  status?: number;
  json?: unknown;
  text?: string;
}) {
  const status = init.status ?? (init.ok === false ? 400 : 200);
  const ok = init.ok ?? status < 400;
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status,
    json: () =>
      init.json === undefined
        ? Promise.reject(new Error("no json"))
        : Promise.resolve(init.json),
    text: () => Promise.resolve(init.text ?? JSON.stringify(init.json ?? "")),
  } as unknown as Response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => {
  resetAuthTokenProvider();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("apiFetch — URL building", () => {
  it("joins the base URL and a leading-slash path", async () => {
    const fetchMock = mockFetchOnce({ json: { ok: true } });
    await apiFetch("/jobs", {}, BASE);
    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.test/api/jobs",
      expect.anything(),
    );
  });

  it("tolerates a path without a leading slash and a base with a trailing slash", async () => {
    const fetchMock = mockFetchOnce({ json: {} });
    await apiFetch("jobs", {}, "http://backend.test/api/");
    expect(fetchMock).toHaveBeenCalledWith(
      "http://backend.test/api/jobs",
      expect.anything(),
    );
  });

  it("serializes query params and skips nullish ones", async () => {
    const fetchMock = mockFetchOnce({ json: {} });
    await apiFetch(
      "/jobs",
      { query: { q: "dev", limit: 10, location: undefined } },
      BASE,
    );
    const [calledUrl] = fetchMock.mock.calls[0];
    const url = new URL(calledUrl as string);
    expect(url.searchParams.get("q")).toBe("dev");
    expect(url.searchParams.get("limit")).toBe("10");
    expect(url.searchParams.has("location")).toBe(false);
  });
});

describe("apiFetch — body handling", () => {
  it("JSON-encodes an object body and sets the content-type", async () => {
    const fetchMock = mockFetchOnce({ json: {} });
    await apiFetch("/jobs", { method: "POST", body: { title: "Dev" } }, BASE);
    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = (requestInit as RequestInit).headers as Headers;
    expect(headers.get("Content-Type")).toBe("application/json");
    expect((requestInit as RequestInit).body).toBe('{"title":"Dev"}');
  });

  it("passes FormData through without forcing a content-type", async () => {
    const fetchMock = mockFetchOnce({ json: {} });
    const form = new FormData();
    form.append("file", new Blob(["x"]), "resume.pdf");
    await apiFetch("/upload", { method: "POST", body: form }, BASE);
    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = (requestInit as RequestInit).headers as Headers;
    expect(headers.get("Content-Type")).toBeNull();
    expect((requestInit as RequestInit).body).toBeInstanceOf(FormData);
  });
});

describe("apiFetch — auth token injection", () => {
  it("omits the Authorization header when no token is available", async () => {
    const fetchMock = mockFetchOnce({ json: {} });
    await apiFetch("/me", {}, BASE);
    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = (requestInit as RequestInit).headers as Headers;
    expect(headers.has("Authorization")).toBe(false);
  });

  it("adds a bearer header when a provider yields a token", async () => {
    setAuthTokenProvider(() => "jwt-123");
    const fetchMock = mockFetchOnce({ json: {} });
    await apiFetch("/me", {}, BASE);
    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = (requestInit as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer jwt-123");
  });
});

describe("apiFetch — responses & errors", () => {
  it("returns parsed JSON on success", async () => {
    mockFetchOnce({ json: { id: "1", title: "Dev" }, text: '{"id":"1","title":"Dev"}' });
    const result = await apiFetch<{ id: string; title: string }>("/jobs/1", {}, BASE);
    expect(result).toEqual({ id: "1", title: "Dev" });
  });

  it("returns undefined for a 204 No Content", async () => {
    mockFetchOnce({ status: 204, ok: true });
    const result = await apiFetch("/jobs/1", { method: "DELETE" }, BASE);
    expect(result).toBeUndefined();
  });

  it("throws an ApiError with the backend message on failure", async () => {
    mockFetchOnce({ status: 409, ok: false, json: { statusCode: 409, message: "Already applied" } });
    await expect(apiFetch("/jobs/1/applications", { method: "POST" }, BASE)).rejects.toMatchObject({
      status: 409,
      message: "Already applied",
    });
  });

  it("joins array validation messages", async () => {
    mockFetchOnce({ status: 400, ok: false, json: { message: ["title required", "type invalid"] } });
    await expect(apiFetch("/jobs", { method: "POST" }, BASE)).rejects.toThrow(
      "title required, type invalid",
    );
  });

  it("falls back to a generic message when the body has none", async () => {
    mockFetchOnce({ status: 500, ok: false, json: {} });
    const error = (await apiFetch("/jobs", {}, BASE).catch((e) => e)) as ApiError;
    expect(error).toBeInstanceOf(ApiError);
    expect(error.message).toBe("Request failed with status 500");
  });

  it("exposes status helpers on the thrown error", async () => {
    mockFetchOnce({ status: 401, ok: false, json: { message: "no token" } });
    const error = (await apiFetch("/me", {}, BASE).catch((e) => e)) as ApiError;
    expect(error.isUnauthorized).toBe(true);
    expect(error.isForbidden).toBe(false);
  });
});
