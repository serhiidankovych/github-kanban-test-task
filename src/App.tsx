import "@ant-design/v5-patch-for-react-19";
import React from "react";
import { Provider } from "react-redux";
import { store } from "./store/store";
import KanbanBoard from "./componets/KanbanBoard";

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <div className="App">
        <KanbanBoard />
      </div>
    </Provider>
  );
};

export default App;
