import { describe, it, expect } from 'vitest'
import { findAwkPrograms } from './find-awk-programs.js'

describe('findAwkPrograms', () => {
  it.each([
    [`awk 'BEGIN{system("git push")}'`, ['git push']],
    [`gawk -F: -v x=1 'BEGIN{system("git log")}' f`, ['git log']],
    [`awk -F , '{print "a"}' f`, ['a']],
    [`awk -vname=1 'BEGIN{system("git log")}'`, ['git log']],
    [`gawk --source='BEGIN{system("git log")}'`, ['git log']],
    [`gawk -i inplace -l ordchr -W posix '{print "a"}' f`, ['a']],
    [`awk --assign x=1 -- '{print "a"}'`, ['a']],
    [`gawk -f lib.awk -e 'BEGIN{system("git log")}'`, ['git log']],
    [`awk '{x=$1%$2; system("git log")}'`, ['git log']],
    [`gawk -e'BEGIN{system("git log")}'`, ['git log']],
    [`gawk --sou='BEGIN{system("git log")}'`, ['git log']],
    [`gawk --incl inplace --ass x=1 '{print "a"}' f`, ['a']],
    [`gawk -E prog.awk '{print "a"}'`, ['a']],
  ])('reads %s', (input, literals) => {
    expect(findAwkPrograms(input)).toEqual(literals)
  })

  it.each(['awk -F: "{print \\$1}" /etc/passwd', 'echo awk', 'ls -la'])(
    'finds nothing in %s',
    input => {
      expect(findAwkPrograms(input)).toEqual([])
    }
  )
})
