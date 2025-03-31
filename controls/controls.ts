import { ComplianceReport, Control, ControlImplementation } from "./types"

// Track all registered controls
const registeredControls: Control[] = []

// Track all registered control implementations
const controlImplementations: ControlImplementation[] = []

// Export for testing purposes
export const __test__ = {
  registeredControls,
  controlImplementations,
  resetState: () => {
    registeredControls.length = 0
    controlImplementations.length = 0
  },
  extractCallerInfo,
}

/**
 * Register one or more compliance controls and return a typed object
 *
 * @param controls Control or array of controls to register
 * @returns A typed object with control IDs as keys
 */
export function registerControls<T extends Record<string, Control>>(
  controls: T,
): T

export function registerControls(controls: Control): Record<string, Control>

export function registerControls(controls: Control[]): Record<string, Control>

export function registerControls(
  controls: Control | Control[] | Record<string, Control>,
): Record<string, Control> {
  // Convert to array if a single control is passed
  const controlsArray: Control[] = Array.isArray(controls)
    ? controls
    : "id" in controls
      ? [controls as Control]
      : Object.values(controls)

  // Validate and register each control
  for (const control of controlsArray) {
    if (!control.id) {
      throw new Error("Control must have an ID")
    }

    if (registeredControls.some(c => c.id === control.id)) {
      throw new Error(`Control ID ${control.id} is already registered`)
    }

    registeredControls.push(control)
  }

  // If the input was an object, return it as is for type preservation
  if (!Array.isArray(controls) && !("id" in controls)) {
    return controls as Record<string, Control>
  }

  // Otherwise, create a new object from the array
  const result: Record<string, Control> = {}
  for (const control of controlsArray) {
    // Use the ID as the key if we don't have a better name
    result[control.id] = control
  }

  return result
}

/**
 * Maps an implementation to a specific control.
 *
 * This function can be called in two ways:
 * 1. With a Control object, justification, coverage, and optional source
 * 2. With a ControlImplementation object directly
 *
 * @example
 * ```typescript
 * // Method 1: Using a Control object
 * mapControl(controls.SecurityContext, "Prevents privilege escalation", 60)
 *
 * // Method 2: Using a ControlImplementation object directly
 * mapControl({
 *   controlId: "SC-1",
 *   coverage: 75,
 *   justification: "Direct implementation",
 *   source: "my-file.ts:42"
 * })
 * ```
 *
 * @param controlOrImpl Control object or ControlImplementation object
 * @param justification Description of how this code implements the control (only used with Control)
 * @param coverage Percentage of the control this implementation covers (0-100) (only used with Control)
 * @param source Optional source location override (only used with Control)
 */
export function mapControl(
  controlOrImpl: Control | ControlImplementation,
  justification?: string,
  coverage: number = 100,
  source?: string,
) {
  // Determine if we're dealing with a Control or a ControlImplementation
  if ("controlId" in controlOrImpl) {
    // It's already a ControlImplementation
    const impl = controlOrImpl as ControlImplementation

    // Ensure the control ID exists
    if (!registeredControls.some(c => c.id === impl.controlId)) {
      throw new Error(`Control ID ${impl.controlId} is not registered`)
    }

    // Add the implementation directly
    controlImplementations.push(impl)
    return
  }

  // It's a Control object
  const control = controlOrImpl

  // Ensure the control ID exists
  if (!registeredControls.some(c => c.id === control.id)) {
    throw new Error(`Control ID ${control.id} is not registered`)
  }

  // Auto-detect source if not provided
  let sourceString = source
  if (!sourceString) {
    // Capture caller information when possible
    const stack = new Error().stack || ""
    const callerInfo = extractCallerInfo(stack)
    if (callerInfo.file) {
      sourceString = callerInfo.line
        ? `${callerInfo.file}:${callerInfo.line}`
        : callerInfo.file
    }
  }

  controlImplementations.push({
    controlId: control.id,
    coverage,
    justification: justification || "No justification provided",
    source: sourceString,
  })
}

/**
 * Generates a compliance report of all controls and their implementation status
 *
 * @returns A compliance report showing control coverage and implementation details
 */
export function generateComplianceReport(): ComplianceReport {
  // Initialize the compliance matrix with all controls at 0% coverage
  const report: ComplianceReport = {}

  // Add all controls to the matrix
  for (const control of registeredControls) {
    report[control.id] = {
      ...control,
      coveragePercent: 0,
      implementations: [],
    }
  }

  // Process each implementation
  for (const impl of controlImplementations) {
    report[impl.controlId].coveragePercent += impl.coverage
    report[impl.controlId].implementations.push(impl)
  }

  // Cap coverage at 100%
  for (const controlId in report) {
    if (report[controlId].coveragePercent > 100) {
      report[controlId].coveragePercent = 100
    }
  }

  return report
}

/**
 * Finds gaps in compliance coverage
 *
 * @returns List of controls with coverage below 100%
 */
export function findComplianceGaps() {
  const report = generateComplianceReport()

  // Return an array of controls with coverage below 100%
  return Object.values(report).filter(control => control.coveragePercent < 100)
}

/**
 * Extract caller information from the stack trace
 *
 * @param stack Stack trace string
 * @returns Object with file and line information
 */
export function extractCallerInfo(stack: string) {
  const result = {
    file: undefined,
    line: undefined,
  }

  try {
    const stackLines = stack.split("\n")
    // Skip Error and internal functions (mapControl)
    // We want to find the actual caller of our API
    if (stackLines.length > 2) {
      // Find the first line that's not from our own module
      for (let i = 1; i < stackLines.length; i++) {
        const line = stackLines[i].trim()
        // Skip our own module calls
        if (line.includes("controls.ts")) {
          continue
        }

        // Extract file and line information
        const match = line.match(/\(([^:)]+)(?::(\d+))?/)
        if (match) {
          const lineNumber = match[2] ? parseInt(match[2], 10) : undefined
          result.file = match[1]
          result.line = lineNumber

          return result
        }
      }
    }

    // Fallback to the first non-Error line if we couldn't find an external caller
    if (stackLines.length > 1) {
      const callerLine = stackLines[1].trim()
      const match = callerLine.match(/\(([^:)]+)(?::(\d+))?/)
      if (match) {
        const lineNumber = match[2] ? parseInt(match[2], 10) : undefined
        result.file = match[1]
        result.line = lineNumber
      }
    }
  } catch {
    // Do nothing
  }

  return result
}
