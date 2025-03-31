import { Control, ControlImplementation } from "./types";

describe("Types Module", () => {
  describe("Control Type", () => {
    test("should allow creating a valid Control object", () => {
      // Arrange & Act
      const control: Control = {
        id: "TEST-1",
        description: "Test Control",
        framework: "Test Framework",
        severity: "High",
      };

      // Assert
      expect(control.id).toBe("TEST-1");
      expect(control.description).toBe("Test Control");
      expect(control.framework).toBe("Test Framework");
      expect(control.severity).toBe("High");
    });

    test("should require id and description properties", () => {
      // TypeScript compilation would fail if these were missing
      // This is a runtime test to verify the shape
      const control: Control = {
        id: "TEST-1",
        description: "Test Control",
      };

      expect(control.id).toBeDefined();
      expect(control.description).toBeDefined();
    });
  });

  describe("ControlImplementation Type", () => {
    test("should allow creating a valid ControlImplementation object", () => {
      // Arrange & Act
      const implementation: ControlImplementation = {
        controlId: "TEST-1",
        coverage: 75,
        justification: "Test implementation",
        source: "test-file.ts:42",
      };

      // Assert
      expect(implementation.controlId).toBe("TEST-1");
      expect(implementation.coverage).toBe(75);
      expect(implementation.justification).toBe("Test implementation");
      expect(implementation.source).toBe("test-file.ts:42");
    });

    test("should allow source to be optional", () => {
      // Arrange & Act
      const implementation: ControlImplementation = {
        controlId: "TEST-1",
        coverage: 75,
        justification: "Test implementation",
      };

      // Assert
      expect(implementation.controlId).toBe("TEST-1");
      expect(implementation.coverage).toBe(75);
      expect(implementation.justification).toBe("Test implementation");
      expect(implementation.source).toBeUndefined();
    });

    test("should include source information when provided", () => {
      // Arrange & Act
      const implementation: ControlImplementation = {
        controlId: "SC-1",
        coverage: 75,
        justification: "Test implementation",
        source: "test-file.ts:42",
      };

      // Assert
      expect(implementation.controlId).toBe("SC-1");
      expect(implementation.coverage).toBe(75);
      expect(implementation.justification).toBe("Test implementation");
      expect(implementation.source).toBe("test-file.ts:42");
    });
  });
});
