import { describe, expect, it } from "vitest";
import { endpointPermitido } from "./pushEndpoint";

describe("endpointPermitido", () => {
  it("aceita uma URL real do FCM (Chrome/Android)", () => {
    expect(
      endpointPermitido("https://fcm.googleapis.com/fcm/send/abc123")
    ).toBe(true);
  });

  it("aceita uma URL real da Mozilla (Firefox)", () => {
    expect(
      endpointPermitido(
        "https://updates.push.services.mozilla.com/wpush/v2/abc123"
      )
    ).toBe(true);
  });

  it("aceita uma URL real da Apple (Safari/iOS)", () => {
    expect(endpointPermitido("https://web.push.apple.com/abc")).toBe(true);
  });

  it("rejeita http (nao https)", () => {
    expect(endpointPermitido("http://fcm.googleapis.com/fcm/send/abc")).toBe(
      false
    );
  });

  it("rejeita endereco de metadata interno (SSRF)", () => {
    expect(endpointPermitido("https://169.254.169.254/latest")).toBe(false);
  });

  it("rejeita localhost", () => {
    expect(endpointPermitido("https://localhost/x")).toBe(false);
  });

  it("rejeita host desconhecido mesmo citando fcm.googleapis.com no path", () => {
    expect(endpointPermitido("https://evil.com/fcm.googleapis.com")).toBe(
      false
    );
  });

  it("rejeita truque de sufixo com dominio parecido", () => {
    expect(
      endpointPermitido("https://fcm.googleapis.com.evil.com/x")
    ).toBe(false);
  });

  it("rejeita URL com credenciais embutidas", () => {
    expect(
      endpointPermitido("https://user:pass@fcm.googleapis.com/x")
    ).toBe(false);
  });

  it("rejeita porta nao padrao", () => {
    expect(endpointPermitido("https://fcm.googleapis.com:8443/x")).toBe(false);
  });

  it("rejeita string que nao e URL", () => {
    expect(endpointPermitido("not a url")).toBe(false);
  });
});
