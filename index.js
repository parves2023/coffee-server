const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

app.use(cors({
  origin: 'https://simple-firebase-44285.web.app',  // Specify your frontend domain here
  methods: ['GET', 'POST', 'PUT', 'DELETE'],  // Adjust methods as needed
  allowedHeaders: ['Content-Type'],  // You can add more headers if needed
}));


// middleware
// app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.3tilc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
//  const uri = `mongodb+srv://parvesmosarof32:DuXEcEzgKc8D4wMY@cluster0.3tilc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
console.log(uri);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //insert a coffee
    const coffeeCollection = client.db("coffeeDB").collection("coffee");
    const userCollection = client.db("usersDB").collection("user");

    
    
    
    // chat related start
    const chatCollection = client.db("artDB").collection("chats");
    
// Insert a new chat message
app.post("/chat", async (req, res) => {
  const newMessage = req.body; // { username, message, timestamp }
  try {
    const result = await chatCollection.insertOne(newMessage);
    res.send(result);
  } catch (error) {
    console.error("Failed to insert chat message:", error);
    res.status(500).send({ message: "Failed to insert chat message." });
  }
});


// // Get all chat messages
app.get("/chat", async (req, res) => {
  try {
    const cursor = chatCollection.find(); // Fetch all documents from the 'chats' collection
    const chats = await cursor.toArray(); // Convert the cursor to an array
    res.send(chats); // Send the chat array to the client
  } catch (error) {
    console.error("Failed to retrieve chats:", error);
    res.status(500).send({ message: "Failed to retrieve chats." });
  }
});


// API to Delete All Chats
app.delete("/chat", async (req, res) => {
  try {
    const result = await chatCollection.deleteMany({}); // Delete all documents
    res.send({ message: "All chats deleted successfully!", result });
  } catch (error) {
    console.error("Failed to delete chats:", error);
    res.status(500).send({ message: "Failed to delete chats." });
  }
});














// API Endpoint to Delete a Specific Chat
app.delete("/chat/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const result = await chatCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 1) {
      res.send({ message: "Chat deleted successfully!" });
    } else {
      res.status(404).send({ message: "Chat not found." });
    }
  } catch (error) {
    console.error("Failed to delete chat:", error);
    res.status(500).send({ message: "Failed to delete chat." });
  }
});



// API Endpoint to Update a Specific Chat
app.put("/chat/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { message } = req.body; // Ensure you're getting the message
    const result = await chatCollection.updateOne(
      { _id: new ObjectId(id) },  // Find the chat by ID
      { $set: { message: message, timestamp: new Date().toISOString() } }  // Update message and timestamp
    );

    if (result.modifiedCount === 1) {
      res.send({ message: "Chat updated successfully!" });
    } else {
      res.status(404).send({ message: "Chat not found or not updated." });
    }
  } catch (error) {
    console.error("Failed to update chat:", error);
    res.status(500).send({ message: "Failed to update chat." });
  }
});

    // chat related end














    
    
    app.post("/coffee", async (req, res) => {
      const newCoffee = req.body;
      console.log(newCoffee);
      const result = await coffeeCollection.insertOne(newCoffee);
      res.send(result);
    });

    //get all coffee
    app.get('/coffee', async (req, res) => {
      try {
          const cursor = coffeeCollection.find();
          const result = await cursor.toArray();
          res.send(result);
      } catch (error) {
          console.error(error);
          res.status(500).send({ message: 'Failed to fetch coffee data', error });
      }
  });

    //get one coffee
    app.get("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);
      res.send(result);
    });

    //update coffee
    app.put("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updatedCoffee = req.body;

      const coffee = {
        $set: {
          name: updatedCoffee.name,
          quantity: updatedCoffee.quantity,
          supplier: updatedCoffee.supplier,
          taste: updatedCoffee.taste,
          category: updatedCoffee.category,
          details: updatedCoffee.details,
          photo: updatedCoffee.photo,
        },
      };

      const result = await coffeeCollection.updateOne(filter, coffee, options);
      res.send(result);
    });

    //delete coffee
    app.delete("/coffee/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);
      res.send(result);
    });

    // user related apis
    app.get("/user", async (req, res) => {
      const cursor = userCollection.find();
      const users = await cursor.toArray();
      res.send(users);
    });

    app.post("/user", async (req, res) => {
      const user = req.body;
      console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    });

    app.patch("/user", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = {
        $set: {
          lastLoggedAt: user.lastLoggedAt,
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.delete("/user/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get("/", (req, res) => {
  res.send("Coffee making server is running with git");
});

app.listen(port, () => {
  console.log(`Coffee Server is running on port: ${port}`);
});
