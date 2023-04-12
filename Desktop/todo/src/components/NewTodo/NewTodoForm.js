import React, { useState } from "react";
import "./NewTodoForm.css";

export default function NewTodoForm(props) {
  const [todo, setTodo] = useState("");

  const dataChangeHandler = (event) => {
    setTodo(event.target.value);
  };
  const submitHandler = (event) => {
    event.preventDefault();
    const todoData = {
      todo: todo,
      date: new Date(),
    };
    props.onSaveTodoData(todoData)
    setTodo('')
  };

  return (
    <>
      <form onSubmit={submitHandler} className="todo-form">
        <label>add new todo</label>
        <input type="text" value={todo} onChange={dataChangeHandler} />
        <button type="submit">ADD TODO</button>
      </form>
    </>
  );
}
