import React, { useState } from "react";
import { MdAddBox, MdDelete, MdModeEdit } from "react-icons/md";

const initialTasks = [
  {
    id: 1,
    name: "Write the File Src.jsx",
    assignee: "Rahul",
    completed: false,
  },
  {
    id: 2,
    name: "Solve error in Line 345",
    assignee: "Sahil",
    completed: true,
  },
  {
    id: 3,
    name: "Run the Docker File for System",
    assignee: "Saroj",
    completed: false,
  },
];

const TaskDashboard = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTaskName, setNewTaskName] = useState("");
  const [newAssignee, setNewAssignee] = useState("");

  const handleToggleCompleted = (taskId) => {
    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task.id === taskId ? { ...task, completed: !task.completed } : task,
      ),
    );
  };

  const [editTaskId, setEditTaskId] = useState(null);

  const addTask = () => {
    const name = newTaskName.trim();
    const assignee = newAssignee.trim();

    if (!name) return;

    if (editTaskId) {
      // EDIT MODE
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editTaskId ? { ...task, name, assignee } : task,
        ),
      );
      setEditTaskId(null);
    } else {
      // ADD MODE
      const newTask = {
        id: Date.now(),
        name,
        assignee: assignee || "Default",
        completed: false,
      };
      setTasks((prev) => [...prev, newTask]);
    }

    setNewTaskName("");
    setNewAssignee("");
  };

  const handleEdit = (task) => {
    setEditTaskId(task.id);
    setNewTaskName(task.name);
    setNewAssignee(task.assignee);
  };

  const deleteTask = (taskId) => {
    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
  };

  const completedCount = tasks.filter((task) => task.completed).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-2xl bg-slate-900 p-4 shadow-lg ring-1 ring-white/10 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Task Dashboard
              </h2>
              <p className="mt-1 text-sm text-slate-300">
                Manage tasks, assignees, and completion status.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:flex sm:items-center">
              <div className="rounded-xl bg-slate-800 px-4 py-3 text-center">
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-lg font-semibold">{tasks.length}</div>
              </div>
              <div className="rounded-xl bg-slate-800 px-4 py-3 text-center">
                <div className="text-xs text-slate-400">Completed</div>
                <div className="text-lg font-semibold">{completedCount}</div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="Task name"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-green-500"
            />
            <input
              type="text"
              value={newAssignee}
              onChange={(e) => setNewAssignee(e.target.value)}
              placeholder="Assignee"
              className="w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 outline-none placeholder:text-slate-500 focus:border-green-500"
            />
            <button
              onClick={addTask}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-medium text-white transition hover:bg-green-500 active:scale-[0.99]"
            >
              {editTaskId ? "Update Task" : "Add Task"}
              <MdAddBox size={22} />
            </button>
          </div>
        </div>

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900 p-10 text-center text-slate-300">
            No tasks available.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl bg-slate-900 p-5 shadow-lg ring-1 ring-white/10 transition hover:-translate-y-0.5 hover:ring-green-500/30"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleToggleCompleted(task.id)}
                      className="mt-1 h-5 w-5 accent-green-500"
                    />
                    <div>
                      <h3
                        className={`text-lg font-semibold leading-snug ${
                          task.completed
                            ? "line-through text-slate-400"
                            : "text-white"
                        }`}
                      >
                        {task.name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-400">
                        Task ID: {task.id}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${
                      task.completed
                        ? "bg-green-500/15 text-green-400"
                        : "bg-yellow-500/15 text-yellow-400"
                    }`}
                  >
                    {task.completed ? "Completed" : "In Progress"}
                  </span>
                </div>

                <div className="mb-5 rounded-xl bg-slate-800/80 p-3">
                  <p className="text-sm text-slate-300">
                    <span className="font-medium text-slate-100">
                      Assigned to:
                    </span>{" "}
                    {task.assignee}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => handleEdit(task)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500"
                  >
                    Edit Task <MdModeEdit size={22} />
                  </button>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 font-medium text-white transition hover:bg-red-500"
                  >
                    Delete <MdDelete size={22} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDashboard;
