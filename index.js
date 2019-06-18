function ready (fn) {
  if (document.attachEvent
    ? document.readyState === 'complete'
    : document.readyState !== 'loading') {
    fn()
  } else {
    document.addEventListener('DOMContentLoaded', fn)
  }
}

ready(() => {
  const el = document.getElementById('notes')
  el.addEventListener('change', (event) => {
    const {value} = event.target

    const data = getData(value)

    const headers = {
      income: 'INGRESO',
      outcome: 'EGRESO',
      usd: 'USD',
      cop: 'COP',
      ves: 'VES',
      date: 'FECHA',
      description: 'DESCRIPCIÓN',
      category: 'CATEGORÍA',
    }

    const title = document.getElementById('title').value

    exportCSVFile(headers, data, title || 'finances-from-telegram')
  })
})

function getData (text) {
  // Split by messages
  const lines = text.split('\n\n')

  // Take only the messages with the suggested format
  const linesWithInfoOfInterest = lines.map(line => line.split('\n')).
                                        filter(line => line.length === 2).
                                        filter((line) => {
                                          const [amount, currency] = line[1].split(
                                            ' ')
                                          console.log({amount, currency})
                                          return Number(amount) && currency
                                        })

  // Create the final object
  const linesWithoutUnNecessaryInfo = linesWithInfoOfInterest.map(line => {
    const firstElement = line[0].split(',')[1]
    const dateWithHour = firstElement.trim().substr(1, firstElement.length - 3)
    const dateWithDots = dateWithHour.split(' ')[0]

    const date = dateWithDots.split('.').join('/')

    let secondElement = line[1].split(' - ').map(el => el.trim())

    console.log({secondElement})
    let [amount, currency] = secondElement[0].split(' ')
    currency = currency.toLowerCase()

    let description

    if (secondElement.length === 2) {
      description = secondElement[1].trim()
    } else {
      [amount, ...rest] = line[1].split(' ').map(el => el.trim())
      description = rest.join(' ')
    }

    return {
      income: amount,
      outcome: amount,
      usd: currency === 'usd',
      cop: currency === 'cop',
      ves: currency === 'ves',
      date,
      description,
      category: '',
    }
  })

  console.log({lines, linesWithInfoOfInterest, linesWithoutUnNecessaryInfo})

  return linesWithoutUnNecessaryInfo
}
