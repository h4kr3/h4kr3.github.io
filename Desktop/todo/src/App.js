import "./App.css";
import Todo from "./components/Todo/Todo";
import NewTodo from "./components/NewTodo/NewTodo";
import Card from "./components/UI/Card";
import { useState } from "react";

const DUMMY_DATA = [
  {
    date: new Date(2020, 7, 14),
    todo: "sagittis placerat. Cras dictum ultricies ligula.",
  },
  {
    date: new Date(2022, 7, 14),
    todo: "sed pede nec",
  },
  {
    date: new Date(2020, 7, 14),
    todo: "fringilla ornare placerat,",
  },
  {
    date: new Date(2022, 7, 14),
    todo: "elit, pellentesque a, facilisis non, bibendum sed,",
  },
  {
    date: new Date(2022, 7, 14),
    todo: "Suspendisse dui. Fusce diam nunc, ullamcorper",
  },
];

function App() {
  const [todo,setTodo] = useState(DUMMY_DATA)
  const addTodoDataHandler = (todoData) => {
	setTodo(prevTodo => {
		return [todoData, ...prevTodo]
	})
  };

  return (
    <Card className="App">
      <NewTodo getTodoData={addTodoDataHandler} />
      <Todo props={todo} />
    </Card>
  );
}
export default App;
