import { bulkTodosAction, searchTodosAction } from "./actions";
import { connectToDatabase } from "@/lib/mongodb";
import { Todo, type Priority, type TodoRecord } from "@/models/Todo";
import { TodoForm } from "./todo-form";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ query?: string; status?: string; message?: string }>;

function relativeTime(date: Date) {
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
  if (seconds < 60) return "hadda";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} daqiiqo kahor`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} saac kahor`;
  return `${Math.floor(seconds / 86400)} maalmood kahor`;
}

const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export default async function Home({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = params.query?.trim() ?? "";
  const status = ["active", "completed"].includes(params.status ?? "")
    ? params.status
    : "all";

  await connectToDatabase();

  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const filter = {
    ...(query ? { title: { $regex: escapedQuery, $options: "i" } } : {}),
    ...(status === "active" ? { completed: false } : {}),
    ...(status === "completed" ? { completed: true } : {}),
  };
  const todos = (await Todo.find(filter).lean()) as unknown as TodoRecord[];
  todos.sort(
    (a, b) =>
      priorityOrder[a.priority] - priorityOrder[b.priority] ||
      b.createdAt.getTime() - a.createdAt.getTime(),
  );

  return (
    <main className="todo-app">
      <header className="app-header">
        <div>
          <span className="eyebrow">QORSHEE · QABSO · DHAMMAYSTIR</span>
          <h1>Hawlahaaga, si fudud.</h1>
          <p>Hal meel ku maamul hawlaha maalin kasta.</p>
        </div>
        <span className="header-mark" aria-hidden="true">✓</span>
      </header>

      <section className="panel create-panel">
        <div className="section-heading">
          <div>
            <h2>Hawl cusub</h2>
            <p>Ku dar waxa aad rabto inaad qabato.</p>
          </div>
        </div>
        <TodoForm />
      </section>

      <section className="panel list-panel">
        <div className="section-heading">
          <div>
            <h2>Liiska hawlaha</h2>
            <p>Ku kala hormari muhiimadda ama ku raadi magaca.</p>
          </div>
          <span className="task-count">{todos.length} hawlood</span>
        </div>

        <form className="filter-form" action={searchTodosAction}>
          <input name="query" placeholder="Raadi hawl..." defaultValue={query} />
          <select name="status" defaultValue={status} aria-label="Xaaladda">
            <option value="all">Dhammaan</option>
            <option value="active">Aan dhammaan</option>
            <option value="completed">Dhammaaday</option>
          </select>
          <button type="submit">Raadi</button>
        </form>

        {params.message && <p className="notice">{params.message}</p>}
        {todos.length === 0 ? (
          <div className="empty-state">
            <span className="empty-mark" aria-hidden="true">✓</span>
            <p>Hawl lama helin.</p>
            <span>Halkan ayay hawlahaagu ka muuqan doonaan.</span>
          </div>
        ) : (
          <form action={bulkTodosAction}>
            <ul className="todo-list">
              {todos.map((todo) => (
                <li className={`todo-item${todo.completed ? " is-completed" : ""}`} key={todo._id.toString()}>
                  <label className="todo-label">
                    <input type="checkbox" name="ids" value={todo._id.toString()} />
                    <span className="todo-copy">
                      <span className="todo-title">{todo.title}</span>
                      <span className="todo-meta">
                        <span className={`priority-badge priority-${todo.priority}`}>
                          {todo.priority}
                        </span>
                        <span>{relativeTime(todo.createdAt)}</span>
                        {todo.updatedAt.getTime() !== todo.createdAt.getTime() && (
                          <span>la cusboonaysiiyay</span>
                        )}
                      </span>
                    </span>
                    {todo.completed && <span className="completed-badge">Dhammaatay</span>}
                  </label>
                </li>
              ))}
            </ul>
            <div className="bulk-actions">
              <button type="submit" name="operation" value="complete">
                Dhamaystir
              </button>
              <button type="submit" name="operation" value="incomplete">
                Dib u fur
              </button>
              <button className="delete-button" type="submit" name="operation" value="delete">
                Tirtir
              </button>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
