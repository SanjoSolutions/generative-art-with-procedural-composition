import { generate } from "./lib.js"

await generate({
  width: 20,
  height: 20,
  distributions: [
    {
      probability: 0.3,
      children: [
        {
          probability: 0.1,
          row: 5,
          column: 0,
        },
        {
          probability: 0.3,
          row: 5,
          column: 1,
        },
        {
          probability: 0.6,
          row: 5,
          column: 2,
        },
      ],
    },
    {
      probability: 0.7,
      row: 3,
      column: 1,
    },
  ],
})
