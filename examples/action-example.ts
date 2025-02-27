import { a, Capability } from "pepr"
import { controls } from "./register"

export const policies = new Capability({
  name: "uds-core-policies",
  description: "Example of using the controls framework in a policy",
})

export const { When } = policies

When(a.Pod)
  .IsCreatedOrUpdated()
  // ************************ Commented out to avoid errors ************************

  // // Method 1: Using a Control object with justification and coverage
  // .RelatedTo(
  //   controls.ServiceMesh,
  //   "Implements service mesh for zero-trust networking",
  //   75,
  // )

  // // Method 2: Using a Control object with just justification (defaults to 100% coverage)
  // .RelatedTo(controls.Storage, "more words ands stuff")

  // // Method 3: Using a Control object with justification and coverage and source
  // .RelatedTo(
  //   controls.SecurityContext,
  //   "another implementation of the control",
  //   50,
  //   "generic-example.ts:20",
  // )

  // // Method 4: Using a ControlImplementation object directly
  // .RelatedTo({
  //   controlId: controls.SecurityContext.id,
  //   coverage: 50,
  //   justification: "Direct implementation using ControlImplementation object",
  //   source: "generic-example.ts:28",
  // })

  .Validate(request => {
    // Implementation details...
    return request.Approve()
  })
