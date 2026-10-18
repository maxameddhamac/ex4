"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { connectToDatabase } from "@/lib/mongodb";
import { Todo, type Priority } from "@/models/Todo";

export type FormState = { message: string; error?: boolean } | null;

const priorities: Priority[] = ["low", "medium", "high"];

export async function createTodoAction(
  _previousState: FormState,
  formData: FormData,
): Promise<FormState> {
  const title = String(formData.get("title") ?? "").trim();
  const priority = String(formData.get("priority") ?? "medium") as Priority;

  if (!title) return { message: "Fadlan qor hawsha.", error: true };
  if (!priorities.includes(priority)) {
    return { message: "Priority-ga la doortay sax ma aha.", error: true };
  }

  try {
    await connectToDatabase();
    await Todo.create({ title, priority });
    revalidatePath("/");
    return { message: "Hawsha waa lagu daray." };
  } catch (error) {
    console.error("Failed to create todo:", error);
    return { message: "Hawsha lama kaydin. Hubi MONGODB_URI.", error: true };
  }
}

export async function searchTodosAction(formData: FormData) {
  const params = new URLSearchParams();
  const query = String(formData.get("query") ?? "").trim();
  const status = String(formData.get("status") ?? "all");

  if (query) params.set("query", query);
  if (["all", "active", "completed"].includes(status)) params.set("status", status);

  redirect(params.size ? `/?${params.toString()}` : "/");
}

export async function bulkTodosAction(formData: FormData) {
  const ids = formData.getAll("ids").map(String).filter((id) => /^[a-f\d]{24}$/i.test(id));
  const operation = String(formData.get("operation") ?? "");

  if (!ids.length) {
    redirect(`/?message=${encodeURIComponent("Dooro ugu yaraan hal hawl.")}`);
  }

  await connectToDatabase();
  if (operation === "delete") {
    await Todo.deleteMany({ _id: { $in: ids } });
  } else if (operation === "complete" || operation === "incomplete") {
    await Todo.updateMany(
      { _id: { $in: ids } },
      { $set: { completed: operation === "complete" } },
    );
  } else {
    redirect("/");
  }

  revalidatePath("/");
  redirect("/");
}
