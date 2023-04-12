import "./Todo.css";

import React, { useState } from "react";
import TodoList from "./TodoList";
import TodoFilter from "./TodoFilter";

export default function Todo(props) {
  const [filterYear, setFilterYear] = useState("2020");

  const filterChangeHandler = (selectedYear) => {
    console.log("todo.js", selectedYear);
    setFilterYear(selectedYear);
  };

  const filteredTodo = props.props.filter((todo) => {
    return todo.date.getFullYear().toString() === filterYear;
  });

  return (
    <>
      <TodoFilter selectYear={filterChangeHandler} />
      {filteredTodo.length === 0 && <p>NO todo found</p>}
      {filteredTodo.length > 0 &&
        filteredTodo.map((todo, index) => (
          <TodoList key={index} date={todo.date} todo={todo.todo} />
        ))}
    </>
  );
}
