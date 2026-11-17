import { describe, it, expect } from 'vitest'
import { resolveAssignmentEscapes } from './resolve-assignment-escapes.js'

describe('resolveAssignmentEscapes', () => {
  it.each([
    ['f=a\\-b; echo $f', "f='a-b'; echo $f"],
    ['f=\\-\\-x; echo $f', "f='--x'; echo $f"],
    ["f=a''b; echo $f", "f='ab'; echo $f"],
    ['f=a""b; echo $f', "f='ab'; echo $f"],
    ['f=a\'-\'"b"c; echo $f', "f='a-bc'; echo $f"],
    ['f="a\\"b"; echo $f', "f='a\"b'; echo $f"],
    ['f="a\\\\b"; echo $f', "f='a\\b'; echo $f"],
    ['f=a=b; echo $f', "f='a=b'; echo $f"],
    ['export f=a\\-b g=c\\d', "export f='a-b' g='cd'"],
    ['f=a\\ b', "f='a b'"],
  ])('rewrites %s', (input, expected) => {
    expect(resolveAssignmentEscapes(input)).toBe(expected)
  })

  it.each([
    'f=abc; echo $f',
    "f='a\\-b'; echo $f",
    'f="abc"; echo $f',
    'f="a\\-b"; echo $f',
    'f=a"$x"b; echo $f',
    'f=a`x`b; echo $f',
    'f=a$x; echo $f',
    "f=a\\'b; echo $f",
    "f='a; echo $f",
    'f="a; echo $f',
    'f=a\\\nb',
    'echo a\\-b',
  ])('leaves %s as written', input => {
    expect(resolveAssignmentEscapes(input)).toBe(input)
  })
})
