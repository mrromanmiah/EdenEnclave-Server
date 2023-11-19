const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
    origin: [
        'https://edenenclave-8ff8d.web.app',
        'https://edenenclave-8ff8d.firebaseapp.com'

    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jjwufqp.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

const logger = (req, res, next) => {
    console.log('log: info', req.method, req.url);
    next();
}
const verifyToken = (req, res, next) => {
    const token = req?.cookies?.token;
    if (!token) {
        return res.status(401).send({message: 'unauthorized access'});
    }
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({message: 'unauthorized access'});
        }
        req.user = decoded;
        next();
    });
    
}



async function run() {
    try {
        const serviceCollection = client.db('edenEnclave').collection('services');
        const bookingCollection = client.db('edenEnclave').collection('bookings');

        app.post('/jwt', logger, async(req, res) => {
            const user = req.body;
            console.log('user for token', user);
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '3h'})

            res.cookie('token', token, {
                httpOnly: true, 
                secure: true, 
                sameSite: 'none'
            })
            .send({success: true});
        })

        app.post('/logout', async(req, res) => {
            const user = req.body;
            console.log('logging out', user);
            res.clearCookie('token', {maxAge: 0}).send({success: true});
        });

        app.get('/services', async (req, res) => {
            const cursor = serviceCollection.find();
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/myServices',logger, async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        });

        app.get('/service/:id', async (req, res) => {
            const id = req.params.id || '';
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        app.get('/otherServices', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const cursor = serviceCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        }); 
        
        app.post('/services', async (req, res) => {
            const newService = req.body;
            const result = await serviceCollection.insertOne(newService);
            res.send(result);
        })

        app.get('/updateService/:id', async (req, res) => {
            const id = req.params.id || '';
            const query = { _id: new ObjectId(id) };
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })

        app.put('/updateService/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedService = req.body;
            const updateService = {
                $set: {
                    ServiceName: updatedService.ServiceName,
                    ServiceImage: updatedService.ServiceImage,
                    ServicePrice: updatedService.ServicePrice,
                    ServiceDescription: updatedService.ServiceDescription,
                    ServiceProviderImage: updatedService.ServiceProviderImage,
                    ServiceProviderName: updatedService.ServiceProviderName,
                    ServiceProviderLocation: updatedService.ServiceProviderLocation,
                    ServiceProviderEmail: updatedService.ServiceProviderEmail,
                    ShortDescription: updatedService.ShortDescription,
                    email: updatedService.email,
                    displayName: updatedService.displayName
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

        app.get('/myBookings', logger, verifyToken, async (req, res) => {
            console.log(req.query.email);
            console.log('token owner info', req.user);
            if(req.user.email !== req.query.email) {
                return res.status(403).send({message: 'forbidden access'})
            }
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

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBooking = req.body;
            const updateDoc = {
                $set: {
                    status: updatedBooking.status
                },
            };
            const result = await bookingCollection.updateOne(filter, updateDoc);
            res.send(result);

        })



        app.delete('/myBookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await bookingCollection.deleteOne(query);
            res.send(result);
        });

   
        await client.connect();      
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
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