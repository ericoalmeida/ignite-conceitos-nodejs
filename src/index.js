const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { headers } = request;
  const { username } = headers;

  const user = users.find((user) => user.username === username);

  if(!user){
    return response.status(400).json({error: `user ${username} not found!`});
  };

  request.user = user;

  next();
}

app.post('/users', (request, response) => {
  const { body } = request;
  const { name, username } = body;

  const userAlreadyExists = users.some((user) => user.username === username);

  if(userAlreadyExists){
    return response.status(400).json({error: `user ${username} already exists!`});
  };

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  };
  
  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { headers } = request;
  const { username } = headers;

  const { todos } = users.find((user) => user.username === username);

  return response.status(200).json(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { body, headers } = request;
  const { title, deadline } = body;
  const { username } = headers;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  const { todos } = users.find((user) => user.username === username);

  todos.push(todo);

  return response.status(201).json(todo);  
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { body, headers, params } = request;
  const { username } = headers;
  const { id } = params;
  const { title, deadline } = body;

  const { todos } = users.find((user) => user.username === username);

  const todoExists = todos.some((todo) => todo.id === id);
  
  if(!todoExists){
    return response.status(404).json({error: 'Todo not found!'});
  }

  const todoIndex = todos.findIndex((todo) => todo.id === id);

  todos[todoIndex].title = title;
  todos[todoIndex].deadline = deadline;

  return response.json(todos[todoIndex]); 
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { headers, params } = request;
  const { username } = headers;
  const { id } = params;

  const { todos } = users.find((user) => user.username === username);

  const todoExists = todos.some((todo) => todo.id === id);
  
  if(!todoExists){
    return response.status(404).json({error: 'Todo not found!'});
  }

  const todoIndex = todos.findIndex((todo) => todo.id === id);

  todos[todoIndex].done = true;

  return response.json(todos[todoIndex]); 
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  // Complete aqui
});

module.exports = app;