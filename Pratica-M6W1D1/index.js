const express = require('express') // importiamo express
const cors = require('cors') // importiamo i cors
const mongoose = require('mongoose') // importiamo mongoose per poterci connettere al database

const app = express() // creiamo una web application di tipo express/nodejs
const port = 3001 // creiamo la porta Localhost numero 3001(non 3000 per non avere eventuali conflitti con React)
const dbName = 'PraticaM6W1D1' // nome del database che utilizzeremo

// Middlewares
app.use(cors()) // per abilitare le chiamate di modifica sull'API 
app.use(express.json()) // trasforma e ritrasforma gli oggetti in json

// definiamo lo schema della nostra collection
const authorSchema = new mongoose.Schema({
  nome: {type: 'string', required: true},
  cognome: {type: 'string', required: true},
  email: {type: 'string', required: true},
  dataDiNascita: {type: 'string', required: true},
  avatar: {type: 'string', required: true}
})

// definiamo lo schema della nuova collection relativa ai posts
const posts = new mongoose.Schema({
  categoria: {type: 'string', required: true},
  titolo: {type: 'string', required: true},
  cover: {type: 'string', required: true},
  tempoDiLettura: {
    quantita: {type: 'number', required: true},
    unitaDiMisura: {type: 'string', required: true}
  },
  autore: {type: 'string', required: true},
  contenuto: {type: 'string', required: true}
})

// creiamo l'oggetto userModel per poter interagire con il database
const userModel = mongoose.model('Authors', authorSchema)

// creiamo l'oggetto userModelPosts sempre per interagire con il DB
const userModelPosts = mongoose.model('Posts', posts)

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

// chiamata di tipo PUT per modificare un autore
app.put('/authors/:id', async (req, res) => {
  const id = req.params.id
  const author = req.body
  try {
    const authorUpdated = await userModel.findByIdAndUpdate(id, author)
    res.status(200).json(authorUpdated)
  } catch(err) {
    res.status(500).json({message: `Error: ${err}`})
  }
})

// chiamata di tipo DELETE per eliminare un autore
app.delete('/authors/:id', async (req, res) => {
  const id = req.params.id
  try {
    await userModel.findByIdAndDelete(id)
    res.status(200).json({message: 'User deleted!'})
  } catch (err) {
    res.status(500).json({message: `Error: ${err}`})
  }
})

// ora implementiamo le operazioni di CRUD per quanto riguarda i posts
// chiamata di tipo GET per ottenere tutti i posts
app.get('/blogPosts', async (req, res) => {
  const posts = await userModelPosts.find()
  res.status(200).json(posts)
})

// chiamata di tipo GET per ottenere il post specifico di un autore
app.get('/blogPosts/:id', async (req, res) => {
  const id = req.params.id
  try {
    const post = await userModelPosts.findById(id)
    res.status(200).json(post)
  } catch(err) {
    res.status(500).json({error: err.message})
  }
})

// chiamata di tipo POST per inserire un nuovo commento
app.post('/blogPosts', (req, res) => {
  const obj = req.body
  const newPost = new userModelPosts(obj)
  const dbPost =  newPost.save()
  res.status(201).json(dbPost)
})

// chiamata di tipo PUT per modificare un commento
app.put('/blogPosts/:id', async (req, res) => {
  const id = req.params.id
  const body = req.body
  try {
    await userModelPosts.findByIdAndUpdate(id, body)
    res.status(200).json({message: 'Comment updated!'})
  } catch (err) {
    res.status(500).json({message: `Error: ${err}`})
  }
})

// chiamata di tipo DELETE per eliminare un commento
app.delete('/blogPosts/:id', async (req, res) => {
  const id = req.params.id
  try {
    await userModelPosts.findByIdAndDelete(id)
    res.status(200).json({message: 'Comment deleted!'})
  } catch (err) {
    res.status(500).json({message: `Error: ${err}`})
  }
  

})

// aggiungiamo funzionalità di paginazione per la ricerca degli autori
app.get('/paramsAuthors', async (req, res) => {
  // http://localhost:3001/paramsAuthors?page=1&size=3&order=nome
  // gestione dei parametri passati tramite query String
  const size = req.query.size// recuperiamo il valore di size dalla query String
  const page = (req.query.page - 1) * size// recuperiamo il valore di page dalla query String
  const order = req.query.order// recuperiamo il valore di order dalla query String

  // filtriamo i nostri dati
  const filteredAuthors = await userModel.find().sort({[order]: 1}).limit(size).skip(page)// andiamo a cercare i valori filtradoli al tempo stesso(con le nostre condizioni)
  return res.status(200).json(filteredAuthors)
})

// paginazione per i posts
app.get('/paramsPosts', async (req, res) => {
  // http://localhost:3001/paramsPosts?page=1&size=3&order=autore
  const size = req.query.size
  const page = (req.query.page - 1) * size
  const order = req.query.order

  // filtriamo i risultati
  const filteredPosts = await userModelPosts.find().sort({[order]: 1}).limit(size).skip(page)
  return res.status(200).json(filteredPosts)
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

