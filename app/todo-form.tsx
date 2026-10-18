"use client";

import { useFormState } from "react-dom";
import { createTodoAction, type FormState } from "./actions";

const initialState: FormState = null;

export function TodoForm() {
  const [state, formAction] = useFormState(createTodoAction, initialState);

  return (
    <form className="create-form" action={formAction}>
      <input name="title" placeholder="Tusaale: akhri buug" required />
      <select name="priority" defaultValue="medium" aria-label="Priority">
        <option value="low">Low</option>
        <option value="medium">Medium</option>
        <option value="high">High</option>
      </select>
      <button type="submit">+ Ku dar hawl</button>
      {state && <p className="form-message" role="status">{state.message}</p>}
    </form>
  );
}
