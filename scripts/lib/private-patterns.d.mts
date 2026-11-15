/** Every finding in a text, as `[what, count]`; `served` adds the checks for what a browser gets. */
export declare function privateFindings(
  text: string,
  served?: boolean
): [what: string, count: number][];
