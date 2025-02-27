import {
  findComplianceGaps,
  generateComplianceReport,
  mapControl,
} from "../controls"
import { controls } from "./register"

// Method 1: Using a Control object with justification and coverage
mapControl(
  controls.ServiceMesh,
  "Implements service mesh for zero-trust networking",
  75,
)

// Method 2: Using a Control object with just justification (defaults to 100% coverage)
mapControl(controls.Storage, "more words ands stuff")

// Method 3: Using a Control object with justification and coverage and source
mapControl(
  controls.SecurityContext,
  "another implementation of the control",
  50,
  "generic-example.ts:20",
)

// Method 4: Using a ControlImplementation object directly
mapControl({
  controlId: controls.SecurityContext.id,
  coverage: 50,
  justification: "Direct implementation using ControlImplementation object",
  source: "generic-example.ts:28",
})

const report = generateComplianceReport()
const gaps = findComplianceGaps()

// Pretty print the matrix for debugging
console.log(JSON.stringify(gaps, null, 2))
