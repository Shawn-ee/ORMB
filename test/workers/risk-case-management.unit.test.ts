import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  type RiskCaseEvent,
  summarizeRiskCases,
  transitionRiskCase,
} from "../../workers/risk-case-management.js";

describe("transitionRiskCase", () => {
  it("acknowledges an open risk case", () => {
    const result = transitionRiskCase({
      event: riskEvent({ status: "OPEN" }),
      action: "acknowledge",
      actorId: "operator_1",
      note: "Reviewed source wallet evidence.",
      now: new Date("2026-06-18T12:00:00.000Z"),
    });

    assert.equal(result.nextStatus, "ACKNOWLEDGED");
    assert.equal(result.auditAction, "risk.case.acknowledged");
    assert.deepEqual(result.auditMetadata, {
      previousStatus: "OPEN",
      nextStatus: "ACKNOWLEDGED",
      actorId: "operator_1",
      note: "Reviewed source wallet evidence.",
      transitionedAt: "2026-06-18T12:00:00.000Z",
    });
  });

  it("resolves acknowledged and open risk cases with audit notes", () => {
    const acknowledgedResult = transitionRiskCase({
      event: riskEvent({ status: "ACKNOWLEDGED" }),
      action: "resolve",
      actorId: "operator_1",
      note: "Demo evidence reviewed; no real compliance approval implied.",
      now: new Date("2026-06-18T13:00:00.000Z"),
    });

    assert.equal(acknowledgedResult.nextStatus, "RESOLVED");
    assert.equal(acknowledgedResult.auditAction, "risk.case.resolved");
    assert.deepEqual(acknowledgedResult.auditMetadata, {
      previousStatus: "ACKNOWLEDGED",
      nextStatus: "RESOLVED",
      actorId: "operator_1",
      note: "Demo evidence reviewed; no real compliance approval implied.",
      transitionedAt: "2026-06-18T13:00:00.000Z",
    });

    const openResult = transitionRiskCase({
      event: riskEvent({ status: "OPEN" }),
      action: "resolve",
      actorId: "operator_1",
      note: "Closed during local tabletop review.",
      now: new Date("2026-06-18T13:05:00.000Z"),
    });

    assert.equal(openResult.nextStatus, "RESOLVED");
    assert.equal(openResult.auditMetadata.previousStatus, "OPEN");
    assert.equal(openResult.auditMetadata.note, "Closed during local tabletop review.");
  });

  it("reopens acknowledged or resolved risk cases with audit metadata", () => {
    const acknowledgedResult = transitionRiskCase({
      event: riskEvent({ status: "ACKNOWLEDGED" }),
      action: "reopen",
      actorId: "operator_1",
      note: "New demo evidence requires another review.",
      now: new Date("2026-06-18T14:00:00.000Z"),
    });

    assert.equal(acknowledgedResult.nextStatus, "OPEN");
    assert.equal(acknowledgedResult.auditAction, "risk.case.reopened");
    assert.deepEqual(acknowledgedResult.auditMetadata, {
      previousStatus: "ACKNOWLEDGED",
      nextStatus: "OPEN",
      actorId: "operator_1",
      note: "New demo evidence requires another review.",
      transitionedAt: "2026-06-18T14:00:00.000Z",
    });

    const resolvedResult = transitionRiskCase({
      event: riskEvent({ status: "RESOLVED" }),
      action: "reopen",
      actorId: "operator_1",
      note: "Release review found unresolved demo risk context.",
    });

    assert.equal(resolvedResult.nextStatus, "OPEN");
    assert.equal(resolvedResult.auditMetadata.previousStatus, "RESOLVED");
  });

  it("rejects invalid transitions and missing actors", () => {
    assert.throws(() =>
      transitionRiskCase({
        event: riskEvent({ status: "ACKNOWLEDGED" }),
        action: "acknowledge",
        actorId: "operator_1",
      }),
    );

    assert.throws(() =>
      transitionRiskCase({
        event: riskEvent({ status: "RESOLVED" }),
        action: "acknowledge",
        actorId: "operator_1",
      }),
    );

    assert.throws(() =>
      transitionRiskCase({
        event: riskEvent({ status: "RESOLVED" }),
        action: "resolve",
        actorId: "operator_1",
      }),
    );

    assert.throws(() =>
      transitionRiskCase({
        event: riskEvent({ status: "OPEN" }),
        action: "acknowledge",
        actorId: " ",
      }),
    );
  });
});

describe("summarizeRiskCases", () => {
  it("summarizes case counts and flags open high-risk cases", () => {
    const summary = summarizeRiskCases([
      riskEvent({ severity: "HIGH", status: "OPEN" }),
      riskEvent({ id: "risk_2", severity: "MEDIUM", status: "ACKNOWLEDGED" }),
      riskEvent({ id: "risk_3", severity: "LOW", status: "RESOLVED" }),
    ]);

    assert.equal(summary.total, 3);
    assert.deepEqual(summary.byStatus, {
      OPEN: 1,
      ACKNOWLEDGED: 1,
      RESOLVED: 1,
    });
    assert.deepEqual(summary.bySeverity, {
      INFO: 0,
      LOW: 1,
      MEDIUM: 1,
      HIGH: 1,
    });
    assert.equal(summary.highOpenCount, 1);
    assert.equal(summary.requiresOperatorReview, true);
  });

  it("keeps acknowledged high-risk cases in operator-review stop state", () => {
    const summary = summarizeRiskCases([
      riskEvent({ severity: "HIGH", status: "ACKNOWLEDGED" }),
      riskEvent({ id: "risk_2", severity: "MEDIUM", status: "RESOLVED" }),
    ]);

    assert.equal(summary.highOpenCount, 1);
    assert.equal(summary.requiresOperatorReview, true);
  });

  it("keeps reopened high-risk cases in operator-review stop state", () => {
    const reopened = transitionRiskCase({
      event: riskEvent({ severity: "HIGH", status: "RESOLVED" }),
      action: "reopen",
      actorId: "operator_1",
      note: "Reopened during release review.",
    });

    const summary = summarizeRiskCases([
      riskEvent({ severity: "HIGH", status: reopened.nextStatus }),
    ]);

    assert.equal(summary.highOpenCount, 1);
    assert.equal(summary.requiresOperatorReview, true);
  });

  it("does not require operator review when all cases are resolved", () => {
    const summary = summarizeRiskCases([
      riskEvent({ severity: "HIGH", status: "RESOLVED" }),
      riskEvent({ id: "risk_2", severity: "MEDIUM", status: "RESOLVED" }),
    ]);

    assert.equal(summary.highOpenCount, 0);
    assert.equal(summary.requiresOperatorReview, false);
  });
});

function riskEvent(overrides: Partial<RiskCaseEvent> = {}): RiskCaseEvent {
  return {
    id: "risk_1",
    companyId: "company_1",
    severity: "HIGH",
    status: "OPEN",
    code: "SOURCE_WALLET_UNKNOWN",
    message: "Source wallet must be known before mint eligibility.",
    entityType: "Deposit",
    entityId: "deposit_1",
    ...overrides,
  };
}
