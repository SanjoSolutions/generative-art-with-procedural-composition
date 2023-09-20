const TILE_LENGTH = 32

export async function generate(configuration) {
  const image = await loadImage("grass.png")
  const canvas = document.createElement("canvas")
  canvas.width = configuration.width * TILE_LENGTH
  canvas.height = configuration.height * TILE_LENGTH
  document.body.appendChild(canvas)
  const context = canvas.getContext("2d")
  for (let row = 0; row < configuration.height; row++) {
    for (let column = 0; column < configuration.width; column++) {
      const tile = selectTile(configuration.distributions)
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

function selectTile(configuration) {
  let options = configuration
  let tile
  do {
    tile = selectRandomWeighted(options)
    options = tile?.children
  } while (options)
  return tile
}

function loadImage(url) {
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

function selectRandomWeighted(options) {
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
