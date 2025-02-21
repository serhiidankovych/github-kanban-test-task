import React from "react";
import { useDraggable } from "@dnd-kit/core";
import IssueCard from "./IssueCard";
import { Issue } from "../types/types";

interface DraggableIssueProps {
  issue: Issue;
}

const DraggableIssue: React.FC<DraggableIssueProps> = ({ issue }) => {
  const { attributes, listeners, setNodeRef } = useDraggable({ id: issue.id });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={{ marginBottom: "10px", cursor: "grab" }}
    >
      <IssueCard issue={issue} />
    </div>
  );
};

export default DraggableIssue;
