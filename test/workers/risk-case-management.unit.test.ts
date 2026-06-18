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

  it("resolves acknowledged and open risk cases", () => {
    assert.equal(
      transitionRiskCase({
        event: riskEvent({ status: "ACKNOWLEDGED" }),
        action: "resolve",
        actorId: "operator_1",
      }).nextStatus,
      "RESOLVED",
    );

    assert.equal(
      transitionRiskCase({
        event: riskEvent({ status: "OPEN" }),
        action: "resolve",
        actorId: "operator_1",
      }).nextStatus,
      "RESOLVED",
    );
  });

  it("reopens acknowledged or resolved risk cases", () => {
    assert.equal(
      transitionRiskCase({
        event: riskEvent({ status: "ACKNOWLEDGED" }),
        action: "reopen",
        actorId: "operator_1",
      }).nextStatus,
      "OPEN",
    );

    assert.equal(
      transitionRiskCase({
        event: riskEvent({ status: "RESOLVED" }),
        action: "reopen",
        actorId: "operator_1",
      }).nextStatus,
      "OPEN",
    );
  });

  it("rejects invalid transitions and missing actors", () => {
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
  it("summarizes case counts and flags unresolved high-risk cases", () => {
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
