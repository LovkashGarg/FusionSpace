import React, { useState } from "react";
import { MdAddBox } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import { MdModeEdit } from "react-icons/md";
// Sample data
const initialTasks = [
  { id: 1, name: "Write the File Src.jsx", assignee: "Rahul", completed: false },
  { id: 2, name: "Solve error in Line 345", assignee: "Sahil", completed: true },
  { id: 3, name: "Run the Docker File for System", assignee: "Saroj", completed: false },
];

const TaskDashboard = () => {
  const [tasks, setTasks] = useState(initialTasks);

  // Toggle completed status
  const handleToggleCompleted = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };
  const addTask=()=>{
   const newtask={
    id:tasks.length+1,
    name:"Add a container",
    assignee:"Default",
    completed:false,
   }
    setTasks([...tasks,newtask]);
  }
  return (
    <div className="p-4 bg-slate-600 min-h-screen">
      <div className="w-[100%] flex justify-center items-center "><h2 className="text-3xl w-[60%] md:w-[30%] bg-green-500 rounded-lg font-semibold text-center mb-6 text-white h-[50px] ">Task List</h2></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-600  text-white p-4 rounded-lg shadow-md flex items-start gap-4 border border-gray-200"
          >
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => handleToggleCompleted(task.id)}
              className="h-5 w-5 text-green-500"
            />
            <div className="flex flex-col text-white">
              <h3 className={`text-lg font-medium ${task.completed ? "line-through text-white" : "text-white"}`}>
                {task.name}
              </h3>
              <p className="text-sm text-white">Task ID: {task.id}</p>
              <p className="text-sm text-white">Assigned to: {task.assignee}</p>
              <p className="text-sm text-white mt-1">
                {task.completed ? "Completed" : "In Progress"}
              </p>
              <div className='flex gap-4 mt-3 items-center justify-center '>
              <button className="bg-green-500 px-3 flex items-center justify-center gap-6 text-[25px] text-white rounded-lg" ><div>Edit Task</div><MdModeEdit/></button>
              <button className="bg-red-500 px-3 flex items-center justify-center gap-6 text-[25px] text-white rounded-lg" onClick={() => setTasks((tasks) => tasks.filter((alltask) => alltask !== task))}><div>Delete Task</div><MdDelete/></button>
            </div>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-5 w-[20%] fixed bottom-5 right-4">
      <button onClick={addTask} className="bg-green-500 flex items-center justify-center gap-6 text-[25px] text-white rounded-lg"><div>Add a Task</div><MdAddBox/></button>
      </div>
    </div>
  );
};

export default TaskDashboard;
