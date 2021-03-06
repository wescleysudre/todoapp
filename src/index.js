const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  // Complete aqui
  const { username } = request.headers;

  const user = users.find(u => u.username === username);

  if(!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

function checksExistTodo(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(t => t.id === id);

  if (!todo) {
    return response.status(404).json({ error: "Todo not found" });
  }

  return next();

}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((c) => c.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }
  
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [] 
  }
  users.push(user)

  return response.status(201).json(user);

});

app.get('/users', (request, response) => {

  return response.status(200).json(users);

})

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
    const { title, deadline } = request.body;

    const { user } = request;

    const todo = {
      id: uuidv4(),
      title,
      done: false,
      deadline: new Date(deadline),
      created_at: new Date()
    }

    user.todos.push(todo);

    return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistTodo, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;

  const { user } = request;

  const todo = user.todos.find(t => t.id === id);

  todo.title = title;
  todo.deadline = new Date(deadline);

  return response.json(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistTodo, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(t => t.id === id);

  todo.done = true;

  return response.json(todo);

});

app.delete('/todos/:id', checksExistsUserAccount, checksExistTodo, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.find(t => t.id === id);

  user.todos.splice(todo, 1);

  return response.status(204).send();
});

module.exports = app;