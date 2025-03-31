/**
 * Base control definition
 * Represents a compliance control requirement (e.g., from NIST or other framework)
 */
export type Control = {
  /** Identifier in the compliance framework (e.g., "AC-2", "NIST-800-53" ) */
  id: string

  /** Human-readable description of what this control addresses */
  description: string

  /** Optional fields for additional metadata */
  [key: string]: unknown
}

/**
 * Represents a single implementation of a compliance control
 * Maps code to a specific compliance requirement
 */
export interface ControlImplementation {
  /**  ID of the control being implemented */
  controlId: string

  /** How much this implementation contributes to compliance (0-100) */
  coverage: number

  /** Why/how this code implements the control */
  justification: string

  /** Source information (usually in the format "file:line") */
  source?: string
}

/** Aggregated report of a control's implementation status */
type ControlComplianceReport = Control & {
  /** Overall implementation percentage across all implementations */
  coveragePercent: number

  /** List of all implementations of this control */
  implementations: ControlImplementation[]
}

/**
 * Complete compliance matrix mapping each control to its implementation status
 */
export type ComplianceReport = Record<string, ControlComplianceReport>
