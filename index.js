const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jjwufqp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const serviceCollection = client.db('edenEnclave').collection('services');
        const bookingCollection = client.db('edenEnclave').collection('bookings');

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })
        
        app.get('/myServices', async (req, res) => {
            const email = req.query.email; 
            const query = { email: email };      
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id || '';
            const query = {_id: new ObjectId(id)};
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        app.get('/updateService/:id', async (req, res) => {
            const id = req.params.id || '';
            const query = {_id: new ObjectId(id)};
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        app.put('/updateService/:id', async (req, res) => {
            const id = req.params.id;
            const filter = {_id: new ObjectId(id)};
            const options = {upsert: true};
            const updatedService = req.body;
            const updateService = {
                $set: {
                    ServiceName: updatedService.ServiceName, 
                    ServiceImage : updatedService.ServiceImage, 
                    ServicePrice : updatedService.ServicePrice, 
                    ServiceDescription : updatedService.ServiceDescription, 
                    ServiceProviderImage : updatedService.ServiceProviderImage, 
                    ServiceProviderName : updatedService.ServiceProviderName, 
                    ServiceProviderLocation : updatedService.ServiceProviderLocation,
                    ServiceProviderEmail : updatedService.ServiceProviderEmail,
                    ShortDescription : updatedService.ShortDescription,                   
                    email : updatedService.email,                   
                    displayName : updatedService.displayName                   
                }
            }
            const result = await serviceCollection.updateOne(filter, updateService, options);
            res.send(result);
        })

        app.delete('/myServices/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/myBookings', async (req, res) => {
            const email = req.query.email; 
            const query = { email: email };      
            const cursor = bookingCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/bookings', async (req, res) => {
            const cursor = bookingCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.post('/bookings', async (req, res) => {
            const bookService = req.body;
            const result = await bookingCollection.insertOne(bookService);
            res.send(result);
        }) 

        

        app.delete('/myBookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        });

        




        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('edenEnclave is running');
});

app.listen(port, () => {
    console.log(`edenEnclave server is listening on port: ${port}`);
});