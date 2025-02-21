export const columns = ["To Do", "In Progress", "Done"] as const;
export type ColumnType = (typeof columns)[number];

export interface User {
  login: string;
}
export interface Issue {
  id: string;
  title: string;
  number: number;
  user: User;
  comments: number;
  created_at: string;
  column: ColumnType;
}

export interface IssueFromAPI {
  id: number;
  title: string;
  number: number;
  user?: User;
  comments: number | string;
  created_at: string;
  state: "open" | "closed";
}

export interface IssuesState {
  issues: IssueFromAPI[];
  repoPath: string;
  stars: number;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}
