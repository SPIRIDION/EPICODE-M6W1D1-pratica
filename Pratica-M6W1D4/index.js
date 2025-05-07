const express = require('express')// importiamo express(framework per gestire un server)
const cors = require('cors')// importiamo i cors(permette di ricevere chiamate ajax)
const mongoose = require('mongoose')// importiamo mongoose(per interagire con il database)

const app = express()
const port = 3001
const dbName = 'Lezione2'

// middlewares(per abilitare varie funzionalità)
app.use(cors)// per la gestione dei CORS
app.use(express.json())// per la gestione del formato JSON

// definizione dello schema degli oggetti della collection(gli oggetti devono tutti avere la stessa struttura)
const userSchema = new mongoose.Schema({
  name: {type: String, required: true},
  lastname: {type: String, required: true},
  city: {type: String, required: true},
  age: {type: Number, required: true},
  email: {type: String, required: true}
})

// creazione del model (oggetto che definisce la struttura del database e lo collega ad una collection)
const userModel = mongoose.model('users', userSchema)

// configuriamo le rotte per l'implementazione delle chiamate AJAX
app.get('/users', async (req, res) => {
  const users = await userModel.find()
  res.status(200).json(users)
})

app.get('/users/:id', async (req, res) => {
  const id = req.params.id
  try {// gestiamo eventuali errori per evitare che il server si spenga e per dare una risposta al client in caso di errore 
    const user = await userModel.findById(id)
    res.status(200).json(user)
  } catch(err) {
    res.status(500).json({error: err.message})
  }
})

app.post('/users', async (req, res) => {
  const obj = req.body// il client nel body invia l'oggetto
  const user = new userModel(obj)// l'oggetto viene preso e trasformato in un'altro con lo schema da noi desiderato
  const dbUser = await user.save()// lo si salva poi all'interno del DB e il DB ce lo restituisce completo, lo salviamo in una variabile(user)
  res.status(201).json(dbUser)// alla fine lo rispondiamo al client
})

app.put('/users/:id', async (req, res) => {
  const id = req.params.id
  const obj = req.body
  try {
    const userUpdate = await userModel.findByIdAndUpdate(id, obj)
    res.status(200).json(userUpdate)
  } catch(err) {
    res.status(500).json({error: err.message})
  }
})

app.delete('/users/:id', async (req, res) => {
  const id = req.params.id
  try {
    await userModel.findByIdAndDelete(id)
    res.status(200).json({message: 'User deleted!'})
  } catch(err) {
    res.status(500).json({error: err.message})
  }
})

// query MongoDB
// esempio di query string: http://localhost:3001/params?page=1&size=3&order=name
app.get('/users/params', async (req, res) => {
  console.log(req.query)

  const size = req.query.size
  const skip = (req.query.page -1) * size
  const prop = req.query.order

  // await userModel.find().limit(size).skip(page).sort({[prop]: 1})
  const filterUser = await userModel.find().sort({[prop]: 1}).limit(size).skip(skip)
  return res.status(200).json(filterUser)

})

// connessione al DB Mongo e avvio del server
async function connect() {
  
  try {
    await mongoose.connect('mongodb+srv://SPYRO8896:Cimice09@cluster0.0gca7zj.mongodb.net/' + dbName)
    app.listen(port, () => console.log(`Server attivo sulla porta: ${port}`))
  } catch(err) {
    console.error(err)
  }
}

connect()

