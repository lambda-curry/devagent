/** @vitest-environment jsdom-node-abort */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { Link, RouterProvider, data, useFetcher } from "react-router";

import { createStorybookRouter } from "../router";

describe("storybook router stubs", () => {
  it("renders a story that uses Link without crashing", () => {
    function Story() {
      return <Link to="/destination">Go</Link>;
    }

    const router = createStorybookRouter(Story);
    render(<RouterProvider router={router} />);

    expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute(
      "href",
      "/destination"
    );
  });

  it("supports mocking actions for useFetcher without network", async () => {
    const actionSpy = vi.fn<(name: string | null) => void>();

    function Story() {
      const fetcher = useFetcher();

      return (
        <fetcher.Form method="post" action="/api/demo">
          <input name="name" defaultValue="Jake" />
          <button type="submit">Submit</button>
        </fetcher.Form>
      );
    }

    const router = createStorybookRouter(Story, {
      extraRoutes: [
        {
          path: "/api/demo",
          action: async ({ request }) => {
            const bodyText = await request.text();
            const params = new URLSearchParams(bodyText);
            actionSpy(params.get("name"));
            return data({ ok: true });
          }
        }
      ]
    });

    render(<RouterProvider router={router} />);
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => expect(actionSpy).toHaveBeenCalledWith("Jake"));
  });
});

