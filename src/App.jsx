import { useEffect, useState } from "react";
import "./App.css";

const initialData = {
  projects: [
    {
      id: "p1",
      name: "Green Residency",
      client: "ABC Builders",
      location: "Pune",
      budget: 2500000,
      progress: 65,
      status: "Active",
    },
    {
      id: "p2",
      name: "Sharma House",
      client: "Ramesh Sharma",
      location: "Mangalore",
      budget: 2000000,
      progress: 40,
      status: "Active",
    },
  ],
  attendance: [],
  materials: [
    {
      id: "m1",
      projectId: "p1",
      name: "Cement",
      unit: "bags",
      quantity: 20,
      minStock: 25,
    },
  ],
  expenses: [
    {
      id: "e1",
      projectId: "p1",
      description: "Cement purchase",
      category: "Materials",
      amount: 12000,
      date: "2026-10-14",
    },
  ],
};

function App() {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem("buildtrack-data");
    return saved ? JSON.parse(saved) : initialData;
  });

  const [activePage, setActivePage] = useState("Dashboard");

  useEffect(() => {
    localStorage.setItem("buildtrack-data", JSON.stringify(data));
  }, [data]);

  const addProject = (project) => {
    setData((prev) => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
  };

  const updateProject = (id, changes) => {
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === id ? { ...p, ...changes } : p
      ),
    }));
  };

  const addAttendance = (record) => {
    setData((prev) => ({
      ...prev,
      attendance: [...prev.attendance, record],
    }));
  };

  const addMaterial = (material) => {
    setData((prev) => ({
      ...prev,
      materials: [...prev.materials, material],
    }));
  };

  const addExpense = (expense) => {
    setData((prev) => ({
      ...prev,
      expenses: [...prev.expenses, expense],
    }));
  };

  const totalBudget = data.projects.reduce(
    (sum, project) => sum + Number(project.budget),
    0
  );

  const totalExpenses = data.expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  const lowStock = data.materials.filter(
    (material) => Number(material.quantity) <= Number(material.minStock)
  );

  const pendingTasks = data.projects.filter(
    (project) => project.progress < 100
  ).length;

  return (
    <div className="app">
      <aside className="sidebar">
        <h1>BuildTrack</h1>
        <p className="subtitle">Construction Manager</p>

        <nav>
          {["Dashboard", "Projects", "Labour", "Materials", "Expenses"].map(
            (item) => (
              <button
                key={item}
                className={activePage === item ? "active" : ""}
                onClick={() => setActivePage(item)}
              >
                {item}
              </button>
            )
          )}
        </nav>
      </aside>

      <main className="main">
        <header>
          <h2>{activePage}</h2>
          <p>Construction project management</p>
        </header>

        {activePage === "Dashboard" && (
          <Dashboard
            data={data}
            totalBudget={totalBudget}
            totalExpenses={totalExpenses}
            lowStock={lowStock}
            pendingTasks={pendingTasks}
          />
        )}

        {activePage === "Projects" && (
          <Projects
            projects={data.projects}
            addProject={addProject}
            updateProject={updateProject}
          />
        )}

        {activePage === "Labour" && (
          <Labour
            projects={data.projects}
            attendance={data.attendance}
            addAttendance={addAttendance}
          />
        )}

        {activePage === "Materials" && (
          <Materials
            projects={data.projects}
            materials={data.materials}
            addMaterial={addMaterial}
          />
        )}

        {activePage === "Expenses" && (
          <Expenses
            projects={data.projects}
            expenses={data.expenses}
            addExpense={addExpense}
          />
        )}
      </main>
    </div>
  );
}

/* ================= DASHBOARD ================= */

function Dashboard({
  data,
  totalBudget,
  totalExpenses,
  lowStock,
  pendingTasks,
}) {
  return (
    <>
      <div className="cards">
        <div className="card">
          <span>Active Projects</span>
          <strong>{data.projects.length}</strong>
        </div>

        <div className="card">
          <span>Total Budget</span>
          <strong>₹{(totalBudget / 100000).toFixed(1)}L</strong>
        </div>

        <div className="card">
          <span>Total Expenses</span>
          <strong>₹{(totalExpenses / 100000).toFixed(1)}L</strong>
        </div>

        <div className="card warning">
          <span>Low Stock Items</span>
          <strong>{lowStock.length}</strong>
        </div>
      </div>

      <section className="panel">
        <h3>Project Progress</h3>

        {data.projects.map((project) => (
          <div className="project-row" key={project.id}>
            <div>
              <strong>{project.name}</strong>
              <span>{project.location || "Location not added"}</span>
            </div>

            <div className="progress-container">
              <div className="progress">
                <div style={{ width: `${project.progress}%` }} />
              </div>
              <span>{project.progress}%</span>
            </div>
          </div>
        ))}
      </section>

      <section className="panel">
        <h3>⚠️ Attention Required</h3>

        {lowStock.length > 0 ? (
          lowStock.map((material) => (
            <p key={material.id}>
              • {material.name} stock is low ({material.quantity}{" "}
              {material.unit} remaining).
            </p>
          ))
        ) : (
          <p>✓ No low-stock materials.</p>
        )}

        {totalExpenses > totalBudget && (
          <p className="danger">
            • Total expenses have exceeded the total project budget.
          </p>
        )}

        <p>• {pendingTasks} project(s) are still in progress.</p>
      </section>
    </>
  );
}

/* ================= PROJECTS ================= */

function Projects({ projects, addProject, updateProject }) {
  const [form, setForm] = useState({
    name: "",
    client: "",
    location: "",
    budget: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Project name is required.");
      return;
    }

    if (!form.budget || Number(form.budget) <= 0) {
      alert("Enter a valid budget.");
      return;
    }

    addProject({
      id: crypto.randomUUID(),
      name: form.name.trim(),
      client: form.client.trim(),
      location: form.location.trim(),
      budget: Number(form.budget),
      progress: 0,
      status: "Active",
    });

    setForm({
      name: "",
      client: "",
      location: "",
      budget: "",
    });
  };

  return (
    <>
      <section className="panel">
        <h3>+ Add Project</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <input
            placeholder="Project name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input
            placeholder="Client name"
            value={form.client}
            onChange={(e) => setForm({ ...form, client: e.target.value })}
          />

          <input
            placeholder="Location"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />

          <input
            type="number"
            placeholder="Budget ₹ *"
            value={form.budget}
            onChange={(e) => setForm({ ...form, budget: e.target.value })}
          />

          <button className="primary" type="submit">
            Add Project
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Projects</h3>

        {projects.map((project) => (
          <div className="list-item" key={project.id}>
            <div>
              <strong>{project.name}</strong>
              <small>
                {project.client || "No client"} •{" "}
                {project.location || "No location"}
              </small>
              <small>
                Budget: ₹{Number(project.budget).toLocaleString("en-IN")}
              </small>
            </div>

            <div className="progress-edit">
              <label>Progress: {project.progress}%</label>
              <input
                type="range"
                min="0"
                max="100"
                value={project.progress}
                onChange={(e) =>
                  updateProject(project.id, {
                    progress: Number(e.target.value),
                    status:
                      Number(e.target.value) === 100
                        ? "Completed"
                        : "Active",
                  })
                }
              />
            </div>
          </div>
        ))}
      </section>
    </>
  );
}

/* ================= LABOUR ================= */

function Labour({ projects, attendance, addAttendance }) {
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "",
    date: new Date().toISOString().split("T")[0],
    present: "",
    absent: "",
    note: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.projectId) {
      alert("Select a project.");
      return;
    }

    if (form.present === "" || Number(form.present) < 0) {
      alert("Enter workers present.");
      return;
    }

    if (form.absent === "" || Number(form.absent) < 0) {
      alert("Enter workers absent.");
      return;
    }

    const duplicate = attendance.find(
      (item) =>
        item.projectId === form.projectId && item.date === form.date
    );

    if (duplicate) {
      alert("Attendance for this project and date already exists.");
      return;
    }

    addAttendance({
      id: crypto.randomUUID(),
      projectId: form.projectId,
      date: form.date,
      present: Number(form.present),
      absent: Number(form.absent),
      note: form.note,
    });

    setForm({
      ...form,
      present: "",
      absent: "",
      note: "",
    });
  };

  return (
    <>
      <section className="panel">
        <h3>Record Labour Attendance</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <select
            value={form.projectId}
            onChange={(e) =>
              setForm({ ...form, projectId: e.target.value })
            }
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <input
            type="number"
            min="0"
            placeholder="Workers present"
            value={form.present}
            onChange={(e) => setForm({ ...form, present: e.target.value })}
          />

          <input
            type="number"
            min="0"
            placeholder="Workers absent"
            value={form.absent}
            onChange={(e) => setForm({ ...form, absent: e.target.value })}
          />

          <input
            placeholder="Note (optional)"
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
          />

          <button className="primary" type="submit">
            Save Attendance
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Recent Attendance</h3>

        {attendance.length === 0 ? (
          <p>No attendance records yet.</p>
        ) : (
          attendance.map((record) => {
            const project = projects.find(
              (p) => p.id === record.projectId
            );

            return (
              <div className="list-item" key={record.id}>
                <div>
                  <strong>{project?.name}</strong>
                  <small>{record.date}</small>
                </div>
                <div>
                  Present: <b>{record.present}</b> | Absent:{" "}
                  <b>{record.absent}</b>
                </div>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}

/* ================= MATERIALS ================= */

function Materials({ projects, materials, addMaterial }) {
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "",
    name: "",
    unit: "bags",
    quantity: "",
    minStock: "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Material name is required.");
      return;
    }

    if (form.quantity === "" || Number(form.quantity) < 0) {
      alert("Enter a valid quantity.");
      return;
    }

    if (form.minStock === "" || Number(form.minStock) < 0) {
      alert("Enter a minimum stock level.");
      return;
    }

    addMaterial({
      id: crypto.randomUUID(),
      projectId: form.projectId,
      name: form.name.trim(),
      unit: form.unit,
      quantity: Number(form.quantity),
      minStock: Number(form.minStock),
    });

    setForm({
      ...form,
      name: "",
      quantity: "",
      minStock: "",
    });
  };

  return (
    <>
      <section className="panel">
        <h3>+ Add Material</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <select
            value={form.projectId}
            onChange={(e) =>
              setForm({ ...form, projectId: e.target.value })
            }
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Material name *"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <select
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          >
            <option>bags</option>
            <option>kg</option>
            <option>tonnes</option>
            <option>litres</option>
            <option>pieces</option>
          </select>

          <input
            type="number"
            min="0"
            placeholder="Quantity"
            value={form.quantity}
            onChange={(e) =>
              setForm({ ...form, quantity: e.target.value })
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Minimum stock"
            value={form.minStock}
            onChange={(e) =>
              setForm({ ...form, minStock: e.target.value })
            }
          />

          <button className="primary" type="submit">
            Add Material
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Material Stock</h3>

        {materials.map((material) => {
          const project = projects.find(
            (p) => p.id === material.projectId
          );

          const low =
            Number(material.quantity) <= Number(material.minStock);

          return (
            <div className="list-item" key={material.id}>
              <div>
                <strong>{material.name}</strong>
                <small>{project?.name}</small>
              </div>

              <div className={low ? "stock-low" : "stock-ok"}>
                {material.quantity} {material.unit}
                {low ? " ⚠️ LOW" : " ✓"}
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

/* ================= EXPENSES ================= */

function Expenses({ projects, expenses, addExpense }) {
  const [form, setForm] = useState({
    projectId: projects[0]?.id || "",
    description: "",
    category: "Materials",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!form.description.trim()) {
      alert("Expense description is required.");
      return;
    }

    if (!form.amount || Number(form.amount) <= 0) {
      alert("Enter a valid expense amount.");
      return;
    }

    addExpense({
      id: crypto.randomUUID(),
      projectId: form.projectId,
      description: form.description.trim(),
      category: form.category,
      amount: Number(form.amount),
      date: form.date,
    });

    setForm({
      ...form,
      description: "",
      amount: "",
    });
  };

  const total = expenses.reduce(
    (sum, expense) => sum + Number(expense.amount),
    0
  );

  return (
    <>
      <section className="panel">
        <h3>+ Add Expense</h3>

        <form onSubmit={handleSubmit} className="form-grid">
          <select
            value={form.projectId}
            onChange={(e) =>
              setForm({ ...form, projectId: e.target.value })
            }
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <input
            placeholder="Expense description *"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value })
            }
          >
            <option>Materials</option>
            <option>Labour</option>
            <option>Transport</option>
            <option>Other</option>
          </select>

          <input
            type="number"
            min="1"
            placeholder="Amount ₹ *"
            value={form.amount}
            onChange={(e) =>
              setForm({ ...form, amount: e.target.value })
            }
          />

          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />

          <button className="primary" type="submit">
            Save Expense
          </button>
        </form>
      </section>

      <section className="panel">
        <h3>Total Expenses: ₹{total.toLocaleString("en-IN")}</h3>

        {expenses.map((expense) => {
          const project = projects.find(
            (p) => p.id === expense.projectId
          );

          return (
            <div className="list-item" key={expense.id}>
              <div>
                <strong>{expense.description}</strong>
                <small>
                  {project?.name} • {expense.category} • {expense.date}
                </small>
              </div>

              <strong>
                ₹{Number(expense.amount).toLocaleString("en-IN")}
              </strong>
            </div>
          );
        })}
      </section>
    </>
  );
}

export default App;