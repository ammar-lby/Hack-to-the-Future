// Assumptions used to turn setup answers into a realistic month when there are no real transactions.
export const WEEKS_PER_MONTH = 52 / 12;
/** Small, fixed wobble so mock figures look like a real month rather than exact multiples. */
export const MOCK_VARIATION = { income: 0.97, food: 1.04, transport: 0.96 } as const;
