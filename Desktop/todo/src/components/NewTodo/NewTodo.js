import React from "react";
import "./NewTodo.css";
import Card from "../UI/Card";
import NewTodoForm from "./NewTodoForm";

export default function NewTodo(props) {
  const saveTodoDataHandler = (insertedTodoData) => {
    const todoData = {
      ...insertedTodoData,
      id: Math.floor(Math.random() * 10000000) + 1,
    };
    props.getTodoData(todoData);
  };

  return (
    <Card className="new-todo">
      <NewTodoForm onSaveTodoData={saveTodoDataHandler} />
    </Card>
  );
}
