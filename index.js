import { generate } from "./lib.js"

await generate({
  width: 20,
  height: 20,
  layers: [
    {
      distributions: [
        {
          probability: 0.3,
          children: [
            {
              probability: 0.1,
              value: {
                image: "grass.png",
                row: 5,
                column: 0,
              },
            },
            {
              probability: 0.3,
              value: {
                image: "grass.png",
                row: 5,
                column: 1,
              },
            },
            {
              probability: 0.6,
              value: {
                image: "grass.png",
                row: 5,
                column: 2,
              },
            },
          ],
        },
        {
          probability: 0.7,
          value: {
            image: "grass.png",
            row: 3,
            column: 1,
          },
        },
      ],
    },
    {
      occurrences: [
        {
          ratio: 0.2,
          value: {
            image: "water.png",
            type: "edgedTiles",
          },
        },
      ],
    },
  ],
})
