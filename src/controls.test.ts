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
  // Test data generators
  const createControl = (id: string, prefix = ""): Control => ({
    id,
    description: `${prefix}${id} Control`,
    remarks: `${prefix}${id} Control remarks`,
  })

  const createControlImplementation = (
    controlId: string,
    coverage = 100,
    source = "test-file.ts:42"
  ): ControlImplementation => ({
    controlId,
    coverage,
    justification: `Implementation for ${controlId}`,
    source,
  })

  beforeEach(() => {
    __test__.resetState()
  })

  describe("Control Registration", () => {
    it("registers multiple controls as an object", () => {
      // Arrange
      const controlsObj = {
        SecurityContext: createControl("SC-1", "Security Context "),
        Storage: createControl("SC-2", "Storage ")
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
      const control = createControl("SC-1")
      const duplicateControls = {
        SecurityContext1: control,
        SecurityContext2: control
      }

      // Act & Assert
      expect(() => registerControls(duplicateControls)).toThrow(
        "Control ID SC-1 is already registered"
      )
    })

    it("rejects registration when a control ID conflicts with an existing one", () => {
      // Arrange
      const control = createControl("SC-1")
      
      // Act & Assert
      registerControls(control)
      expect(() => registerControls(control)).toThrow(
        "Control ID SC-1 is already registered"
      )
    })

    it("registers a single control as an object", () => {
      // Arrange
      const control = createControl("SC-1")
      
      // Act
      const result = registerControls(control)

      // Assert
      expect(__test__.registeredControls).toHaveLength(1)
      expect(__test__.registeredControls[0].id).toBe("SC-1")
      expect(result).toHaveProperty("SC-1")
      expect(result["SC-1"].id).toBe("SC-1")
    })

    it("registers multiple controls as an array", () => {
      // Arrange
      const controls = [
        createControl("SC-1"),
        createControl("SC-2")
      ]

      // Act
      const result = registerControls(controls)

      // Assert
      expect(__test__.registeredControls).toHaveLength(2)
      expect(__test__.registeredControls[0].id).toBe("SC-1")
      expect(__test__.registeredControls[1].id).toBe("SC-2")
      expect(result).toHaveProperty("SC-1")
      expect(result).toHaveProperty("SC-2")
      expect(result["SC-1"].id).toBe("SC-1")
      expect(result["SC-2"].id).toBe("SC-2")
    })
  })

  describe("Control Implementation Mapping", () => {
    it("maps an implementation with specified coverage", () => {
      // Arrange
      const control = createControl("SC-1")
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation details", 75)

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].controlId).toBe("SC-1")
      expect(__test__.controlImplementations[0].coverage).toBe(75)
      expect(__test__.controlImplementations[0].justification).toBe(
        "Implementation details"
      )
      expect(__test__.controlImplementations[0].source).toMatch(/^.+:\d+$/)
    })

    it("accepts a custom source location for the implementation", () => {
      // Arrange
      const control = createControl("SC-1")
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation details", 75, "custom-file.ts:123")

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].source).toBe("custom-file.ts:123")
    })

    it("defaults to 100% coverage when no coverage percentage is specified", () => {
      // Arrange
      const control = createControl("SC-1")
      __test__.registeredControls.push(control)

      // Act
      mapControl(control, "Implementation details")

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].coverage).toBe(100)
    })

    it("rejects mapping when control ID is not registered", () => {
      // Arrange
      const unregisteredControl = createControl("UR-1")

      // Act & Assert
      expect(() =>
        mapControl(unregisteredControl, "Implementation details")
      ).toThrow("Control ID UR-1 is not registered")
      expect(__test__.controlImplementations).toHaveLength(0)
    })

    it("accumulates coverage from multiple implementations", () => {
      // Arrange
      const control = createControl("SC-1")
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
      const control = createControl("SC-1")
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
      const control = createControl("SC-1")
      __test__.registeredControls.push(control)
      const impl = createControlImplementation("SC-1", 75)

      // Act
      mapControl(impl)

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0]).toEqual(impl)
    })

    it("rejects ControlImplementations with unregistered control ID", () => {
      // Arrange
      const impl = createControlImplementation("UR-1")

      // Act & Assert
      expect(() => mapControl(impl)).toThrow(
        "Control ID UR-1 is not registered"
      )
      expect(__test__.controlImplementations).toHaveLength(0)
    })

    it("uses a default justification when none is provided", () => {
      // Arrange
      const control = createControl("SC-1")
      __test__.registeredControls.push(control)

      // Act
      mapControl(control)

      // Assert
      expect(__test__.controlImplementations).toHaveLength(1)
      expect(__test__.controlImplementations[0].justification).toBe(
        "No justification provided"
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
        createControl("SC-1"),
        createControl("NP-1", "Network Policy ")
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
      __test__.registeredControls.push(createControl("SC-1"))

      // Act
      const report = generateComplianceReport()

      // Assert
      expect(report["SC-1"].coveragePercent).toBe(0)
      expect(report["SC-1"].implementations).toEqual([])
    })

    it("includes all control metadata in the report", () => {
      // Arrange
      const control = {
        ...createControl("SC-1"),
        framework: "NIST",
        severity: "High"
      }
      __test__.registeredControls.push(control)

      // Act
      const report = generateComplianceReport()

      // Assert
      expect(report["SC-1"].id).toBe("SC-1")
      expect(report["SC-1"].description).toBe("SC-1 Control")
      expect(report["SC-1"].remarks).toBe("SC-1 Control remarks")
      expect(report["SC-1"].framework).toBe("NIST")
      expect(report["SC-1"].severity).toBe("High")
    })
  })

  describe("Gap Analysis", () => {
    it("returns an empty array when all controls are implemented", () => {
      // Arrange
      const control = createControl("SC-1")
      __test__.registeredControls.push(control)
      __test__.controlImplementations.push(createControlImplementation("SC-1"))

      // Act
      const gaps = findComplianceGaps()

      // Assert
      expect(gaps).toEqual([])
    })

    it("identifies controls with incomplete coverage", () => {
      // Arrange
      __test__.registeredControls.push(
        createControl("SC-1"),
        createControl("NP-1", "Network Policy "),
        createControl("PS-1", "Pod Security ")
      )

      // Fully implement one control
      __test__.controlImplementations.push(createControlImplementation("SC-1"))

      // Partially implement another
      __test__.controlImplementations.push(createControlImplementation("NP-1", 50))

      // Leave one with no implementation (0%)

      // Act
      const gaps = findComplianceGaps()

      // Assert
      expect(gaps).toHaveLength(2)
      expect(gaps.map(g => g.id).sort()).toEqual(["NP-1", "PS-1"].sort())
    })

    it("includes coverage percentage in identified gaps", () => {
      // Arrange
      __test__.registeredControls.push(createControl("NP-1", "Network Policy "))
      __test__.controlImplementations.push(createControlImplementation("NP-1", 75))

      // Act
      const gaps = findComplianceGaps()

      // Assert
      expect(gaps).toHaveLength(1)
      expect(gaps[0].id).toBe("NP-1")
      expect(gaps[0].coveragePercent).toBe(75)
    })
  })
})
