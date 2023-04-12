import React from "react";
import Card from "../UI/Card";
import "./TodoList.css";
import TodoDate from "./TodoDate";

export default function TodoList(props) {
  return (
    <Card className="todo-list">
      <div className="todo-list__date">
        <TodoDate date={props.date} />
      </div>
      <div className="todo-list__description">
        <h2 className="todo-list__description__subject">{props.todo}</h2>
      </div>
    </Card>
  );
}
