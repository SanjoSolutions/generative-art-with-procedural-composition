const TILE_LENGTH = 32

export interface Tile {
  image: string
  row: number
  column: number
}

export interface EdgedTiles {
  image: string
  type: "edgedTiles"
}

export type DistributionValue = Tile | EdgedTiles

export interface DistributionWithValue {
  probability: number
  value: DistributionValue
}

export interface Occurrence {
  ratio: number
  value: DistributionValue
}

export interface DistributionWithChildren {
  probability: number
  children?: Distribution[]
}

export type Distribution = DistributionWithValue | DistributionWithChildren

export interface Layer {
  distributions?: Distribution[]
  occurrences?: Occurrence[]
}

export interface Configuration {
  width: number
  height: number
  layers: Layer[]
}

export interface Position {
  row: number
  column: number
}

export async function generate(configuration: Configuration) {
  const imageCache = new Map<string, HTMLImageElement>()

  async function retrieveImage(url: string): Promise<HTMLImageElement> {
    const cachedImage = imageCache.get(url)
    if (cachedImage) {
      return cachedImage
    } else {
      const image = await loadImage(url)
      imageCache.set(url, image)
      return image
    }
  }

  const canvas = document.createElement("canvas")
  canvas.width = configuration.width * TILE_LENGTH
  canvas.height = configuration.height * TILE_LENGTH
  document.body.appendChild(canvas)
  const context = canvas.getContext("2d")!

  type GridCellType = DistributionValue | null

  for (const layer of configuration.layers) {
    const grid: GridCellType[] = new Array(
      configuration.height * configuration.width,
    )

    function setCell(position: Position, value: GridCellType): void {
      if (isValidPosition(position)) {
        grid[calculateIndex(position)] = value
      }
    }

    function calculateIndex(position: Position): number {
      return position.row * configuration.width + position.column
    }

    function retrieveCell(position: Position): GridCellType {
      return isValidPosition(position) ? grid[calculateIndex(position)] : null
    }

    function isValidPosition(position: Position): boolean {
      return (
        position.row >= 0 &&
        position.row < configuration.height &&
        position.column >= 0 &&
        position.column < configuration.width
      )
    }

    if (layer.distributions) {
      for (let row = 0; row < configuration.height; row++) {
        for (let column = 0; column < configuration.width; column++) {
          if (!retrieveCell({ row, column })) {
            const tile = selectTile(layer.distributions)
            setCell({ row, column }, tile)
          }
        }
      }
    }

    if (layer.occurrences) {
      for (const occurrence of layer.occurrences) {
        // Calculate the number of cells that should be occupied by occurrences
        const numOccurrences = Math.round(
          configuration.width * configuration.height * occurrence.ratio,
        )

        let numberOfCellsWithOccurrence = 0

        while (numberOfCellsWithOccurrence < numOccurrences) {
          // Generate a random position for the top-left corner of the occurrence
          const topLeftPosition = {
            row: randomInteger(0, configuration.height - 2),
            column: randomInteger(0, configuration.width - 2),
          }

          // Generate a random width and height for the occurrence
          const maxWidth = configuration.width - topLeftPosition.column
          const width = randomInteger(
            2,
            Math.max(
              2,
              Math.min((numOccurrences - numberOfCellsWithOccurrence) / 2),
              maxWidth,
            ),
          )
          const maxHeight = configuration.height - topLeftPosition.row
          const height = randomInteger(
            2,
            Math.max(
              2,
              Math.min(
                Math.floor(
                  (numOccurrences - numberOfCellsWithOccurrence) / width,
                ),
                maxHeight,
              ),
            ),
          )

          // Omit overlapping occurrences
          let isOverlapping = false
          for (
            let row = topLeftPosition.row;
            row < topLeftPosition.row + height;
            row++
          ) {
            for (
              let column = topLeftPosition.column;
              column < topLeftPosition.column + width;
              column++
            ) {
              if (retrieveCell({ row, column })) {
                isOverlapping = true
                break
              }
            }
            if (isOverlapping) {
              break
            }
          }

          if (!isOverlapping) {
            // Mark the cells within the occurrence as "occurrence"
            for (
              let row = topLeftPosition.row;
              row < topLeftPosition.row + height;
              row++
            ) {
              for (
                let column = topLeftPosition.column;
                column < topLeftPosition.column + width;
                column++
              ) {
                let row2: number
                let column2: number
                if (
                  row === topLeftPosition.row &&
                  column === topLeftPosition.column
                ) {
                  row2 = 2
                  column2 = 0
                } else if (
                  row === topLeftPosition.row &&
                  column > topLeftPosition.column &&
                  column < topLeftPosition.column + width - 1
                ) {
                  row2 = 2
                  column2 = 1
                } else if (
                  row === topLeftPosition.row &&
                  column === topLeftPosition.column + width - 1
                ) {
                  row2 = 2
                  column2 = 2
                } else if (
                  row > topLeftPosition.row &&
                  row < topLeftPosition.row + height - 1 &&
                  column === topLeftPosition.column
                ) {
                  row2 = 3
                  column2 = 0
                } else if (
                  row > topLeftPosition.row &&
                  row < topLeftPosition.row + height - 1 &&
                  column > topLeftPosition.column &&
                  column < topLeftPosition.column + width - 1
                ) {
                  row2 = 3
                  column2 = 1
                } else if (
                  row > topLeftPosition.row &&
                  row < topLeftPosition.row + height - 1 &&
                  column === topLeftPosition.column + width - 1
                ) {
                  row2 = 3
                  column2 = 2
                } else if (
                  row === topLeftPosition.row + height - 1 &&
                  column === topLeftPosition.column
                ) {
                  row2 = 4
                  column2 = 0
                } else if (
                  row === topLeftPosition.row + height - 1 &&
                  column > topLeftPosition.column &&
                  column < topLeftPosition.column + width - 1
                ) {
                  row2 = 4
                  column2 = 1
                } else if (
                  row === topLeftPosition.row + height - 1 &&
                  column === topLeftPosition.column + width - 1
                ) {
                  row2 = 4
                  column2 = 2
                }
                const tile = {
                  image: occurrence.value.image,
                  row: row2!,
                  column: column2!,
                }
                setCell({ row, column }, tile)
              }
            }

            numberOfCellsWithOccurrence += width * height
          }
        }
      }
    }

    for (let row = 0; row < configuration.height; row++) {
      for (let column = 0; column < configuration.width; column++) {
        const tile = retrieveCell({ row, column }) as Tile | null
        if (tile) {
          const image = await retrieveImage(tile.image)
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
}

function selectTile(configuration: Distribution[]): DistributionValue | null {
  let options = configuration
  let distribution: Distribution | null
  do {
    distribution = selectRandomWeighted(options)
    options = distribution ? (distribution as any)?.children : null
  } while (options)
  return distribution ? (distribution as DistributionWithValue).value : null
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

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
