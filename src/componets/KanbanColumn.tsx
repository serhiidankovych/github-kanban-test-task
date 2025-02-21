import React from "react";
import { Typography } from "antd";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import Droppable from "./Droppable";
import DraggableIssue from "./DraggableIssue";
import { ColumnType, Issue } from "../types/types";

const { Title } = Typography;

interface KanbanColumnProps {
  title: ColumnType;
  issues: Issue[];
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ title, issues }) => {
  return (
    <div style={{ background: "#f4f4f4", padding: "10px", minHeight: "300px" }}>
      <Title style={{ margin: "10px" }} level={3}>
        {title}
      </Title>
      <Droppable id={title}>
        <SortableContext
          items={issues.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {issues.map((issue) => (
            <DraggableIssue key={issue.id} issue={issue} />
          ))}
        </SortableContext>
      </Droppable>
    </div>
  );
};

export default KanbanColumn;
