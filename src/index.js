const express = require("express");
const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());

const transactions = [];

function validateUid(request, response, next) {
  const { id } = request.params;

  if (!isUuid(id)) {
    return response
      .status(400)
      .json({ error: "Param sent is not a valid UUID" });
  }
  next();
}

function logRequests(request, response, next) {
  console.time("tempo");

  const { method, url } = request;

  const logLabel = `[${method.toUpperCase()}] ${url}`;

  next();

  console.log(logLabel);
  console.timeEnd("tempo");
}

app.use(logRequests);
app.use("/transactions/:id", validateUid);

app.get('/transactions', (request, response) => {
  const { title } = request.query;

  const results = title
    ? transactions.filter(transaction =>
      transaction.title.toLowerCase().includes(title.toLowerCase()))
    : transactions;

  return response.json(results);
});

app.post('/transactions', (request, response) => {
  const { title, value, type } = request.body;

  const transaction = { id: uuid(), title, value, type };

  transactions.push(transaction)

  return response.json(transaction);
});

app.put('/transactions/:id', (request, response) => {
  const { id } = request.params;
  const { title, value, type } = request.body;

  const transactionIndex = transactions.findIndex(transaction => transaction.id == id);

  if (transactionIndex < 0) {
    return response.status(400).json({ error: "Transaction not found" });
  }

  const transaction = {
    id,
    title,
    value,
    type
  };

  transactions[transactionIndex] = transaction;

  return response.json(transaction);
});

app.delete('/transactions/:id', (request, response) => {
  const { id } = request.params;
  const { title, value, type } = request.params;

  const transactionIndex = transactions.findIndex(transaction => transaction.id == id);

  if (transactionIndex < 0) {
    return response.status(400).json({ error: "transaction not found" });
  }

  transactions.splice(transactionIndex, 1);

  return response.status(204).send();
});

const port = 3333;
app.listen(port, () => {
  console.log(`Server up nd running on PORT ${port}`)
});
