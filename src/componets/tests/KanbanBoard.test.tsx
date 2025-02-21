import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore, { MockStoreEnhanced } from "redux-mock-store";
import KanbanBoard from "../KanbanBoard";

// Mock for window.matchMedia
beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(), 
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});


const mockStore = configureStore<RootState>([]);

interface RootState {
  issues: {
    issues: unknown[]; 
    repoPath: string;
    stars: number;
    status: string;
    error: string | null;
  };
}

describe("KanbanBoard Component", () => {
  let store: MockStoreEnhanced<RootState, object>; 

  const initialState: RootState = {
    issues: {
      issues: [],
      repoPath: "",
      stars: 0,
      status: "idle",
      error: null,
    },
  };

  beforeEach(() => {
    store = mockStore(initialState);
  });

  it("renders KanbanBoard title", () => {
    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  it("allows input of GitHub repo URL", () => {
    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    const input = screen.getByPlaceholderText("Enter GitHub repo URL");
    fireEvent.change(input, {
      target: { value: "https://github.com/adrianhajdin/react-movies" },
    });

    expect(input).toHaveValue("https://github.com/adrianhajdin/react-movies");
  });

  it("disables load button while loading", () => {
    store = mockStore({
      issues: {
        ...initialState.issues,
        status: "loading",
      },
    });

    render(
      <Provider store={store}>
        <KanbanBoard />
      </Provider>
    );

    const button = screen.getByRole("button", { name: /Loading.../i });
    expect(button).toBeDisabled();
  });
});
