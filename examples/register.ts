import { registerControls } from "../controls"

/**
 * Control definitions
 *
 * Each control must have an ID and description
 * The key is an internal identifier used to reference the control
 * in code and configuration
 */
export const controls = registerControls({
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
})
