import { Control, ControlImplementation } from "../controls/types"
import {
  registerControls,
  mapControl,
  generateComplianceReport,
  findComplianceGaps,
  __test__,
} from "../controls/controls"

// Mock extractCallerInfo for consistent test results
jest.spyOn(__test__, "extractCallerInfo").mockImplementation(() => ({
  file: expect.any(String),
  line: expect.any(Number),
}))

describe("Controls Module", () => {
  // Reset state before each test
  beforeEach(() => {
    // Reset the module state
    __test__.resetState()
  })

  describe("registerControls", () => {
    test("should register controls", () => {
      // Arrange
      const controlsObj = {
        SecurityContext: {
          id: "SC-1",
          description: "Security Context Control",
        },
        Storage: {
          id: "SC-2",
          description: "Storage Control",
        },
      }

      // Act
      const result = registerControls(controlsObj)

      // Assert
      expect(__test__.registeredControls).toHaveLength(2)
      expect(__test__.registeredControls[0].id).toBe("SC-1")
      expect(__test__.registeredControls[1].id).toBe("SC-2")

      // Check that the returned object has the same keys
      expect(result).toHaveProperty("SecurityContext")
      expect(result).toHaveProperty("Storage")
      expect(result.SecurityContext.id).toBe("SC-1")
      expect(result.Storage.id).toBe("SC-2")
    })

    test("should throw error for duplicate control IDs within provided controls", () => {
      // Arrange
      const duplicateControls = {
        SecurityContext1: {
          id: "SC-1",
          description: "Security Context Control 1",
        },
        SecurityContext2: {
          id: "SC-1", // Duplicate ID
          description: "Security Context Control 2",
        },
      }

      // Act & Assert
      expect(() => registerControls(duplicateControls)).toThrow(
        "Control ID SC-1 is already registered",
      )
    })

    test("should throw error when registering a control with an ID that already exists", () => {
      // Arrange
      const control1 = {
        id: "SC-1",
        description: "Security Context Control",
      }
      const control2 = {
        id: "SC-1", // Same ID
        description: "Another Security Context Control",
      }

      // Act & Assert
      registerControls(control1)
      expect(() => registerControls(control2)).toThrow(
        "Control ID SC-1 is already registered",
      )
    })

    test("should register a single control", () => {
      // Arrange
      const control = {
        id: "SC-1",
        description: "Security Context Control",
      }

      // Act
      const result = registerControls(control)

      // Assert
      expect(__test__.registeredControls).toHaveLength(1)
      expect(__test__.registeredControls[0].id).toBe("SC-1")

      // Check that the returned object has the ID as key
      expect(result).toHaveProperty("SC-1")
      expect(result["SC-1"].id).toBe("SC-1")
    })

    test("should register an array of controls", () => {
      // Arrange
      const controls = [
        {
          id: "SC-1",
          description: "Security Context Control",
        },
        {
          id: "SC-2",
          description: "Storage Control",
        },
      ]

      // Act
      const result = registerControls(controls)

      // Assert
      expect(__test__.registeredControls).toHaveLength(2)
      expect(__test__.registeredControls[0].id).toBe("SC-1")
      expect(__test__.registeredControls[1].id).toBe("SC-2")

      // Check that the returned object has the IDs as keys
      expect(result).toHaveProperty("SC-1")
      expect(result).toHaveProperty("SC-2")
      expect(result["SC-1"].id).toBe("SC-1")
      expect(result["SC-2"].id).toBe("SC-2")
    })
  })

  describe("mapControl", () => {
    test("should map a control implementation successfully", () => {
      // Arrange
      const control: Control = {
        id: "SC-1",
        description: "Security Context Control",
      }
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation details", 75)

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].controlId).toBe("SC-1")
      expect(__test__.controlImplementations[0].coverage).toBe(75)
      expect(__test__.controlImplementations[0].justification).toBe(
        "Implementation details",
      )
      expect(__test__.controlImplementations[0].source).toMatch(/^.+:\d+$/)
    })

    test("should allow custom source when mapping a control", () => {
      // Arrange
      const control: Control = {
        id: "SC-1",
        description: "Security Context Control",
      }
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation details", 75, "custom-file.ts:123")

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].source).toBe(
        "custom-file.ts:123",
      )
    })

    test("should default to 100% coverage when percentage is not provided", () => {
      // Arrange
      const control: Control = {
        id: "SC-1",
        description: "Security Context Control",
      }
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation details")

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].coverage).toBe(100)
    })

    test("should throw error when mapping a control that is not registered", () => {
      // Arrange
      const unregisteredControl: Control = {
        id: "UR-1",
        description: "Unregistered Control",
      }

      // Act & Assert
      expect(() =>
        mapControl(unregisteredControl, "Implementation details"),
      ).toThrow("Control ID UR-1 is not registered")
      expect(__test__.controlImplementations).toHaveLength(0)
    })

    test("should accumulate coverage from multiple implementations", () => {
      // Arrange
      const control: Control = {
        id: "SC-1",
        description: "Security Context Control",
      }
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation 1", 40)
      mapControl(control, "Implementation 2", 30)

      // Assert
      const report = generateComplianceReport()
      expect(report["SC-1"].coveragePercent).toBe(70) // 40 + 30
      expect(report["SC-1"].implementations).toHaveLength(2)
    })

    test("should cap total coverage at 100%", () => {
      // Arrange
      const control: Control = {
        id: "SC-1",
        description: "Security Context Control",
      }
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation 1", 60)
      mapControl(control, "Implementation 2", 50)

      // Assert
      const report = generateComplianceReport()
      expect(report["SC-1"].coveragePercent).toBe(100) // 60 + 50 = 110, but capped at 100
    })

    test("should accept a ControlImplementation object directly", () => {
      // Arrange
      const control: Control = {
        id: "SC-1",
        description: "Security Context Control",
      }
      __test__.registeredControls.push(control)

      const impl: ControlImplementation = {
        controlId: "SC-1",
        coverage: 75,
        justification: "Direct implementation",
        source: "direct-impl.ts:42",
      }

      // Act
      mapControl(impl)

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0]).toEqual(impl)
    })

    test("should throw error when mapping a ControlImplementation with unregistered control ID", () => {
      // Arrange
      const impl: ControlImplementation = {
        controlId: "UR-1", // Unregistered
        coverage: 75,
        justification: "Direct implementation",
        source: "direct-impl.ts:42",
      }

      // Act & Assert
      expect(() => mapControl(impl)).toThrow(
        "Control ID UR-1 is not registered",
      )
      expect(__test__.controlImplementations).toHaveLength(0)
    })

    test("should provide default justification when none is provided", () => {
      // Arrange
      const control: Control = {
        id: "SC-1",
        description: "Security Context Control",
      }
      __test__.registeredControls.push(control)

      // Act
      mapControl(control)

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].justification).toBe(
        "No justification provided",
      )
    })
  })

  describe("generateComplianceReport", () => {
    test("should generate an empty report when no controls are registered", () => {
      // Act
      const report = generateComplianceReport()

      // Assert
      expect(report).toEqual({})
    })

    test("should include all registered controls in the report", () => {
      // Arrange
      __test__.registeredControls.push(
        {
          id: "SC-1",
          description: "Security Context Control",
        },
        {
          id: "NP-1",
          description: "Network Policy Control",
        },
      )

      // Act
      const report = generateComplianceReport()

      // Assert
      expect(Object.keys(report)).toHaveLength(2)
      expect(report["SC-1"]).toBeDefined()
      expect(report["NP-1"]).toBeDefined()
    })

    test("should show 0% coverage for controls with no implementations", () => {
      // Arrange
      __test__.registeredControls.push({
        id: "SC-1",
        description: "Security Context Control",
      })

      // Act
      const report = generateComplianceReport()

      // Assert
      expect(report["SC-1"].coveragePercent).toBe(0)
      expect(report["SC-1"].implementations).toEqual([])
    })

    test("should include all control properties in the report", () => {
      // Arrange
      __test__.registeredControls.push({
        id: "SC-1",
        description: "Security Context Control",
        framework: "NIST",
        severity: "High",
      })

      // Act
      const report = generateComplianceReport()

      // Assert
      expect(report["SC-1"].id).toBe("SC-1")
      expect(report["SC-1"].description).toBe("Security Context Control")
      expect(report["SC-1"].framework).toBe("NIST")
      expect(report["SC-1"].severity).toBe("High")
    })
  })

  describe("findComplianceGaps", () => {
    test("should return empty array when all controls are fully implemented", () => {
      // Arrange
      const control: Control = {
        id: "SC-1",
        description: "Security Context Control",
      }
      __test__.registeredControls.push(control)

      __test__.controlImplementations.push({
        controlId: "SC-1",
        coverage: 100,
        justification: "Full implementation",
        source: "test-file.ts:42",
      })

      // Act
      const gaps = findComplianceGaps()

      // Assert
      expect(gaps).toEqual([])
    })

    test("should return controls with less than 100% coverage", () => {
      // Arrange
      __test__.registeredControls.push(
        {
          id: "SC-1",
          description: "Security Context Control",
        },
        {
          id: "NP-1",
          description: "Network Policy Control",
        },
        {
          id: "PS-1",
          description: "Pod Security Control",
        },
      )

      // Fully implement one control
      __test__.controlImplementations.push({
        controlId: "SC-1",
        coverage: 100,
        justification: "Full implementation",
        source: "test-file.ts:42",
      })

      // Partially implement another
      __test__.controlImplementations.push({
        controlId: "NP-1",
        coverage: 50,
        justification: "Partial implementation",
        source: "test-file.ts:42",
      })

      // Leave one with no implementation (0%)

      // Act
      const gaps = findComplianceGaps()

      // Assert
      expect(gaps).toHaveLength(2)
      expect(gaps.map(g => g.id).sort()).toEqual(["NP-1", "PS-1"].sort())
    })

    test("should include coverage percentage in gap results", () => {
      // Arrange
      __test__.registeredControls.push({
        id: "NP-1",
        description: "Network Policy Control",
      })

      __test__.controlImplementations.push({
        controlId: "NP-1",
        coverage: 75,
        justification: "Partial implementation",
        source: "test-file.ts:42",
      })

      // Act
      const gaps = findComplianceGaps()

      // Assert
      expect(gaps).toHaveLength(1)
      expect(gaps[0].id).toBe("NP-1")
      expect(gaps[0].coveragePercent).toBe(75)
    })
  })
})
