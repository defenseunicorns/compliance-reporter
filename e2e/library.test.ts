import { describe, it, expect } from "@jest/globals";
import {
  findComplianceGaps,
  generateComplianceReport,
  registerControls,
} from "compliance-reporter";
describe("compliance-reporter", () => {
  const controls = registerControls({
    /** Optional jsdoc will show in IDE intellisense */
    SecurityContext: {
      id: "AC-1",
      description: "Prevents Pod Escalation",
    },

    Storage: {
      id: "AC-2",
      description: "Prevents Volume Escalation",
    },

    ServiceMesh: {
      id: "NIST-800-53-5",
      description: "Service Mesh",
    },

    NetworkPolicy: {
      id: "NIST-800-53-6",
      description: "Network Policy",
    },
  });
  const report = generateComplianceReport();
  const gaps = findComplianceGaps();

  it("should register controls", async () => {
    expect(controls).toStrictEqual({
      SecurityContext: {
        id: "AC-1",
        description: "Prevents Pod Escalation",
      },
      Storage: {
        id: "AC-2",
        description: "Prevents Volume Escalation",
      },
      ServiceMesh: {
        id: "NIST-800-53-5",
        description: "Service Mesh",
      },
      NetworkPolicy: {
        id: "NIST-800-53-6",
        description: "Network Policy",
      },
    });
  });

  it("should generate a compliance report", () => {
    expect(report).toStrictEqual({
      "AC-1": {
        id: "AC-1",
        description: "Prevents Pod Escalation",
        coveragePercent: 0,
        implementations: [],
      },
      "AC-2": {
        id: "AC-2",
        description: "Prevents Volume Escalation",
        coveragePercent: 0,
        implementations: [],
      },
      "NIST-800-53-5": {
        id: "NIST-800-53-5",
        description: "Service Mesh",
        coveragePercent: 0,
        implementations: [],
      },
      "NIST-800-53-6": {
        id: "NIST-800-53-6",
        description: "Network Policy",
        coveragePercent: 0,
        implementations: [],
      },
    });
  });
  it("should find compliance gaps", () => {
    expect(gaps).toStrictEqual([
      {
        id: "AC-1",
        description: "Prevents Pod Escalation",
        coveragePercent: 0,
        implementations: [],
      },
      {
        id: "AC-2",
        description: "Prevents Volume Escalation",
        coveragePercent: 0,
        implementations: [],
      },
      {
        id: "NIST-800-53-5",
        description: "Service Mesh",
        coveragePercent: 0,
        implementations: [],
      },
      {
        id: "NIST-800-53-6",
        description: "Network Policy",
        coveragePercent: 0,
        implementations: [],
      },
    ]);
  });
});
