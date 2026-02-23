import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import {
  detectInAppBrowser,
  InAppBrowserBanner,
} from "./InAppBrowserBanner";

const setUserAgent = (ua: string) => {
  Object.defineProperty(navigator, "userAgent", {
    value: ua,
    configurable: true,
  });
};

const LINE_IOS_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Line/12.0.0";
const LINE_ANDROID_UA =
  "Mozilla/5.0 (Linux; Android 13; SM-G998B) AppleWebKit/537.36 Mobile Safari/537.36 Line/12.0.0";
const SAFARI_UA =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1";

describe("detectInAppBrowser", () => {
  it("detects LINE browser", () => {
    expect(detectInAppBrowser(LINE_IOS_UA)).toBe("LINE");
  });

  it("detects Facebook browser", () => {
    expect(
      detectInAppBrowser("Mozilla/5.0 ... FBAN/FBForIPhone ..."),
    ).toBe("Facebook");
  });

  it("detects Instagram browser", () => {
    expect(detectInAppBrowser("Mozilla/5.0 ... Instagram/280.0 ...")).toBe(
      "Instagram",
    );
  });

  it("detects KakaoTalk browser", () => {
    expect(detectInAppBrowser("Mozilla/5.0 ... KAKAOTALK/10.0 ...")).toBe(
      "KakaoTalk",
    );
  });

  it("returns null for regular Safari", () => {
    expect(detectInAppBrowser(SAFARI_UA)).toBeNull();
  });

  it("returns null for Chrome desktop", () => {
    expect(
      detectInAppBrowser(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0 Safari/537.36",
      ),
    ).toBeNull();
  });
});

describe("InAppBrowserBanner", () => {
  const originalUA = navigator.userAgent;

  afterEach(() => {
    setUserAgent(originalUA);
  });

  it("renders nothing in regular Safari", () => {
    setUserAgent(SAFARI_UA);
    const { container } = render(<InAppBrowserBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("shows banner in LINE iOS browser", async () => {
    setUserAgent(LINE_IOS_UA);
    render(<InAppBrowserBanner />);

    await waitFor(() => {
      expect(
        screen.getByText(/Google sign-in isn't available in LINE/),
      ).toBeInTheDocument();
    });
  });

  it("shows iOS instruction text (not Android) on iPhone LINE", async () => {
    setUserAgent(LINE_IOS_UA);
    render(<InAppBrowserBanner />);

    await waitFor(() => {
      expect(screen.getByText(/Open in browser/)).toBeInTheDocument();
    });
    expect(screen.queryByText("Open in Chrome")).not.toBeInTheDocument();
  });

  it("shows Open in Chrome button on Android LINE", async () => {
    setUserAgent(LINE_ANDROID_UA);
    render(<InAppBrowserBanner />);

    await waitFor(() => {
      expect(screen.getByText("Open in Chrome")).toBeInTheDocument();
    });
  });

  it("dismisses banner when close button is clicked", async () => {
    setUserAgent(LINE_IOS_UA);
    render(<InAppBrowserBanner />);

    await waitFor(() => {
      expect(screen.getByLabelText("Dismiss")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Dismiss"));

    expect(
      screen.queryByText(/Google sign-in isn't available/),
    ).not.toBeInTheDocument();
  });

  it("copies link to clipboard when copy button is clicked", async () => {
    setUserAgent(LINE_IOS_UA);
    const mockWriteText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: mockWriteText },
      configurable: true,
    });

    render(<InAppBrowserBanner />);

    await waitFor(() => {
      expect(screen.getByText("Copy link")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Copy link"));

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith(window.location.href);
    });
  });

  it("shows Copied! after successful clipboard write", async () => {
    setUserAgent(LINE_IOS_UA);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: jest.fn().mockResolvedValue(undefined) },
      configurable: true,
    });

    render(<InAppBrowserBanner />);

    await waitFor(() => {
      expect(screen.getByText("Copy link")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Copy link"));

    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });
});
