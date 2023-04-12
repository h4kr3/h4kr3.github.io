import "./TodoFilter.css";

import React from "react";

export default function TodoFilter(props) {
  const todoFilterHandler = (event) => {
    props.selectYear(event.target.value)
  };
  return (
    <div className="todo-filter">
      <div className="todo-filter__control">
        <label>filter by year</label>
        <select onChange={todoFilterHandler}>
          <option value="2023" >
            2023
          </option>
          <option value="2020" >
            2020
          </option>
          <option value="2022" >
            2022
          </option>
          <option value="2022" >
            2022
          </option>
          <option value="2022" >
            2022
          </option>
        </select>
      </div>
    </div>
  );
}
