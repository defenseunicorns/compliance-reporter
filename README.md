# Compliance Reporter

Usage Example:

```ts
import {
  mapControl,
  registerControls,
  generateComplianceReport,
  findComplianceGaps,
} from "compliance-reporter"

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

mapControl(controls.NetworkPolicy, "Implementation details", 75)
const report = generateComplianceReport()
const gaps = findComplianceGaps()

// Print the report
console.log("Report: ")
console.log(JSON.stringify(report, null, 2))

// Pretty print the matrix for debugging
console.log("Matrix: ")
console.log(JSON.stringify(gaps, null, 2))
```
