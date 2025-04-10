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
    remarks: "Prevents Pod Escalation remarks",
  },
  Storage: {
    id: "AC-2",
    description: "Prevents Volume Escalation",
    remarks: "Prevents Volume Escalation remarks"
  },

  ServiceMesh: {
    id: "NIST-800-53-5",
    description: "Service Mesh",
    remarks: "Service Mesh remarks"
  },

  NetworkPolicy: {
    id: "NIST-800-53-6",
    description: "Network Policy",
    remarks: "Network Policy remarks"
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