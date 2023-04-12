import Card from '../UI/Card';
import './TodoDate.css'

import React from 'react'

export default function TodoDate(props) {
    const month = props.date.toLocaleString("en-US", { month: "long" });
    const day = props.date.toLocaleString("en-US", { month: "2-digit" });
    const year = props.date.getFullYear()
    console.log();
  return (
    <Card className="date">
      <div className="date__month">{month}</div>
      <div className="date__year">{year}</div>
      <div className="date__day">{day}</div>
    </Card>
  )
}
