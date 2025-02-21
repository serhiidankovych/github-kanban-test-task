import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { IssuesState, IssueFromAPI } from "../types/types";

const initialState: IssuesState = {
  issues: [],
  repoPath: "",
  stars: 0,
  status: "idle",
  error: null,
};

export const fetchIssues = createAsyncThunk(
  "issues/fetchIssues",
  async (repoUrl: string, { rejectWithValue }) => {
    try {
      const parts = repoUrl.replace("https://github.com/", "").split("/");
      const owner = parts[0];
      const repo = parts[1];

      if (!owner || !repo) {
        return rejectWithValue("Invalid repository URL format");
      }

      const [issuesResponse, repoResponse] = await Promise.all([
        axios.get<IssueFromAPI[]>(
          `https://api.github.com/repos/${owner}/${repo}/issues`
        ),
        axios.get(`https://api.github.com/repos/${owner}/${repo}`),
      ]);

      return {
        issues: issuesResponse.data,
        repoPath: `${owner}/${repo}`,
        stars: repoResponse.data.stargazers_count,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          return rejectWithValue("Repository not found");
        }
        if (error.response?.status === 403) {
          return rejectWithValue(
            "API rate limit exceeded. Please try again later."
          );
        }
        return rejectWithValue(
          error.response?.data?.message || "Failed to fetch repository data"
        );
      }
      return rejectWithValue("An unexpected error occurred");
    }
  }
);

const issuesSlice = createSlice({
  name: "issues",
  initialState,
  reducers: {
    resetError: (state) => {
      state.error = null;
      state.status = "idle";
    },
    resetState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIssues.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchIssues.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.issues = action.payload.issues;
        state.repoPath = action.payload.repoPath;
        state.stars = action.payload.stars;
        state.error = null;
      })
      .addCase(fetchIssues.rejected, (state, action) => {
        state.status = "failed";
        state.error = (action.payload as string) || "Failed to fetch issues";
        state.issues = [];
        state.repoPath = "";
        state.stars = 0;
      });
  },
});

export const { resetError, resetState } = issuesSlice.actions;
export default issuesSlice.reducer;
