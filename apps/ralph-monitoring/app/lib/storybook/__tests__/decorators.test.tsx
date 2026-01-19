/** @vitest-environment jsdom */
import { act, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { useSyncExternalStore } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StorybookRouterOptions } from "../router";

const createStorybookRouterSpy = vi.fn();

vi.mock("~/components/ThemeProvider", () => ({
  ThemeProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

vi.mock("../router", async (importOriginal) => {
  const original = await importOriginal<typeof import("../router")>();

  return {
    ...original,
    createStorybookRouter: (...args: Parameters<typeof original.createStorybookRouter>) => {
      createStorybookRouterSpy(...args);
      return original.createStorybookRouter(...args);
    },
  };
});

import { withThemeAndRrRouter } from "../decorators";

interface DecoratorHarnessProps {
  Story: () => ReactElement;
  rrRouter?: StorybookRouterOptions;
}

const DecoratorHarness = ({ Story, rrRouter }: DecoratorHarnessProps) => {
  const node = withThemeAndRrRouter(Story, {
    parameters: { rrRouter, theme: "light" },
  } as unknown as Parameters<typeof withThemeAndRrRouter>[1]);

  return <>{node}</>;
};

describe("storybook decorators", () => {
  beforeEach(() => {
    createStorybookRouterSpy.mockClear();
  });

  it("does not recreate the router across Storybook re-renders", () => {
    let currentText = "Story A";
    const listeners = new Set<() => void>();

    const setText = (next: string) => {
      currentText = next;
      for (const listener of listeners) listener();
    };

    const subscribe = (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    };

    function Story() {
      const text = useSyncExternalStore(subscribe, () => currentText, () => currentText);
      return <div>{text}</div>;
    }

    const { rerender } = render(
      <DecoratorHarness Story={Story} rrRouter={{ initialEntries: ["/"] }} />
    );

    const initialRouterCreates = createStorybookRouterSpy.mock.calls.length;
    expect(initialRouterCreates).toBeGreaterThan(0);
    expect(screen.getByText("Story A")).toBeInTheDocument();

    // Simulate Storybook args/controls updates (the story updates without router recreation).
    act(() => setText("Story B"));
    expect(screen.getByText("Story B")).toBeInTheDocument();
    expect(createStorybookRouterSpy).toHaveBeenCalledTimes(initialRouterCreates);

    // Simulate Storybook producing fresh parameters objects on re-render.
    rerender(<DecoratorHarness Story={Story} rrRouter={{ initialEntries: ["/"] }} />);
    expect(createStorybookRouterSpy).toHaveBeenCalledTimes(initialRouterCreates);
  });

  it("recreates the router when the router shape changes", () => {
    function Story() {
      return <div>Story</div>;
    }

    const { rerender } = render(
      <DecoratorHarness Story={Story} rrRouter={{ initialEntries: ["/a"] }} />
    );

    const initialRouterCreates = createStorybookRouterSpy.mock.calls.length;
    expect(initialRouterCreates).toBeGreaterThan(0);

    rerender(<DecoratorHarness Story={Story} rrRouter={{ initialEntries: ["/b"] }} />);

    expect(createStorybookRouterSpy.mock.calls.length).toBeGreaterThan(initialRouterCreates);
  });
});

