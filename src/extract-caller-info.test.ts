import { extractCallerInfo } from "./controls"

describe("extractCallerInfo", () => {
  test("should extract file and line from stack trace", () => {
    // Arrange
    const mockStack = `Error
    at Object.<anonymous> (/Users/user/project/test.ts:10:5)
    at Module._compile (internal/modules/cjs/loader.js:1085:14)`

    // Act
    const result = extractCallerInfo(mockStack)

    // Assert
    expect(result).toEqual({
      file: "/Users/user/project/test.ts",
      line: 10,
    })
  })

  test("should skip internal module calls", () => {
    // Arrange
    const mockStack = `Error
    at mapControl (/Users/bob/code/uds/pepr-controls/controls/controls.ts:85:10)
    at Object.<anonymous> (/Users/user/project/test.ts:42:3)
    at Module._compile (internal/modules/cjs/loader.js:1085:14)`

    // Act
    const result = extractCallerInfo(mockStack)

    // Assert
    expect(result).toEqual({
      file: "/Users/user/project/test.ts",
      line: 42,
    })
  })

  test("should handle stack with only controls.ts entries", () => {
    // Arrange
    const mockStack = `Error
    at mapControl (/Users/bob/code/uds/pepr-controls/controls/controls.ts:85:10)
    at registerControl (/Users/bob/code/uds/pepr-controls/controls/controls.ts:42:3)`

    // Act
    const result = extractCallerInfo(mockStack)

    // Assert
    expect(result).toEqual({
      file: "/Users/bob/code/uds/pepr-controls/controls/controls.ts",
      line: 85,
    })
  })

  test("should fallback to first non-Error line when no external caller is found", () => {
    // Arrange
    const mockStack = `Error
    at mapControl (/Users/bob/code/uds/pepr-controls/controls/controls.ts:85:10)`

    // Act
    const result = extractCallerInfo(mockStack)

    // Assert
    expect(result).toEqual({
      file: "/Users/bob/code/uds/pepr-controls/controls/controls.ts",
      line: 85,
    })
  })

  test("should return undefined values when stack trace format is unexpected", () => {
    // Arrange
    const mockStack = `Error
    Invalid stack format
    Another line`

    // Act
    const result = extractCallerInfo(mockStack)

    // Assert
    expect(result).toEqual({
      file: undefined,
      line: undefined,
    })
  })

  test("should handle empty stack trace", () => {
    // Act
    const result = extractCallerInfo("")

    // Assert
    expect(result).toEqual({
      file: undefined,
      line: undefined,
    })
  })

  test("should handle stack trace with no line number", () => {
    // Arrange
    const mockStack = `Error
    at Object.<anonymous> (/Users/user/project/test.ts)
    at Module._compile (internal/modules/cjs/loader.js)`

    // Act
    const result = extractCallerInfo(mockStack)

    // Assert
    expect(result.file).toBe("/Users/user/project/test.ts")
    expect(result.line).toBeUndefined()
  })

  test("should handle exceptions during parsing", () => {
    // Arrange
    // Force an exception by passing an object that will cause an error when split is called
    const mockStack = null as unknown as string

    // Act
    const result = extractCallerInfo(mockStack)

    // Assert
    expect(result).toEqual({
      file: undefined,
      line: undefined,
    })
  })
})
