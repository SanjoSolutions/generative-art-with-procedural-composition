const TILE_LENGTH = 32

export interface Tile {
  row: number
  column: number
}

export type DistributionWithValue = Tile & {
  probability: number
}

export interface DistributionWithChildren {
  probability: number
  children?: Distribution[]
}

export type Distribution = DistributionWithValue | DistributionWithChildren

export interface Configuration {
  width: number
  height: number
  distributions: Distribution[]
}

export async function generate(configuration: Configuration) {
  const image = await loadImage("grass.png")
  const canvas = document.createElement("canvas")
  canvas.width = configuration.width * TILE_LENGTH
  canvas.height = configuration.height * TILE_LENGTH
  document.body.appendChild(canvas)
  const context = canvas.getContext("2d")!
  for (let row = 0; row < configuration.height; row++) {
    for (let column = 0; column < configuration.width; column++) {
      const tile = selectTile(configuration.distributions)
      if (tile) {
        context.drawImage(
          image,
          tile.column * TILE_LENGTH,
          tile.row * TILE_LENGTH,
          TILE_LENGTH,
          TILE_LENGTH,
          column * TILE_LENGTH,
          row * TILE_LENGTH,
          TILE_LENGTH,
          TILE_LENGTH,
        )
      }
    }
  }
}

function selectTile(configuration: Distribution[]): Tile | null {
  let options = configuration
  let distribution: Distribution | null
  do {
    distribution = selectRandomWeighted(options)
    options = distribution ? (distribution as any)?.children : null
  } while (options)
  return distribution as Tile | null
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, onError) => {
    const image = new Image()
    image.src = url
    image.onload = function () {
      resolve(image)
    }
    image.onerror = function (error) {
      onError(error)
    }
  })
}

function selectRandomWeighted(options: Distribution[]): Distribution | null {
  const random = Math.random()
  let accumulatedProbability = 0
  for (const option of options) {
    accumulatedProbability += option.probability
    if (random < accumulatedProbability) {
      return option
    }
  }
  return null
}
