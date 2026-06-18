export type RiskCaseSeverity = "INFO" | "LOW" | "MEDIUM" | "HIGH";
export type RiskCaseStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";
export type RiskCaseAction = "acknowledge" | "resolve" | "reopen";

export type RiskCaseEvent = {
  id: string;
  companyId?: string;
  severity: RiskCaseSeverity;
  status: RiskCaseStatus;
  code: string;
  message: string;
  entityType?: string;
  entityId?: string;
};

export type RiskCaseTransitionInput = {
  event: RiskCaseEvent;
  action: RiskCaseAction;
  actorId: string;
  note?: string;
  now?: Date;
};

export type RiskCaseTransitionResult = {
  nextStatus: RiskCaseStatus;
  auditAction: "risk.case.acknowledged" | "risk.case.resolved" | "risk.case.reopened";
  auditMetadata: {
    previousStatus: RiskCaseStatus;
    nextStatus: RiskCaseStatus;
    actorId: string;
    note?: string;
    transitionedAt: string;
  };
};

export type RiskCaseSummary = {
  total: number;
  byStatus: Record<RiskCaseStatus, number>;
  bySeverity: Record<RiskCaseSeverity, number>;
  highOpenCount: number;
  requiresOperatorReview: boolean;
};

const TRANSITIONS: Record<RiskCaseStatus, Partial<Record<RiskCaseAction, RiskCaseStatus>>> = {
  OPEN: {
    acknowledge: "ACKNOWLEDGED",
    resolve: "RESOLVED",
  },
  ACKNOWLEDGED: {
    resolve: "RESOLVED",
    reopen: "OPEN",
  },
  RESOLVED: {
    reopen: "OPEN",
  },
};

export function transitionRiskCase({
  event,
  action,
  actorId,
  note,
  now = new Date(),
}: RiskCaseTransitionInput): RiskCaseTransitionResult {
  if (actorId.trim() === "") {
    throw new Error("actorId is required for risk case transitions.");
  }

  const nextStatus = TRANSITIONS[event.status][action];

  if (nextStatus === undefined) {
    throw new Error(`Cannot ${action} risk case from ${event.status}.`);
  }

  return {
    nextStatus,
    auditAction: toAuditAction(action),
    auditMetadata: {
      previousStatus: event.status,
      nextStatus,
      actorId,
      note,
      transitionedAt: now.toISOString(),
    },
  };
}

export function summarizeRiskCases(events: RiskCaseEvent[]): RiskCaseSummary {
  const byStatus: Record<RiskCaseStatus, number> = {
    OPEN: 0,
    ACKNOWLEDGED: 0,
    RESOLVED: 0,
  };
  const bySeverity: Record<RiskCaseSeverity, number> = {
    INFO: 0,
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
  };

  for (const event of events) {
    byStatus[event.status] += 1;
    bySeverity[event.severity] += 1;
  }

  const highOpenCount = events.filter(
    (event) => event.severity === "HIGH" && event.status !== "RESOLVED",
  ).length;

  return {
    total: events.length,
    byStatus,
    bySeverity,
    highOpenCount,
    requiresOperatorReview: highOpenCount > 0 || byStatus.OPEN > 0,
  };
}

function toAuditAction(action: RiskCaseAction): RiskCaseTransitionResult["auditAction"] {
  if (action === "acknowledge") {
    return "risk.case.acknowledged";
  }

  if (action === "resolve") {
    return "risk.case.resolved";
  }

  return "risk.case.reopened";
}
