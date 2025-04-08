import { Control, ControlImplementation } from "./types"
import {
  registerControls,
  mapControl,
  generateComplianceReport,
  findComplianceGaps,
  __test__,
} from "./controls"

// Mock extractCallerInfo for consistent test results
jest.spyOn(__test__, "extractCallerInfo").mockImplementation(() => ({
  file: expect.any(String),
  line: expect.any(Number),
}))

describe("Controls Module", () => {
    const defaultControl1 ={
      id: "SC-1",
      description: "Security Context Control",
      remarks: "Security Context Control remarks 1", 
    }
    const defaultControl2 = 
    {
      id: "SC-2",
      description: "Storage Control",
      remarks: "Storage Control remarks 2",
    }
  const defaultControls = [
  defaultControl1,
  defaultControl2
  ]
  // Reset state before each test
  beforeEach(() => {
    // Reset the module state
    __test__.resetState()
  })

  describe("Control Registration", () => {
    it("registers multiple controls as an object", () => {
      // Arrange
      const controlsObj = {
        SecurityContext: defaultControl1,
        Storage: defaultControl2
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

    it("rejects registration when control IDs are duplicated within the same input", () => {
      // Arrange
      const duplicateControls = {
        SecurityContext1: defaultControl1,
        SecurityContext2: defaultControl1
      }

      // Act & Assert
      expect(() => registerControls(duplicateControls)).toThrow(
        "Control ID SC-1 is already registered",
      )
    })

    it("rejects registration when a control ID conflicts with an existing one", () => {
      // Act & Assert
      registerControls(defaultControl1)
      expect(() => registerControls(defaultControl1)).toThrow(
        "Control ID SC-1 is already registered",
      )
    })

    it("registers a single control as an object", () => {
      // Act
      const result = registerControls(defaultControl1)

      // Assert
      expect(__test__.registeredControls).toHaveLength(1)
      expect(__test__.registeredControls[0].id).toBe("SC-1")

      // Check that the returned object has the ID as key
      expect(result).toHaveProperty("SC-1")
      expect(result["SC-1"].id).toBe("SC-1")
    })

    it("registers multiple controls as an array", () => {
      // Act
      const result = registerControls(defaultControls)

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

  describe("Control Implementation Mapping", () => {
    it("maps an implementation with specified coverage", () => {
      // Arrange
      const control: Control = defaultControl1
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

    it("accepts a custom source location for the implementation", () => {
      // Arrange
      const control: Control = defaultControl1
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation details", 75, "custom-file.ts:123")

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].source).toBe(
        "custom-file.ts:123",
      )
    })

    it("defaults to 100% coverage when no coverage percentage is specified", () => {
      // Arrange
      const control: Control = defaultControl1
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation details")

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].coverage).toBe(100)
    })

    it("rejects mapping when control ID is not registered", () => {
      // Arrange
      const unregisteredControl: Control = {
        id: "UR-1",
        description: "Unregistered Control",
        remarks: "Unregistered Control remarks",
      }

      // Act & Assert
      expect(() =>
        mapControl(unregisteredControl, "Implementation details"),
      ).toThrow("Control ID UR-1 is not registered")
      expect(__test__.controlImplementations).toHaveLength(0)
    })

    it("accumulates coverage from multiple implementations", () => {
      // Arrange
      const control: Control = defaultControl1
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation 1", 40)
      mapControl(control, "Implementation 2", 30)

      // Assert
      const report = generateComplianceReport()
      expect(report["SC-1"].coveragePercent).toBe(70) // 40 + 30
      expect(report["SC-1"].implementations).toHaveLength(2)
    })

    it("caps total coverage at 100%", () => {
      // Arrange
      const control: Control = defaultControl1
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation 1", 60)
      mapControl(control, "Implementation 2", 50)

      // Assert
      const report = generateComplianceReport()
      expect(report["SC-1"].coveragePercent).toBe(100) // 60 + 50 = 110, but capped at 100
    })

    it("accepts a ControlImplementation object directly", () => {
      // Arrange
      const control: Control = defaultControl1
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

    it("rejects ControlImplementations with unregistered control ID", () => {
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

    it("uses a default justification when none is provided", () => {
      // Arrange
      const control: Control = defaultControl1
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

  describe("Compliance Reporting", () => {
    it("returns an empty report when no controls exist", () => {
      // Act
      const report = generateComplianceReport()

      // Assert
      expect(report).toEqual({})
    })

    it("includes all registered controls with their properties", () => {
      // Arrange
      __test__.registeredControls.push(
        defaultControl1,
        {
          id: "NP-1",
          description: "Network Policy Control",
          remarks: "Network Policy Control remarks",
        },
      )

      // Act
      const report = generateComplianceReport()

      // Assert
      expect(Object.keys(report)).toHaveLength(2)
      expect(report["SC-1"]).toBeDefined()
      expect(report["NP-1"]).toBeDefined()
    })

    it("shows zero coverage for controls without implementations", () => {
      // Arrange
      __test__.registeredControls.push(defaultControl1)

      // Act
      const report = generateComplianceReport()

      // Assert
      expect(report["SC-1"].coveragePercent).toBe(0)
      expect(report["SC-1"].implementations).toEqual([])
    })

    it("includes all control metadata in the report", () => {
      // Arrange
      __test__.registeredControls.push({
        id: "SC-1",
        description: "Security Context Control",
        remarks: "Security Context Control remarks",
        framework: "NIST",
        severity: "High",
      })

      // Act
      const report = generateComplianceReport()

      // Assert
      expect(report["SC-1"].id).toBe("SC-1")
      expect(report["SC-1"].description).toBe("Security Context Control")
      expect(report["SC-1"].remarks).toBe("Security Context Control remarks")
      expect(report["SC-1"].framework).toBe("NIST")
      expect(report["SC-1"].severity).toBe("High")
    })
  })

  describe("Gap Analysis", () => {
    it("returns an empty array when all controls are implemented", () => {
      // Arrange
      const control: Control = defaultControl1
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

    it("identifies controls with incomplete coverage", () => {
      // Arrange
      __test__.registeredControls.push(
        defaultControl1,
        {
          id: "NP-1",
          description: "Network Policy Control",
          remarks: "Network Policy Control remarks",
        },
        {
          id: "PS-1",
          description: "Pod Security Control",
          remarks: "Pod Security Control remarks",
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

    it("includes coverage percentage in identified gaps", () => {
      // Arrange
      __test__.registeredControls.push({
        id: "NP-1",
        description: "Network Policy Control",
        remarks: "Network Policy Control remarks",
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
