const express = require('express') // importiamo express
const cors = require('cors') // importiamo i cors
const mongoose = require('mongoose') // importiamo mongoose per poterci connettere al database

const app = express() // creiamo una web application di tipo express/nodejs
const port = 3001 // creiamo la porta Localhost numero 3001(non 3000 per non avere eventuali conflitti con React)
const dbName = 'PraticaM6W1D1' // nome del database che utilizzeremo

// Middlewares
app.use(cors()) // per abilitare le chiamate di modifica sull'API 
app.use(express.json()) // trasforma e ritrasforma gli oggetti in json

// definiamo lo schema del nostro database(lo schema della nostra collection)
const authorSchema = new mongoose.Schema({
  nome: {type: 'string', required: true},
  cognome: {type: 'string', required: true},
  email: {type: 'string', required: true},
  dataDiNascita: {type: 'string', required: true},
  avatar: {type: 'string', required: true}
})

// creiamo l'oggetto userModel per poter interagire con il database
const userModel = mongoose.model('Authors', authorSchema)

// creiamo i vari endpoint per le chiamate API
// chimata di tipo get la quale ci restituisce una pagina di default
app.get('/', (req, res) => {
  res.json({message: 'App connected!'})
})

// chiamata di tipo GET per ottenere gli TUTTI gli autori presenti nel server
app.get('/authors', async (req, res) => {
  const authors = await userModel.find() // comunico in lettura con il database per leggere TUTTO il suo contenuto
  res.status(200).json(authors) // restituisco al client il codice di avvenuta lettura e reperimento dei dati insieme al json degli autori
})

// chimata di tipo GET utilizzando l'id specifico di un autore
app.get('/authors/:id', async (req, res) => {
  const id = req.params.id
  try {
    const author = await userModel.findById(id)
    res.status(200).json(author)
  } catch(err) {
    res.status(500).json({error: err.message})
  }
})

// chiamata di tipo POST per aggiungere nuovi autori(stesso endpoint ma metodo(firma) diverso)
app.post('/authors', (req, res) => {
  const obj = req.body
  const newAuthor = new userModel(obj)
  const dbAuthor =  newAuthor.save()
  res.status(201).json(dbAuthor)
})

async function start() { // funzione asincrona per verificare il corretto collegamento del server prima di accenderlo
  try {
    await mongoose.connect('mongodb+srv://SPYRO8896:Cimice09@cluster0.0gca7zj.mongodb.net/' + dbName) // connettiamo node al server

    // invochiamo il metodo listen su app per accendere il server(una volta che riceviamo risposta positiva dal server)
    app.listen(port, () => {
      console.log(`app listening on port: ${port}`)
    })
  } catch(error) {
    console.error(error)
  }
}

start()

