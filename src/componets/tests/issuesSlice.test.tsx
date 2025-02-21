import reducer, { fetchIssues } from "../../store/issuesSlice";
import axios from "axios";
import { AnyAction } from "@reduxjs/toolkit";

jest.mock("axios");

const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("issuesSlice", () => {
  const initialState = {
    issues: [],
    repoPath: "",
    stars: 0,
    status: "idle",
    error: null,
  };

  it("should handle initial state", () => {
    expect(reducer(undefined, {} as AnyAction)).toEqual(initialState);
  });

  it("should handle successful fetchIssues", async () => {
    const mockIssues = [{ id: 1, title: "Issue 1" }];
    const mockRepo = { stargazers_count: 100 };

    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("/issues")) {
        return Promise.resolve({ data: mockIssues });
      }
      return Promise.resolve({ data: mockRepo });
    });

    const dispatch = jest.fn();
    const thunk = fetchIssues("https://github.com/owner/repo");
    await thunk(dispatch, () => initialState, undefined);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchIssues.pending.type })
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchIssues.fulfilled.type,
        payload: {
          issues: mockIssues,
          repoPath: "owner/repo",
          stars: 100,
        },
      })
    );
  });

  it("should handle invalid repo URL", async () => {
    const dispatch = jest.fn();
    const thunk = fetchIssues("invalid-url");
    await thunk(dispatch, () => initialState, undefined);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchIssues.rejected.type,
        payload: "Invalid repository URL format",
      })
    );
  });
});
