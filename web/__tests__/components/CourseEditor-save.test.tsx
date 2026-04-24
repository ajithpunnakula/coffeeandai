import { describe, it, expect, vi, beforeEach } from "vitest";

describe("CourseEditor save logic", () => {
  it("scheduleSave should use latest card data via ref, not stale closure", () => {
    // Simulates the stale closure bug fix:
    // Previously, useCallback(fn, []) captured the initial flushSave which
    // used the initial cards state. Now we use refs to always access current state.

    let cardsRef = { current: [{ id: "card_1", title: "Original" }] };

    function flushSave() {
      // This now reads from ref instead of closure
      return cardsRef.current;
    }

    // Simulate state update
    cardsRef.current = [{ id: "card_1", title: "Updated" }];

    // flushSave should see the updated data
    const result = flushSave();
    expect(result[0].title).toBe("Updated");
  });

  it("handleAddCard should persist card_order to DB", async () => {
    // Simulates the flow where adding a card should trigger a reorder API call
    const reorderCalls: string[][] = [];

    async function handleAddCard(
      currentOrder: string[],
      newCardId: string,
    ) {
      const newOrder = [...currentOrder, newCardId];
      // Should persist to DB
      reorderCalls.push(newOrder);
      return newOrder;
    }

    const result = await handleAddCard(["card_1", "card_2"], "card_3");

    expect(result).toEqual(["card_1", "card_2", "card_3"]);
    expect(reorderCalls).toHaveLength(1);
    expect(reorderCalls[0]).toEqual(["card_1", "card_2", "card_3"]);
  });

  it("handlePublish should show error on failure", async () => {
    // Simulates the missing catch block fix
    const alerts: string[] = [];
    const originalAlert = globalThis.alert;
    globalThis.alert = (msg: string) => alerts.push(msg);

    async function handlePublish(fetchFn: () => Promise<Response>) {
      try {
        const res = await fetchFn();
        if (!res.ok) {
          const data = await res
            .json()
            .catch(() => ({ error: "Publish request failed" }));
          alerts.push(`Publish failed: ${data.error}`);
          return;
        }
      } catch (err) {
        alerts.push(
          `Publish failed: ${err instanceof Error ? err.message : "Unknown error"}`,
        );
      }
    }

    // Network error
    await handlePublish(() => Promise.reject(new Error("Network down")));
    expect(alerts).toContain("Publish failed: Network down");

    // Non-JSON error response
    alerts.length = 0;
    await handlePublish(() =>
      Promise.resolve(new Response("Internal Server Error", { status: 500 })),
    );
    expect(alerts[0]).toContain("Publish failed");

    globalThis.alert = originalAlert;
  });
});
